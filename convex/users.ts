import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/**
 * Synchronize the authenticated Clerk user to the Convex users table.
 * If the user does not exist, they are created with the default role of 'owner'.
 * If they do exist, their profile details (name, email) are updated to stay in sync with Clerk.
 */
export const syncUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const clerkId = identity.subject; // The Clerk user ID

    // Check if the user already exists in Convex
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingUser) {
      // Update existing user to keep profile info in sync
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
      });
      return existingUser._id;
    } else {
      // Create new user with default role "owner"
      const newUserId = await ctx.db.insert("users", {
        clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: "owner", // Default role
        createdAt: Date.now(),
      });
      return newUserId;
    }
  },
});
