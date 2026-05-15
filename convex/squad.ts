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
 * Build a pool of Dynamic Virtual Accounts. Run this once during setup.
 */
export const buildDvaPool = action({
  args: { count: v.number() },
  handler: async (ctx, { count }) => {
    const results = [];
    for (let i = 0; i < count; i++) {
      const res = await fetch(
        `${getSquadBaseUrl()}/virtual-account/create-dynamic-virtual-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${requireEnv("SQUAD_SECRET_KEY")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      results.push(data);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    }
    return results;
  },
});

/**
 * Initiate Escrow Funding via Dynamic Virtual Account (DVA)
 */
export const initiateEscrowViaDva = action({
  args: {
    projectId: v.id("projects"),
    amountKobo: v.number(),
    ownerEmail: v.string(),
    durationSecs: v.number(),
  },
  handler: async (ctx, { projectId, amountKobo, ownerEmail, durationSecs }) => {
    const merchantId = requireEnv("SQUAD_MERCHANT_ID");
    const txRef = `${merchantId}_DVA_${projectId}_${Date.now()}`;

    const res = await fetch(
      `${getSquadBaseUrl()}/virtual-account/initiate-dynamic-virtual-account`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${requireEnv("SQUAD_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: durationSecs,
          amount: amountKobo,
          transaction_ref: txRef,
          email: ownerEmail,
        }),
      }
    );

    const data = await res.json();

    console.log("Squad DVA Initiation Response:", JSON.stringify(data, null, 2));

    if (!data.success) {
      throw new Error(`DVA initiation failed: ${data.message}`);
    }

    if (!data.data?.virtual_account_number) {
       console.error("Missing virtual_account_number in Squad response:", data);
    }

    // Note: Assuming a mutation internal.projects.setDvaFunding will be created
    // or adapting existing createPayment logic to handle DVA records.
    // For now, using the existing createPayment logic to record the intent.
    await ctx.runMutation(internal.payments.createPayment, {
      projectId: projectId,
      milestoneId: null,
      type: "ESCROW_FUNDING",
      amountKobo: amountKobo,
      squadTransactionRef: txRef,
      checkoutUrl: "dva", // Placeholder, UI uses virtual account details
    });

    return {
      virtualAccountNumber: data.data?.virtual_account_number,
      bankCode: data.data?.bank_code,
      bankName: "GTBank",
      expectedAmountKobo: amountKobo,
      expiresAt: Date.now() + durationSecs * 1000,
      transactionRef: txRef,
    };
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
 * Requery transfer status, handling specific DVA timeout logic.
 */
async function requeryTransferStatus(transactionRef: string) {
  const merchantId = requireEnv("SQUAD_MERCHANT_ID");

  const res = await fetch(
    `${getSquadBaseUrl()}/payout/requery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requireEnv("SQUAD_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_reference: transactionRef,
      }),
    }
  );

  const data = await res.json();

  return {
    status: data.data?.response_description,
    amount: data.data?.amount,
    accountName: data.data?.account_name,
    raw: data,
  };
}

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
    milestoneTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const merchantId = requireEnv("SQUAD_MERCHANT_ID");
    const hasMerchantPrefix = args.transactionRef.startsWith(`${merchantId}_`);
    const transferRef = hasMerchantPrefix
      ? args.transactionRef
      : `${merchantId}_REL_${args.milestoneId}_${Date.now()}`;

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
      amount: String(args.amountKobo), // MUST be a string
      bank_code: args.bankCode,
      account_number: args.bankAccountNumber,
      account_name: lookup.data.account_name,
      currency_id: "NGN",
      remark: `ConSync milestone payment: ${args.milestoneTitle || args.milestoneId}`,
    };

    const res = await fetch(
      `${getSquadBaseUrl()}/payout/transfer`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${requireEnv("SQUAD_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (res.status === 200) {
      // Success — write payment record (currently handled downstream or by webhook,
      // but marking intent here if needed)
      return { success: true, transactionRef: transferRef };
    }

    if (res.status === 424) {
      // TIMEOUT — MUST re-query before retrying
      const requery = await requeryTransferStatus(transferRef);
      return { success: false, timedOut: true, requery };
    }

    if (res.status === 412) {
      // REVERSED
      return { success: false, reversed: true, message: data.message };
    }

    throw new Error(`Transfer failed: ${data.message} (status: ${res.status})`);
  },
});
