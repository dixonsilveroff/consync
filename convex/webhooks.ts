import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const handlePaystackWebhook = mutation({
  args: {
    event: v.string(),
    transactionRef: v.string(), // Represents either transaction ref or transfer code based on the event
    amountKobo: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    let payment;

    if (args.event.startsWith("transfer.")) {
      // Transfer events (milestone release) - look up by transfer code
      payment = await ctx.db
        .query("payments")
        .filter((q) => q.eq(q.field("paystackTransferCode"), args.transactionRef))
        .first();
    } else {
      // Charge events (escrow funding) - look up by transaction reference
      payment = await ctx.db
        .query("payments")
        .withIndex("by_paystack_ref", (q) =>
          q.eq("paystackTransactionRef", args.transactionRef)
        )
        .first();
    }

    if (!payment) {
      console.log(`Payment not found for ref/code: ${args.transactionRef}`);
      return;
    }

    // Idempotency: Ignore if the payment has already reached a terminal state
    if (payment.status === "SUCCESS" || payment.status === "FAILED") {
      console.log(`Webhook ignored: Payment ${payment._id} is already ${payment.status}`);
      return;
    }

    const normalizedStatus = args.status.toLowerCase();
    const isSuccess = normalizedStatus === "success";
    const nextStatus = isSuccess ? "SUCCESS" : "FAILED";

    await ctx.db.patch(payment._id, {
      status: nextStatus,
    });

    if (!isSuccess) {
      return;
    }

    const project = await ctx.db.get(payment.projectId);
    if (!project) {
      throw new ConvexError("Project not found for payment");
    }

    if (payment.type === "ESCROW_FUNDING" && args.event === "charge.success") {
      const newBalance = project.escrowBalanceKobo + payment.amountKobo;
      await ctx.db.patch(project._id, {
        escrowBalanceKobo: newBalance,
        status: "ACTIVE",
      });
      return;
    }

    if (payment.type === "MILESTONE_RELEASE" && args.event === "transfer.success") {
      const newBalance = Math.max(0, project.escrowBalanceKobo - payment.amountKobo);
      await ctx.db.patch(project._id, {
        escrowBalanceKobo: newBalance,
      });
      return;
    }
  },
});
