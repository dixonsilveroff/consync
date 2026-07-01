import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

// ─── QUERIES ─────────────────────────────────────────────────

/**
 * Get all projects for the currently authenticated owner
 */
export const getOwnerProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerClerkId", identity.subject))
      .collect();

    return Promise.all(
      projects.map(async (project) => {
        const milestones = await ctx.db
          .query("milestones")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        return {
          ...project,
          milestoneCount: milestones.length,
          approvedCount: milestones.filter((m) => m.status === "APPROVED").length,
        };
      })
    );
  },
});

/**
 * Get all projects assigned to the authenticated contractor
 */
export const getContractorProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_contractor", (q) =>
        q.eq("contractorClerkId", identity.subject)
      )
      .collect();

    return Promise.all(
      projects.map(async (project) => {
        const milestones = await ctx.db
          .query("milestones")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        return {
          ...project,
          milestoneCount: milestones.length,
          approvedCount: milestones.filter((m) => m.status === "APPROVED").length,
        };
      })
    );
  },
});

/**
 * Get a single project by ID (validates ownership or contractor access)
 */
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(projectId);
    if (!project) return null;

    // Authorize: user must be owner or contractor
    if (
      project.ownerClerkId !== identity.subject &&
      project.contractorClerkId !== identity.subject
    ) {
      return null;
    }

    return project;
  },
});

// ─── MUTATIONS ───────────────────────────────────────────────

/**
 * Create a new project with milestones (owner only)
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectType: v.union(
      v.literal("RESIDENTIAL_BUILDING"),
      v.literal("ROAD_CONSTRUCTION")
    ),
    location: v.optional(v.string()),
    siteLatitude: v.optional(v.number()),
    siteLongitude: v.optional(v.number()),
    geofenceType: v.union(
      v.literal("POINT_RADIUS"),
      v.literal("LINEAR_CORRIDOR")
    ),
    roadCentrelineCoords: v.optional(
      v.array(v.object({
        lat: v.number(),
        lng: v.number(),
      }))
    ),
    corridorWidthMetres: v.optional(v.number()),
    totalValueKobo: v.number(),
    contractorEmail: v.optional(v.string()),
    milestones: v.array(
      v.object({
        templateMilestoneId: v.optional(v.string()),
        name: v.string(),
        description: v.string(),
        valueKobo: v.number(),
        acceptanceCriteria: v.array(v.string()),
        requiresPriorMilestoneId: v.optional(v.string()),
        submissionNote: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const now = Date.now();

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      ownerClerkId: identity.subject,
      contractorEmail: args.contractorEmail,
      status: "PENDING_FUNDING",
      totalValueKobo: args.totalValueKobo,
      escrowBalanceKobo: 0,
      projectType: args.projectType,
      geofenceType: args.geofenceType,
      roadCentrelineCoords: args.roadCentrelineCoords,
      corridorWidthMetres: args.corridorWidthMetres,
      location: args.location,
      siteLatitude: args.siteLatitude,
      siteLongitude: args.siteLongitude,
      createdAt: now,
    });

    // Handle contractor invitation if email provided
    if (args.contractorEmail) {
      await ctx.db.insert("invitations", {
        email: args.contractorEmail,
        projectId,
        role: "contractor",
        inviterClerkId: identity.subject,
        createdAt: now,
      });
    }

    // Create milestones
    const milestoneMap = new Map<string, import("./_generated/dataModel").Id<"milestones">>();

    for (let i = 0; i < args.milestones.length; i++) {
      const milestone = args.milestones[i];

      let requiresId: import("./_generated/dataModel").Id<"milestones"> | undefined = undefined;
      if (milestone.requiresPriorMilestoneId) {
        requiresId = milestoneMap.get(milestone.requiresPriorMilestoneId);
      }

      const insertedId = await ctx.db.insert("milestones", {
        projectId,
        name: milestone.name,
        description: milestone.description,
        valueKobo: milestone.valueKobo,
        orderIndex: i + 1,
        status: "PENDING",
        acceptanceCriteria: milestone.acceptanceCriteria,
        requiresPriorMilestoneId: requiresId,
        submissionNote: milestone.submissionNote,
        createdAt: now,
      });

      if (milestone.templateMilestoneId) {
        milestoneMap.set(milestone.templateMilestoneId, insertedId);
      }
    }

    return { projectId };
  },
});

/**
 * Update the total project value (owner only)
 */
export const updateProjectTotalValue = mutation({
  args: {
    projectId: v.id("projects"),
    totalValueKobo: v.number(),
  },
  handler: async (ctx, { projectId, totalValueKobo }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new ConvexError("Project not found");
    if (project.ownerClerkId !== identity.subject) {
      throw new ConvexError("Only the project owner can update the total value");
    }

    if (totalValueKobo <= 0) {
      throw new ConvexError("Total value must be greater than zero");
    }

    if (totalValueKobo < project.escrowBalanceKobo) {
      throw new ConvexError("Total value cannot be less than the current escrow balance");
    }

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const milestoneSum = milestones.reduce((sum, m) => sum + m.valueKobo, 0);
    if (totalValueKobo < milestoneSum) {
      throw new ConvexError(
        "Total value cannot be less than the sum of milestone tranches. Reduce milestone values first."
      );
    }

    await ctx.db.patch(projectId, { totalValueKobo });
  },
});

/**
 * Link a contractor to a project by their Clerk ID
 */
export const linkContractor = mutation({
  args: {
    projectId: v.id("projects"),
    contractorClerkId: v.string(),
  },
  handler: async (ctx, { projectId, contractorClerkId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new ConvexError("Project not found");
    if (project.ownerClerkId !== identity.subject) {
      throw new ConvexError("Only the project owner can link a contractor");
    }

    await ctx.db.patch(projectId, { contractorClerkId });
  },
});
