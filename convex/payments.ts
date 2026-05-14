import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const createPayment = internalMutation({
  args: {
    projectId: v.id("projects"),
    milestoneId: v.union(v.id("milestones"), v.null()),
    type: v.union(v.literal("ESCROW_FUNDING"), v.literal("MILESTONE_RELEASE")),
    amountKobo: v.number(),
    squadTransactionRef: v.string(),
    checkoutUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      projectId: args.projectId,
      milestoneId: args.milestoneId ?? undefined,
      type: args.type,
      amountKobo: args.amountKobo,
      status: "INITIATED",
      squadTransactionRef: args.squadTransactionRef,
      squadGatewayRef: undefined,
      checkoutUrl: args.checkoutUrl,
      createdAt: Date.now(),
    });
  },
});

export const getPaymentByTransactionRef = internalQuery({
  args: {
    transactionRef: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_transaction_ref", (q) =>
        q.eq("squadTransactionRef", args.transactionRef)
      )
      .first();
  },
});

export const updatePaymentRef = internalMutation({
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
      .withIndex("by_transaction_ref", (q) =>
        q.eq("squadTransactionRef", args.currentRef)
      )
      .first();

    if (!payment) {
      return;
    }

    await ctx.db.patch(payment._id, {
      squadTransactionRef: args.newRef,
    });
  },
});
