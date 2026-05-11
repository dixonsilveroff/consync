import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Generate a short-lived upload URL for a single photo.
 * The client uploads directly to Convex storage using this URL.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Create a submission record after photos have been uploaded.
 * Validates contractor access, saves the submission, updates milestone
 * status to SUBMITTED, and schedules the AI analysis action.
 */
export const createSubmission = mutation({
  args: {
    milestoneId: v.id("milestones"),
    photoStorageIds: v.array(v.id("_storage")),
    contractorNote: v.optional(v.string()),
    gpsLatitude: v.optional(v.number()),
    gpsLongitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new ConvexError("Milestone not found");

    const project = await ctx.db.get(milestone.projectId);
    if (!project) throw new ConvexError("Project not found");

    // Only the assigned contractor (or any authenticated user for now) can submit
    // Phase 3: restrict to project.contractorClerkId once linking is enforced
    if (args.photoStorageIds.length === 0) {
      throw new ConvexError("At least one photo is required");
    }
    if (args.photoStorageIds.length > 5) {
      throw new ConvexError("Maximum 5 photos per submission");
    }

    const now = Date.now();

    // Create the submission record
    const submissionId = await ctx.db.insert("submissions", {
      milestoneId: args.milestoneId,
      projectId: milestone.projectId,
      contractorClerkId: identity.subject,
      photoStorageIds: args.photoStorageIds,
      photoCount: args.photoStorageIds.length,
      gpsLatitude: args.gpsLatitude,
      gpsLongitude: args.gpsLongitude,
      contractorNote: args.contractorNote,
      status: "PENDING_ANALYSIS",
      submittedAt: now,
    });

    // Update milestone status to SUBMITTED
    await ctx.db.patch(args.milestoneId, { status: "SUBMITTED" });

    // Schedule the AI analysis (runs in Node.js runtime)
    await ctx.scheduler.runAfter(0, internal.ai.runMilestoneAnalysis, {
      submissionId,
      milestoneId: args.milestoneId,
      projectId: milestone.projectId,
    });

    return { submissionId };
  },
});
