import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Get all milestones for a project (ordered by orderIndex)
 */
export const getMilestones = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Validate project access
    const project = await ctx.db.get(projectId);
    if (!project) return [];
    if (
      project.ownerClerkId !== identity.subject &&
      project.contractorClerkId !== identity.subject
    ) {
      return [];
    }

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    // Sort by orderIndex
    return milestones.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

/**
 * Get the latest submission + analysis for a milestone
 */
export const getMilestoneDetail = query({
  args: { milestoneId: v.id("milestones") },
  handler: async (ctx, { milestoneId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const milestone = await ctx.db.get(milestoneId);
    if (!milestone) return null;

    // Validate project access
    const project = await ctx.db.get(milestone.projectId);
    if (!project) return null;
    if (
      project.ownerClerkId !== identity.subject &&
      project.contractorClerkId !== identity.subject
    ) {
      return null;
    }

    // Get the latest submission
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", milestoneId))
      .collect();

    // Sort by submittedAt descending, take first
    const latestSubmission = submissions.sort(
      (a, b) => b.submittedAt - a.submittedAt
    )[0];

    if (!latestSubmission) {
      return { milestone, submission: null, analysis: null, photoUrls: [] };
    }

    // Get analysis result for this submission
    const analysis = await ctx.db
      .query("analysisResults")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", latestSubmission._id)
      )
      .first();

    // Get photo URLs concurrently
    const photoUrls = await Promise.all(
      latestSubmission.photoStorageIds.map((id) => ctx.storage.getUrl(id))
    );

    return {
      milestone,
      submission: latestSubmission,
      analysis,
      photoUrls,
    };
  },
});

/**
 * Get all submissions for a milestone (history)
 */
export const getSubmissionHistory = query({
  args: { milestoneId: v.id("milestones") },
  handler: async (ctx, { milestoneId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", milestoneId))
      .collect();

    return submissions.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

/**
 * Owner approves a milestone — marks milestone and latest submission as APPROVED
 */
export const approveMilestone = mutation({
  args: { milestoneId: v.id("milestones") },
  handler: async (ctx, { milestoneId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const milestone = await ctx.db.get(milestoneId);
    if (!milestone) throw new ConvexError("Milestone not found");

    const project = await ctx.db.get(milestone.projectId);
    if (!project) throw new ConvexError("Project not found");
    if (project.ownerClerkId !== identity.subject) {
      throw new ConvexError("Only the project owner can approve milestones");
    }

    if (milestone.status !== "ANALYSIS_DONE") {
      throw new ConvexError("Milestone must be in ANALYSIS_DONE status to approve");
    }

    if (project.escrowBalanceKobo < milestone.valueKobo) {
      throw new ConvexError("Insufficient escrow balance");
    }

    const contractorId = project.contractorClerkId;
    if (!contractorId) {
      throw new ConvexError("Contractor not linked to project");
    }

    const contractor = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", contractorId))
      .first();

    if (!contractor?.bankCode || !contractor.bankAccountNumber || !contractor.bankAccountName) {
      throw new ConvexError("Contractor bank details are missing");
    }

    const transactionRef = `CSYNC_TRF_${milestoneId}_${Date.now()}`;

    await ctx.db.patch(milestoneId, { status: "APPROVED" });

    // Mark latest submission as approved
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", milestoneId))
      .take(10);
    const latest = submissions.sort((a, b) => b.submittedAt - a.submittedAt)[0];
    if (latest) {
      await ctx.db.patch(latest._id, { status: "APPROVED" });
    }

    await ctx.db.insert("payments", {
      projectId: project._id,
      milestoneId: milestone._id,
      type: "MILESTONE_RELEASE",
      amountKobo: milestone.valueKobo,
      status: "INITIATED",
      paystackTransactionRef: transactionRef,
      checkoutUrl: undefined,
      paymentProvider: "paystack",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.paystack.releaseMilestonePayment, {
      milestoneId: milestone._id,
      amountKobo: milestone.valueKobo,
      bankCode: contractor.bankCode,
      bankAccountNumber: contractor.bankAccountNumber,
      bankAccountName: contractor.bankAccountName,
      transactionRef,
    });
  },
});

/**
 * Owner rejects a milestone — marks milestone and latest submission as REJECTED
 */
export const rejectMilestone = mutation({
  args: {
    milestoneId: v.id("milestones"),
    reason: v.string(),
  },
  handler: async (ctx, { milestoneId, reason }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const milestone = await ctx.db.get(milestoneId);
    if (!milestone) throw new ConvexError("Milestone not found");

    const project = await ctx.db.get(milestone.projectId);
    if (!project) throw new ConvexError("Project not found");
    if (project.ownerClerkId !== identity.subject) {
      throw new ConvexError("Only the project owner can reject milestones");
    }

    await ctx.db.patch(milestoneId, { status: "REJECTED" });

    // Mark latest submission as rejected with reason
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", milestoneId))
      .take(10);
    const latest = submissions.sort((a, b) => b.submittedAt - a.submittedAt)[0];
    if (latest) {
      await ctx.db.patch(latest._id, { status: "REJECTED", rejectionReason: reason });
    }

    // Reset milestone so contractor can resubmit
    await ctx.db.patch(milestoneId, { status: "REJECTED" });
  },
});
