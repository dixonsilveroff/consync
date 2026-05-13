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
    projectType: v.string(),
    location: v.optional(v.string()),
    siteLatitude: v.optional(v.number()),
    siteLongitude: v.optional(v.number()),
    // Squad integration fields
    squadVirtualAccountNumber: v.optional(v.string()),
    squadCustomerIdentifier: v.optional(v.string()),
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
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_status", ["projectId", "status"]),

  // ─── SUBMISSIONS ───────────────────────────────────────────
  submissions: defineTable({
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
    contractorClerkId: v.string(),
    photoStorageIds: v.array(v.id("_storage")),
    photoCount: v.number(),
    gpsLatitude: v.optional(v.number()),
    gpsLongitude: v.optional(v.number()),
    contractorNote: v.optional(v.string()),
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
    analyzedAt: v.number(),
  }).index("by_submission", ["submissionId"]),

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
    squadTransactionRef: v.string(),
    squadGatewayRef: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_transaction_ref", ["squadTransactionRef"]),
});
