import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// ─── QUERIES ─────────────────────────────────────────────────

/**
 * Get all projects for the currently authenticated owner
 */
export const getOwnerProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerClerkId", identity.subject))
      .collect();
  },
});

/**
 * Get all projects assigned to the authenticated contractor
 */
export const getContractorProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    return await ctx.db
      .query("projects")
      .withIndex("by_contractor", (q) =>
        q.eq("contractorClerkId", identity.subject)
      )
      .collect();
  },
});

/**
 * Get a single project by ID (validates ownership or contractor access)
 */
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new ConvexError("Project not found");

    // Authorize: user must be owner or contractor
    if (
      project.ownerClerkId !== identity.subject &&
      project.contractorClerkId !== identity.subject
    ) {
      throw new ConvexError("Access denied");
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
    projectType: v.string(),
    location: v.optional(v.string()),
    siteLatitude: v.optional(v.number()),
    siteLongitude: v.optional(v.number()),
    totalValueKobo: v.number(),
    contractorEmail: v.optional(v.string()),
    milestones: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        valueKobo: v.number(),
        acceptanceCriteria: v.array(v.string()),
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
      location: args.location,
      siteLatitude: args.siteLatitude,
      siteLongitude: args.siteLongitude,
      createdAt: now,
    });

    // Create milestones
    for (let i = 0; i < args.milestones.length; i++) {
      const milestone = args.milestones[i];
      await ctx.db.insert("milestones", {
        projectId,
        name: milestone.name,
        description: milestone.description,
        valueKobo: milestone.valueKobo,
        orderIndex: i + 1,
        status: "PENDING",
        acceptanceCriteria: milestone.acceptanceCriteria,
        createdAt: now,
      });
    }

    // TODO: Phase 3 — schedule setupSquadVirtualAccount action

    return { projectId };
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
