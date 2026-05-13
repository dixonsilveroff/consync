import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const getProjectById = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const setProjectVirtualAccount = internalMutation({
  args: {
    projectId: v.id("projects"),
    squadVirtualAccountNumber: v.string(),
    squadCustomerIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    await ctx.db.patch(args.projectId, {
      squadVirtualAccountNumber: args.squadVirtualAccountNumber,
      squadCustomerIdentifier: args.squadCustomerIdentifier,
    });
  },
});
