import { query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/**
 * Get all milestones for a project (ordered by orderIndex)
 */
export const getMilestones = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    // Validate project access
    const project = await ctx.db.get(projectId);
    if (!project) throw new ConvexError("Project not found");
    if (
      project.ownerClerkId !== identity.subject &&
      project.contractorClerkId !== identity.subject
    ) {
      throw new ConvexError("Access denied");
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
    if (!identity) throw new ConvexError("Not authenticated");

    const milestone = await ctx.db.get(milestoneId);
    if (!milestone) throw new ConvexError("Milestone not found");

    // Validate project access
    const project = await ctx.db.get(milestone.projectId);
    if (!project) throw new ConvexError("Project not found");
    if (
      project.ownerClerkId !== identity.subject &&
      project.contractorClerkId !== identity.subject
    ) {
      throw new ConvexError("Access denied");
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

    // Get photo URLs
    const photoUrls: (string | null)[] = [];
    for (const storageId of latestSubmission.photoStorageIds) {
      const url = await ctx.storage.getUrl(storageId);
      photoUrls.push(url);
    }

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
