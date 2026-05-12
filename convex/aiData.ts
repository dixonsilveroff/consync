import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal query: fetch all data needed for AI analysis
 */
export const fetchSubmissionData = internalQuery({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return null;

    const milestone = await ctx.db.get(submission.milestoneId);
    if (!milestone) return null;

    const project = await ctx.db.get(milestone.projectId);
    if (!project) return null;

    return {
      photoStorageIds: submission.photoStorageIds,
      contractorNote: submission.contractorNote ?? null,
      milestoneName: milestone.name,
      acceptanceCriteria: milestone.acceptanceCriteria,
      projectType: project.projectType,
      projectLocation: project.location ?? null,
    };
  },
});

/**
 * Internal mutation: save analysis result and update statuses
 */
export const saveAnalysisResult = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    verificationStatus: v.union(
      v.literal("CONFIRMED"),
      v.literal("UNCONFIRMED"),
      v.literal("NEEDS_REVIEW"),
      v.literal("RESUBMIT_REQUIRED")
    ),
    confidenceScore: v.number(),
    criterionAssessments: v.array(
      v.object({
        criterionText: v.string(),
        status: v.union(
          v.literal("MET"),
          v.literal("NOT_MET"),
          v.literal("CANNOT_VERIFY")
        ),
        observation: v.string(),
      })
    ),
    anomalies: v.array(
      v.object({
        description: v.string(),
        severity: v.union(
          v.literal("LOW"),
          v.literal("MEDIUM"),
          v.literal("HIGH"),
          v.literal("CRITICAL")
        ),
        recommendation: v.string(),
      })
    ),
    visibilityNotes: v.optional(v.string()),
    plainSummary: v.string(),
    routingRecommendation: v.union(
      v.literal("APPROVE"),
      v.literal("REVIEW"),
      v.literal("REJECT")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analysisResults", {
      submissionId: args.submissionId,
      milestoneId: args.milestoneId,
      projectId: args.projectId,
      verificationStatus: args.verificationStatus,
      confidenceScore: args.confidenceScore,
      criterionAssessments: args.criterionAssessments,
      anomalies: args.anomalies,
      visibilityNotes: args.visibilityNotes,
      plainSummary: args.plainSummary,
      routingRecommendation: args.routingRecommendation,
      analyzedAt: Date.now(),
    });

    await ctx.db.patch(args.submissionId, { status: "ANALYSIS_COMPLETE" });
    await ctx.db.patch(args.milestoneId, { status: "ANALYSIS_DONE" });
  },
});

export const getLatestSubmission = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("submissions").order("desc").take(1);
  }
});

/**
 * Internal mutation: save analysis failure and update statuses
 */
export const saveAnalysisFailure = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, { status: "REJECTED" });
    await ctx.db.patch(args.milestoneId, { status: "REJECTED" });
  },
});
