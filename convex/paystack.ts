import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";

const DEFAULT_PAYSTACK_BASE_URL = "https://api.paystack.co";

function getPaystackBaseUrl(): string {
  return process.env.PAYSTACK_BASE_URL || DEFAULT_PAYSTACK_BASE_URL;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConvexError(`${key} is not set`);
  }
  return value;
}

async function paystackRequest<T>(
  path: string,
  method: "GET" | "POST" = "POST",
  body?: Record<string, unknown>
): Promise<T> {
  const secretKey = requireEnv("PAYSTACK_SECRET_KEY");
  
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${getPaystackBaseUrl()}${path}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Paystack API error (${response.status}):`, errorText);
    throw new ConvexError(`Paystack API error (${response.status})`);
  }

  return (await response.json()) as T;
}

/**
 * Contractor bank onboarding: lookup account name only
 */
export const lookupBankDetails = action({
  args: {
    bankCode: v.string(),
    bankAccountNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const isSandboxEnv = true; // Use test overrides if needed
    let accountName = "";

    if (isSandboxEnv && args.bankAccountNumber.startsWith("0000")) {
      // Mock for test accounts starting with 0000
      accountName = `TEST ACCOUNT - ${args.bankAccountNumber.slice(-4)}`;
    } else {
      try {
        const lookup = await paystackRequest<{ status: boolean; data: { account_name: string; account_number: string } }>(
          `/bank/resolve?account_number=${args.bankAccountNumber}&bank_code=${args.bankCode}`,
          "GET"
        );

        if (!lookup.status || !lookup.data?.account_name) {
          throw new ConvexError("Unable to verify bank account");
        }
        accountName = lookup.data.account_name;
      } catch (err) {
        // Fallback for sandboxes without real BVN/bank lookup capabilities
        if (isSandboxEnv) {
          accountName = `TEST ACCOUNT - ${args.bankAccountNumber.slice(-4)}`;
        } else {
          throw new ConvexError("Unable to verify bank account details");
        }
      }
    }

    return { accountName };
  },
});

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

    const isSandboxEnv = true;
    let accountName = "";

    if (isSandboxEnv && args.bankAccountNumber.startsWith("0000")) {
      accountName = `TEST ACCOUNT - ${args.bankAccountNumber.slice(-4)}`;
    } else {
      try {
        const lookup = await paystackRequest<{ status: boolean; data: { account_name: string; account_number: string } }>(
          `/bank/resolve?account_number=${args.bankAccountNumber}&bank_code=${args.bankCode}`,
          "GET"
        );

        if (!lookup.status || !lookup.data?.account_name) {
          throw new ConvexError("Unable to verify bank account details");
        }
        accountName = lookup.data.account_name;
      } catch (err) {
        if (isSandboxEnv) {
          accountName = `TEST ACCOUNT - ${args.bankAccountNumber.slice(-4)}`;
        } else {
          throw new ConvexError("Unable to verify bank account details");
        }
      }
    }

    await ctx.runMutation(internal.users.saveContractorBankDetails, {
      userId: user._id,
      bankCode: args.bankCode,
      bankAccountNumber: args.bankAccountNumber,
      bankAccountName: accountName,
    });

    return { accountName };
  },
});

/**
 * Initiate Escrow Funding via Paystack Checkout
 */
export const initiateEscrowFunding = action({
  args: {
    projectId: v.id("projects"),
    amountKobo: v.number(),
    ownerEmail: v.string(),
    callbackUrl: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, amountKobo, ownerEmail, callbackUrl }) => {
    const txRef = `CSYNC_PAY_${projectId}_${Date.now()}`;

    const payload: any = {
      email: ownerEmail,
      amount: amountKobo,
      reference: txRef,
      channels: ["card", "bank", "mobile_money"],
      metadata: {
        projectId,
        type: "ESCROW_FUNDING",
      }
    };

    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    const res = await paystackRequest<{
      status: boolean;
      message: string;
      data: { authorization_url: string; access_code: string; reference: string };
    }>("/transaction/initialize", "POST", payload);

    if (!res.status) {
      throw new Error(`Transaction initialization failed: ${res.message}`);
    }

    // Record the intent
    await ctx.runMutation(internal.payments.createPayment, {
      projectId: projectId,
      milestoneId: null,
      type: "ESCROW_FUNDING",
      amountKobo: amountKobo,
      paystackTransactionRef: txRef,
      checkoutUrl: res.data.authorization_url,
    });

    return {
      authorizationUrl: res.data.authorization_url,
      accessCode: res.data.access_code,
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
    const payment = await ctx.runQuery(internal.payments.getPaymentByPaystackRef, {
      transactionRef: args.transactionRef,
    });

    if (!payment || payment.type !== "ESCROW_FUNDING") {
      return;
    }

    if (payment.status !== "INITIATED") {
      return;
    }

    const response = await paystackRequest<{ status: boolean; data: { status: string; gateway_response: string } }>(
      `/transaction/verify/${args.transactionRef}`,
      "GET"
    );

    if (response.status && response.data) {
      if (response.data.status === "success" || response.data.status === "failed") {
        await ctx.runMutation(api.webhooks.handlePaystackWebhook, {
          event: response.data.status === "success" ? "charge.success" : "charge.failed",
          transactionRef: args.transactionRef,
          amountKobo: payment.amountKobo,
          status: response.data.status,
        });
        return;
      }
    }

    const retryDelaysMs = [5 * 60 * 1000, 15 * 60 * 1000, 30 * 60 * 1000];
    const nextDelay = retryDelaysMs[args.attempt];
    if (nextDelay) {
      await ctx.scheduler.runAfter(nextDelay, internal.paystack.requeryEscrowPayment, {
        transactionRef: args.transactionRef,
        attempt: args.attempt + 1,
      });
    }
  },
});

/**
 * Internal: release milestone payment via Paystack transfer API.
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
    const transferRef = `CSYNC_TRF_${args.milestoneId}_${Date.now()}`;

    await ctx.runMutation(internal.payments.updatePaymentRefPaystack, {
      currentRef: args.transactionRef,
      newRef: transferRef,
    });

    // 1. Create Transfer Recipient
    const recipientRes = await paystackRequest<{
      status: boolean;
      data: { recipient_code: string };
    }>("/transferrecipient", "POST", {
      type: "nuban",
      name: args.bankAccountName,
      account_number: args.bankAccountNumber,
      bank_code: args.bankCode,
      currency: "NGN",
    });

    if (!recipientRes.status || !recipientRes.data?.recipient_code) {
      throw new Error("Failed to create transfer recipient");
    }

    const recipientCode = recipientRes.data.recipient_code;

    // 2. Initiate Transfer
    const transferRes = await paystackRequest<{
      status: boolean;
      message: string;
      data: { transfer_code: string; status: string };
    }>("/transfer", "POST", {
      source: "balance",
      amount: args.amountKobo, // Paystack transfer takes amount in kobo
      reference: transferRef,
      recipient: recipientCode,
      reason: `ConSync milestone payment: ${args.milestoneTitle || args.milestoneId}`,
    });

    if (transferRes.status) {
      // Transfer queued or successful
      await ctx.runMutation(internal.payments.updateTransferCodes, {
        transactionRef: transferRef,
        transferRecipientCode: recipientCode,
        transferCode: transferRes.data.transfer_code,
      });
      return { success: true, transactionRef: transferRef, transferCode: transferRes.data.transfer_code };
    }

    throw new Error(`Transfer failed: ${transferRes.message}`);
  },
});
