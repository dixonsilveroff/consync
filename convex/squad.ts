import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";

const DEFAULT_SQUAD_BASE_URL = "https://sandbox-api-d.squadco.com";
const DEFAULT_SQUAD_REQUERY_PATH = "/transaction/verify";

type SquadResponse<T> = {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
};

function getSquadBaseUrl(): string {
  return process.env.SQUAD_BASE_URL || DEFAULT_SQUAD_BASE_URL;
}

function getSquadRequeryPath(): string {
  return process.env.SQUAD_REQUERY_PATH || DEFAULT_SQUAD_REQUERY_PATH;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConvexError(`${key} is not set`);
  }
  return value;
}

async function squadRequest<T>(path: string, body: Record<string, unknown>): Promise<SquadResponse<T>> {
  const secretKey = requireEnv("SQUAD_SECRET_KEY");
  const response = await fetch(`${getSquadBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ConvexError(`Squad API error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as SquadResponse<T>;
}

function makeEscrowRef(projectId: string): string {
  return `CSYNC_FUND_${projectId}_${Date.now()}`;
}

function makeTransferRef(merchantId: string, milestoneId: string): string {
  return `${merchantId}_${milestoneId}_${Date.now()}`;
}

function extractStatus(response: SquadResponse<Record<string, unknown>>): string | null {
  const data = response.data ?? {};
  const statusValue =
    (data as { transaction_status?: string }).transaction_status ||
    (data as { status?: string }).status ||
    (data as { transactionStatus?: string }).transactionStatus;
  return statusValue ? String(statusValue) : null;
}

function extractGatewayRef(response: SquadResponse<Record<string, unknown>>): string | undefined {
  const data = response.data ?? {};
  const gatewayRef =
    (data as { gateway_ref?: string }).gateway_ref ||
    (data as { gatewayRef?: string }).gatewayRef;
  return gatewayRef ? String(gatewayRef) : undefined;
}

/**
 * Contractor bank onboarding: verify account and store details.
 */
export const verifyAndSaveBankDetails = action({
  args: {
    bankCode: v.string(),
    bankAccountNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.currentUser, {});
    if (!user) {
      throw new ConvexError("User profile not found");
    }
    if (user.role !== "contractor") {
      throw new ConvexError("Only contractors can add bank details");
    }

    const lookup = await squadRequest<{ account_name: string; account_number: string }>(
      "/payout/account/lookup",
      {
        bank_code: args.bankCode,
        account_number: args.bankAccountNumber,
      }
    );

    if (!lookup.success || !lookup.data?.account_name) {
      throw new ConvexError("Unable to verify bank account details");
    }

    await ctx.runMutation(internal.users.saveContractorBankDetails, {
      userId: user._id,
      bankCode: args.bankCode,
      bankAccountNumber: args.bankAccountNumber,
      bankAccountName: lookup.data.account_name,
    });

    return { accountName: lookup.data.account_name };
  },
});

/**
 * Owner initiates escrow funding via Squad checkout.
 */
export const initiateEscrowPayment = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args): Promise<{ checkoutUrl: string; transactionRef: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const project = await ctx.runQuery(api.projects.getProject, {
      projectId: args.projectId,
    });
    if (!project) {
      throw new ConvexError("Project not found");
    }
    if (project.ownerClerkId !== identity.subject) {
      throw new ConvexError("Only the project owner can fund escrow");
    }
    if (project.status !== "PENDING_FUNDING") {
      throw new ConvexError("Project is already funded");
    }

    const user = await ctx.runQuery(api.users.currentUser, {});
    if (!user?.email) {
      throw new ConvexError("Owner profile missing email");
    }

    const appBaseUrl = requireEnv("APP_BASE_URL");
    const transactionRef = makeEscrowRef(args.projectId);

    const payload = {
      amount: project.totalValueKobo,
      email: user.email,
      currency: "NGN",
      initiate_type: "inline",
      transaction_ref: transactionRef,
      customer_name: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
      callback_url: `${appBaseUrl}/owner/projects/${args.projectId}?funded=true`,
      payment_channels: ["card", "bank", "ussd", "transfer"],
      metadata: {
        project_id: args.projectId,
        transaction_type: "ESCROW_FUNDING",
      },
    };

    const response = await squadRequest<{ checkout_url: string }>(
      "/transaction/initiate",
      payload
    );

    if (!response.data?.checkout_url) {
      throw new ConvexError("Squad did not return a checkout URL");
    }

    await ctx.runMutation(internal.payments.createPayment, {
      projectId: args.projectId,
      milestoneId: null,
      type: "ESCROW_FUNDING",
      amountKobo: project.totalValueKobo,
      squadTransactionRef: transactionRef,
      checkoutUrl: response.data.checkout_url,
    });

    await ctx.scheduler.runAfter(2 * 60 * 1000, internal.squad.requeryEscrowPayment, {
      transactionRef,
      attempt: 0,
    });

    return { checkoutUrl: response.data.checkout_url, transactionRef };
  },
});

