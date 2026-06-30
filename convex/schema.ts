import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── USERS ─────────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    role: v.string(), // "owner" or "contractor"
    bankCode: v.optional(v.string()),
    bankAccountNumber: v.optional(v.string()),
    bankAccountName: v.optional(v.string()),
    bankVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  // ─── PROJECTS ──────────────────────────────────────────────
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerClerkId: v.string(),
    contractorClerkId: v.optional(v.string()),
    contractorEmail: v.optional(v.string()),
    status: v.union(
      v.literal("PENDING_FUNDING"),
      v.literal("ACTIVE"),
      v.literal("COMPLETED"),
      v.literal("SUSPENDED")
    ),
    totalValueKobo: v.number(),
    escrowBalanceKobo: v.number(),
    projectType: v.union(
      v.literal("RESIDENTIAL_BUILDING"),
      v.literal("ROAD_CONSTRUCTION"),
      v.literal("Residential")
    ),
    geofenceType: v.optional(v.union(
      v.literal("POINT_RADIUS"),
      v.literal("LINEAR_CORRIDOR")
    )),
    roadCentrelineCoords: v.optional(
      v.array(v.object({
        lat: v.number(),
        lng: v.number(),
      }))
    ),
    corridorWidthMetres: v.optional(v.number()),
    location: v.optional(v.string()),
    siteLatitude: v.optional(v.number()),
    siteLongitude: v.optional(v.number()),
    // Squad integration fields (legacy)
    squadVirtualAccountNumber: v.optional(v.string()),
    squadCustomerIdentifier: v.optional(v.string()),
    // Paystack integration fields
    paymentProvider: v.optional(v.union(v.literal("squad"), v.literal("paystack"))),
    paystackCustomerId: v.optional(v.string()),
    paystackDVAAccountNumber: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerClerkId"])
    .index("by_contractor", ["contractorClerkId"]),

  // ─── MILESTONES ────────────────────────────────────────────
  milestones: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.string(),
    boqReference: v.optional(v.string()),
    valueKobo: v.number(),
    orderIndex: v.number(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("SUBMITTED"),
      v.literal("ANALYSIS_DONE"),
      v.literal("APPROVED"),
      v.literal("REJECTED")
    ),
    acceptanceCriteria: v.array(v.string()),
    requiresPriorMilestoneId: v.optional(v.id("milestones")),
    submissionNote: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_status", ["projectId", "status"]),

  // ─── SUBMISSIONS ───────────────────────────────────────────
  submissions: defineTable({
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    contractorClerkId: v.string(),
    // Legacy fields
    photoStorageIds: v.optional(v.array(v.string())),
    photoCount: v.optional(v.number()),
    // Video evidence
    videoStorageId: v.optional(v.id("_storage")),
    keyFrameStorageIds: v.optional(v.array(v.id("_storage"))),
    frameCount: v.optional(v.number()),
    videoDurationSeconds: v.optional(v.number()),
    deviceCaptureTimestamp: v.optional(v.string()),
    // Location
    gpsLatitude: v.optional(v.number()),
    gpsLongitude: v.optional(v.number()),
    gpsAccuracyMeters: v.optional(v.number()),
    // Notes & flags
    contractorNote: v.optional(v.string()),
    intakeFlags: v.optional(v.array(v.string())),
    // Status
    status: v.union(
      v.literal("PENDING_ANALYSIS"),
      v.literal("ANALYSIS_COMPLETE"),
      v.literal("APPROVED"),
      v.literal("REJECTED")
    ),
    rejectionReason: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_milestone", ["milestoneId"])
    .index("by_project", ["projectId"])
    .index("by_contractor", ["contractorClerkId"]),

  // ─── ANALYSIS RESULTS ──────────────────────────────────────
  analysisResults: defineTable({
    submissionId: v.id("submissions"),
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    // Analysis mode (multi-mode engine)
    analysisMode: v.optional(v.union(
      v.literal("BASELINE"),
      v.literal("MILESTONE_DELTA"),
      v.literal("PROJECT_PROGRESS")
    )),
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
    // Comparative analysis data
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
    // Metadata
    modelUsed: v.optional(v.string()),
    priorAnalysisIds: v.optional(v.array(v.id("analysisResults"))),
    analyzedAt: v.number(),
  })
    .index("by_submission", ["submissionId"])
    .index("by_project", ["projectId"])
    .index("by_milestone_and_status", ["milestoneId", "verificationStatus"]),

  // ─── INSPECTOR FEEDBACK ────────────────────────────────────
  inspectorFeedback: defineTable({
    analysisId: v.id("analysisResults"),
    reviewerClerkId: v.string(),
    aiStatus: v.string(),
    humanStatus: v.string(),
    overrideReasonCategory: v.optional(v.union(
      v.literal("FALSE_NEGATIVE"),
      v.literal("FALSE_POSITIVE"),
      v.literal("WRONG_CRITERION"),
      v.literal("OCCLUSION"),
      v.literal("LIGHTING"),
      v.literal("OTHER")
    )),
    overrideReasonText: v.optional(v.string()),
    framesReferenced: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_analysis", ["analysisId"]),

  // ─── PAYMENTS ──────────────────────────────────────────────
  payments: defineTable({
    projectId: v.id("projects"),
    milestoneId: v.optional(v.id("milestones")),
    type: v.union(
      v.literal("ESCROW_FUNDING"),
      v.literal("MILESTONE_RELEASE")
    ),
    amountKobo: v.number(),
    status: v.union(
      v.literal("INITIATED"),
      v.literal("SUCCESS"),
      v.literal("FAILED")
    ),
    squadTransactionRef: v.optional(v.string()),
    squadGatewayRef: v.optional(v.string()),
    paystackTransactionRef: v.optional(v.string()),
    paystackTransferRecipientCode: v.optional(v.string()),
    paystackTransferCode: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
    dvaAccountNumber: v.optional(v.string()),
    paymentProvider: v.optional(v.union(v.literal("squad"), v.literal("paystack"))),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_transaction_ref", ["squadTransactionRef"])
    .index("by_paystack_ref", ["paystackTransactionRef"])
    .index("by_dva_account", ["dvaAccountNumber"]),

  // ─── INVITATIONS ───────────────────────────────────────────
  invitations: defineTable({
    email: v.string(),
    projectId: v.id("projects"),
    role: v.string(), // e.g., "contractor"
    inviterClerkId: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
