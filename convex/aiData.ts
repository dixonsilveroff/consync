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
      keyFrameStorageIds: submission.keyFrameStorageIds,
      frameCount: submission.frameCount,
      contractorNote: submission.contractorNote ?? null,
      projectName: project.name,
      projectType: project.projectType,
      projectLocation: project.location ?? null,
      milestoneName: milestone.name,
      milestoneDescription: milestone.description,
      boqReference: milestone.boqReference ?? null,
      acceptanceCriteria: milestone.acceptanceCriteria,
    };
  },
});

/**
 * Internal query: get prior analyses to determine the routing mode and context
 */
export const getPriorAnalyses = internalQuery({
  args: { projectId: v.id("projects"), milestoneId: v.id("milestones") },
  handler: async (ctx, args) => {
    // Find the most recent CONFIRMED analysis for the SAME milestone
    const sameMilestonePrior = await ctx.db
      .query("analysisResults")
      .withIndex("by_milestone_and_status", q => q.eq("milestoneId", args.milestoneId).eq("verificationStatus", "CONFIRMED"))
      .order("desc")
      .first();

    // Find up to 2 most recent CONFIRMED analyses for ANY milestone on this project
    const recentAnalyses = await ctx.db
      .query("analysisResults")
      .withIndex("by_project", q => q.eq("projectId", args.projectId))
      .order("desc")
      .take(10); // Take more to filter

    const projectPriors = recentAnalyses
      .filter(a => a.verificationStatus === "CONFIRMED")
      .slice(0, 2);

    let mode: "BASELINE" | "MILESTONE_DELTA" | "PROJECT_PROGRESS";
    if (!sameMilestonePrior && projectPriors.length === 0) {
      mode = "BASELINE";
    } else if (sameMilestonePrior) {
      mode = "MILESTONE_DELTA";
    } else {
      mode = "PROJECT_PROGRESS";
    }

    return {
      mode,
      sameMilestonePrior,
      projectPriors
    };
  }
});

/**
 * Internal mutation: save analysis result and update statuses
 */
export const saveAnalysisResult = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    analysisMode: v.union(
      v.literal("BASELINE"),
      v.literal("MILESTONE_DELTA"),
      v.literal("PROJECT_PROGRESS")
    ),
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
    comparativeObservations: v.optional(v.object({
      progressionConsistent: v.optional(v.boolean()),
      priorAnomaliesResolved: v.optional(v.array(v.string())),
      regressionFlags: v.optional(v.array(v.string())),
      newSincePrior: v.optional(v.string()),
    })),
    visibilityNotes: v.optional(v.string()),
    plainSummary: v.string(),
    routingRecommendation: v.union(
      v.literal("APPROVE"),
      v.literal("REVIEW"),
      v.literal("REJECT")
    ),
    modelUsed: v.optional(v.string()),
    priorAnalysisIds: v.optional(v.array(v.id("analysisResults"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analysisResults", {
      submissionId: args.submissionId,
      milestoneId: args.milestoneId,
      projectId: args.projectId,
      analysisMode: args.analysisMode,
      verificationStatus: args.verificationStatus,
      confidenceScore: args.confidenceScore,
      criterionAssessments: args.criterionAssessments,
      anomalies: args.anomalies,
      comparativeObservations: args.comparativeObservations,
      visibilityNotes: args.visibilityNotes,
      plainSummary: args.plainSummary,
      routingRecommendation: args.routingRecommendation,
      modelUsed: args.modelUsed,
      priorAnalysisIds: args.priorAnalysisIds,
      analyzedAt: Date.now(),
    });

    await ctx.db.patch(args.submissionId, { status: "ANALYSIS_COMPLETE" });
    
    // For now, regardless of the AI's routing recommendation, all analyses route to owner review.
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