/**
 * Internal: fallback requery in case webhook is delayed.
 */
export const requeryEscrowPayment = internalAction({
  args: {
    transactionRef: v.string(),
    attempt: v.number(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.runQuery(internal.payments.getPaymentByTransactionRef, {
      transactionRef: args.transactionRef,
    });

    if (!payment || payment.type !== "ESCROW_FUNDING") {
      return;
    }

    if (payment.status !== "INITIATED") {
      return;
    }

    const response = await squadRequest<Record<string, unknown>>(
      getSquadRequeryPath(),
      {
        transaction_ref: args.transactionRef,
      }
    );

    const status = extractStatus(response);
    if (status) {
      await ctx.runMutation(api.webhooks.handleSquadWebhook, {
        event: "requery",
        transactionRef: args.transactionRef,
        gatewayRef: extractGatewayRef(response),
        amountKobo: payment.amountKobo,
        status,
      });
      return;
    }

    const retryDelaysMs = [5 * 60 * 1000, 15 * 60 * 1000, 30 * 60 * 1000];
    const nextDelay = retryDelaysMs[args.attempt];
    if (nextDelay) {
      await ctx.scheduler.runAfter(nextDelay, internal.squad.requeryEscrowPayment, {
        transactionRef: args.transactionRef,
        attempt: args.attempt + 1,
      });
    }
  },
});

/**
 * Internal: create Squad virtual account for project escrow.
 */
export const setupVirtualAccount = internalAction({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(internal.projectsData.getProjectById, {
      projectId: args.projectId,
    });

    if (!project) {
      throw new ConvexError("Project not found");
    }

    const customerIdentifier = `CSYNC_${args.projectId}`;

    const payload = {
      customer_identifier: customerIdentifier,
      first_name: "Project",
      last_name: "Escrow",
      middle_name: "ConSync",
      mobile_num: "08000000000",
      email: `escrow+${args.projectId}@consync.io`,
      bvn: "22222222222",
      dob: "01/01/1990",
      address: project.location || "ConSync Platform",
      gender: "1",
      beneficiary_account: "",
    };

    const response = await squadRequest<{ virtual_account_number: string }>(
      "/virtual-account",
      payload
    );

    if (!response.data?.virtual_account_number) {
      throw new ConvexError("Squad did not return a virtual account number");
    }

    await ctx.runMutation(internal.projectsData.setProjectVirtualAccount, {
      projectId: args.projectId,
      squadVirtualAccountNumber: response.data.virtual_account_number,
      squadCustomerIdentifier: customerIdentifier,
    });
  },
});

/**
 * Internal: release milestone payment via Squad transfer API.
 */
export const releaseMilestonePayment = internalAction({
  args: {
    milestoneId: v.id("milestones"),
    amountKobo: v.number(),
    bankCode: v.string(),
    bankAccountNumber: v.string(),
    bankAccountName: v.string(),
    transactionRef: v.string(),
  },
  handler: async (ctx, args) => {
    const merchantId = requireEnv("SQUAD_MERCHANT_ID");
    const hasMerchantPrefix = args.transactionRef.startsWith(`${merchantId}_`);
    const transferRef = hasMerchantPrefix
      ? args.transactionRef
      : makeTransferRef(merchantId, args.milestoneId);

    await ctx.runMutation(internal.payments.updatePaymentRef, {
      currentRef: args.transactionRef,
      newRef: transferRef,
    });

    const lookup = await squadRequest<{ account_name: string }>(
      "/payout/account/lookup",
      {
        bank_code: args.bankCode,
        account_number: args.bankAccountNumber,
      }
    );

    if (!lookup.data?.account_name) {
      throw new ConvexError("Unable to verify contractor bank account");
    }

    const payload = {
      transaction_reference: transferRef,
      amount: args.amountKobo,
      bank_code: args.bankCode,
      account_number: args.bankAccountNumber,
      account_name: lookup.data.account_name,
      currency_id: "NGN",
      remark: `ConSync milestone ${args.milestoneId}`,
    };

    await squadRequest("/payout/transfer", payload);
  },
});
