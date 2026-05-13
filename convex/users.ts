import { query, mutation, internalMutation } from "./_generated/server";
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
      // Check for pending invitations for this email
      const invitations = await ctx.db
        .query("invitations")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .collect();

      const initialRole = invitations.length > 0 ? "contractor" : "owner";

      // Create new user
      const newUserId = await ctx.db.insert("users", {
        clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: initialRole,
        createdAt: Date.now(),
      });

      // If they were invited, link them to the projects and clean up invitations
      if (invitations.length > 0) {
        for (const invite of invitations) {
          await ctx.db.patch(invite.projectId, {
            contractorClerkId: clerkId,
          });
          await ctx.db.delete(invite._id);
        }
      }

      return newUserId;
    }
  },
});

/**
 * Get the currently authenticated user's profile.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

/**
 * Check whether the current contractor has verified bank details.
 */
export const contractorBankStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { hasBankDetails: false };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "contractor") {
      return { hasBankDetails: false };
    }

    return {
      hasBankDetails:
        Boolean(user.bankCode) &&
        Boolean(user.bankAccountNumber) &&
        Boolean(user.bankAccountName),
      bankAccountName: user.bankAccountName ?? null,
      bankCode: user.bankCode ?? null,
      bankAccountNumber: user.bankAccountNumber
        ? user.bankAccountNumber.slice(-4)
        : null,
    };
  },
});

/**
 * Internal mutation: save verified contractor bank details.
 */
export const saveContractorBankDetails = internalMutation({
  args: {
    userId: v.id("users"),
    bankCode: v.string(),
    bankAccountNumber: v.string(),
    bankAccountName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      bankCode: args.bankCode,
      bankAccountNumber: args.bankAccountNumber,
      bankAccountName: args.bankAccountName,
      bankVerifiedAt: Date.now(),
    });
  },
});
