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
 * Helper to calculate point-to-polyline minimum distance in meters
 */
function distanceToPolylineMetres(
  point: { lat: number; lng: number },
  polyline: { lat: number; lng: number }[]
): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) return getDistanceMeters(point.lat, point.lng, polyline[0].lat, polyline[0].lng);

  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i];
    const b = polyline[i + 1];

    const d13 = getDistanceMeters(a.lat, a.lng, point.lat, point.lng);
    const d23 = getDistanceMeters(b.lat, b.lng, point.lat, point.lng);
    const d12 = getDistanceMeters(a.lat, a.lng, b.lat, b.lng);

    if (d12 === 0) {
      minDistance = Math.min(minDistance, d13);
      continue;
    }

    const s = (d12 + d13 + d23) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - d12) * (s - d13) * (s - d23)));
    const h = (2 * area) / d12;

    const angle1 = Math.acos(Math.max(-1, Math.min(1, (d12*d12 + d13*d13 - d23*d23) / (2 * d12 * d13))));
    const angle2 = Math.acos(Math.max(-1, Math.min(1, (d12*d12 + d23*d23 - d13*d13) / (2 * d12 * d23))));

    let distToSegment;
    if (angle1 >= Math.PI / 2) {
      distToSegment = d13;
    } else if (angle2 >= Math.PI / 2) {
      distToSegment = d23;
    } else {
      distToSegment = h;
    }

    minDistance = Math.min(minDistance, distToSegment);
  }
  return minDistance;
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
    bypassDemoLocks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new ConvexError("Milestone not found");

    const project = await ctx.db.get(milestone.projectId);
    if (!project) throw new ConvexError("Project not found");

    if (!args.bypassDemoLocks) {
      if (milestone.requiresPriorMilestoneId) {
        const prior = await ctx.db.get(milestone.requiresPriorMilestoneId);
        if (!prior || prior.status !== "APPROVED") {
          throw new ConvexError(
            "This milestone requires the prior milestone to be approved first. Milestone 3B cannot be submitted until Milestone 3A is approved."
          );
        }
      }

      // Preserve sequential orderIndex check
      if (milestone.orderIndex > 1) {
        const priorByOrder = await ctx.db
          .query("milestones")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .filter((q) => q.eq(q.field("orderIndex"), milestone.orderIndex - 1))
          .first();
        
        if (priorByOrder && priorByOrder.status !== "APPROVED") {
          throw new ConvexError(
            `Milestone ${milestone.orderIndex} cannot be submitted until Milestone ${milestone.orderIndex - 1} is approved.`
          );
        }
      }
    }

    if (args.keyFrameStorageIds.length === 0) {
      throw new ConvexError("At least one key frame is required");
    }
    if (args.keyFrameStorageIds.length > 20) {
      throw new ConvexError("Maximum 20 key frames per submission");
    }

    const now = Date.now();
    const intakeFlags: string[] = [];

    // 1. GPS boundary check (if project has coordinates)
    if (args.gpsLatitude != null && args.gpsLongitude != null) {
      if (project.geofenceType === "LINEAR_CORRIDOR" && project.roadCentrelineCoords) {
        const dist = distanceToPolylineMetres(
          { lat: args.gpsLatitude, lng: args.gpsLongitude },
          project.roadCentrelineCoords
        );
        const halfWidth = (project.corridorWidthMetres ?? 50) / 2;
        if (dist > halfWidth) {
          intakeFlags.push("LOCATION_MISMATCH");
        }
      } else if (project.siteLatitude != null && project.siteLongitude != null) {
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
