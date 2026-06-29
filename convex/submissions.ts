import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Helper to calculate Haversine distance between two coordinates in meters
 */
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

/**
 * Generate a short-lived upload URL for a single file.
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
 * Create a submission record after the video and frames have been uploaded.
 */
export const createSubmission = mutation({
  args: {
    milestoneId: v.id("milestones"),
    videoStorageId: v.optional(v.id("_storage")),
    keyFrameStorageIds: v.array(v.id("_storage")),
    contractorNote: v.optional(v.string()),
    gpsLatitude: v.optional(v.number()),
    gpsLongitude: v.optional(v.number()),
    gpsAccuracyMeters: v.optional(v.number()),
    videoDurationSeconds: v.optional(v.number()),
    deviceCaptureTimestamp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new ConvexError("Milestone not found");

    const project = await ctx.db.get(milestone.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (args.keyFrameStorageIds.length === 0) {
      throw new ConvexError("At least one key frame is required");
    }
    if (args.keyFrameStorageIds.length > 20) {
      throw new ConvexError("Maximum 20 key frames per submission");
    }

    const now = Date.now();
    const intakeFlags: string[] = [];

    // 1. GPS boundary check (if project has coordinates)
    if (
      project.siteLatitude != null &&
      project.siteLongitude != null &&
      args.gpsLatitude != null &&
      args.gpsLongitude != null
    ) {
      const dist = getDistanceMeters(
        project.siteLatitude,
        project.siteLongitude,
        args.gpsLatitude,
        args.gpsLongitude
      );
      if (dist > 500) {
        intakeFlags.push("LOCATION_MISMATCH");
      }
    }

    // 2. Timestamp recency check
    if (args.deviceCaptureTimestamp) {
      const captureTime = new Date(args.deviceCaptureTimestamp).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - captureTime > twentyFourHours) {
        intakeFlags.push("POSSIBLE_ARCHIVE_SUBMISSION");
      }
    }

    // Create the submission record
    const submissionId = await ctx.db.insert("submissions", {
      milestoneId: args.milestoneId,
      projectId: milestone.projectId,
      contractorClerkId: identity.subject,
      videoStorageId: args.videoStorageId,
      keyFrameStorageIds: args.keyFrameStorageIds,
      frameCount: args.keyFrameStorageIds.length,
      videoDurationSeconds: args.videoDurationSeconds,
      deviceCaptureTimestamp: args.deviceCaptureTimestamp,
      gpsLatitude: args.gpsLatitude,
      gpsLongitude: args.gpsLongitude,
      gpsAccuracyMeters: args.gpsAccuracyMeters,
      contractorNote: args.contractorNote,
      intakeFlags: intakeFlags.length > 0 ? intakeFlags : undefined,
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
