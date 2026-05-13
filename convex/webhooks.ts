import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const handleSquadWebhook = mutation({
  args: {
    event: v.string(),
    transactionRef: v.string(),
    gatewayRef: v.optional(v.string()),
    amountKobo: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_transaction_ref", (q) =>
        q.eq("squadTransactionRef", args.transactionRef)
      )
      .first();

    if (!payment) {
      throw new ConvexError("Payment not found for transaction ref");
    }

    if (payment.status === "SUCCESS") {
      return;
    }

    const normalizedStatus = args.status.toLowerCase();
    const isSuccess = normalizedStatus === "success";
    const nextStatus = isSuccess ? "SUCCESS" : "FAILED";

    await ctx.db.patch(payment._id, {
      status: nextStatus,
      squadGatewayRef: args.gatewayRef,
    });

    if (!isSuccess) {
      return;
    }

    const project = await ctx.db.get(payment.projectId);
    if (!project) {
      throw new ConvexError("Project not found for payment");
    }

    if (payment.type === "ESCROW_FUNDING") {
      const newBalance = project.escrowBalanceKobo + payment.amountKobo;
      await ctx.db.patch(project._id, {
        escrowBalanceKobo: newBalance,
        status: "ACTIVE",
      });
      return;
    }

    if (payment.type === "MILESTONE_RELEASE") {
      const newBalance = Math.max(0, project.escrowBalanceKobo - payment.amountKobo);
      await ctx.db.patch(project._id, {
        escrowBalanceKobo: newBalance,
      });
      return;
    }
  },
});
