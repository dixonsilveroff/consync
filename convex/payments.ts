import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const createPayment = internalMutation({
  args: {
    projectId: v.id("projects"),
    milestoneId: v.union(v.id("milestones"), v.null()),
    type: v.union(v.literal("ESCROW_FUNDING"), v.literal("MILESTONE_RELEASE")),
    amountKobo: v.number(),
    paystackTransactionRef: v.string(),
    checkoutUrl: v.optional(v.string()),
    dvaAccountNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      projectId: args.projectId,
      milestoneId: args.milestoneId ?? undefined,
      type: args.type,
      amountKobo: args.amountKobo,
      status: "INITIATED",
      paystackTransactionRef: args.paystackTransactionRef,
      checkoutUrl: args.checkoutUrl,
      dvaAccountNumber: args.dvaAccountNumber,
      paymentProvider: "paystack",
      createdAt: Date.now(),
    });
  },
});

export const getPaymentByPaystackRef = internalQuery({
  args: {
    transactionRef: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_paystack_ref", (q) =>
        q.eq("paystackTransactionRef", args.transactionRef)
      )
      .first();
  },
});

export const updatePaymentRefPaystack = internalMutation({
  args: {
    currentRef: v.string(),
    newRef: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.currentRef === args.newRef) {
      return;
    }

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_paystack_ref", (q) =>
        q.eq("paystackTransactionRef", args.currentRef)
      )
      .first();

    if (!payment) {
      return;
    }

    await ctx.db.patch(payment._id, {
      paystackTransactionRef: args.newRef,
    });
  },
});

export const updateTransferCodes = internalMutation({
  args: {
    transactionRef: v.string(),
    transferRecipientCode: v.string(),
    transferCode: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_paystack_ref", (q) =>
        q.eq("paystackTransactionRef", args.transactionRef)
      )
      .first();

    if (!payment) return;

    await ctx.db.patch(payment._id, {
      paystackTransferRecipientCode: args.transferRecipientCode,
      paystackTransferCode: args.transferCode,
    });
  }
});

