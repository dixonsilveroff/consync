import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const migrateSubmissions = internalMutation({
  args: {
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // We can't strictly query "old" docs because the schema was updated.
    // However, Convex allows us to read the documents, and if we re-save them, they must match the new schema.
    // We'll paginate through all submissions.
    const paginated = await ctx.db
      .query("submissions")
      .paginate({ cursor: args.cursor ?? null, numItems: 50 });

    for (const doc of paginated.page) {
      // Cast to any to access the old field
      const anyDoc = doc as any;
      
      // If it has photoStorageIds but not keyFrameStorageIds
      if (anyDoc.photoStorageIds && (!anyDoc.keyFrameStorageIds || anyDoc.keyFrameStorageIds.length === 0)) {
        await ctx.db.patch(doc._id, {
          keyFrameStorageIds: anyDoc.photoStorageIds,
          frameCount: anyDoc.photoCount || anyDoc.photoStorageIds.length,
          photoStorageIds: undefined,
          photoCount: undefined,
        });
      }
    }

    if (!paginated.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrations.migratePhotoSubmissions.migrateSubmissions, {
        cursor: paginated.continueCursor
      });
    }
  }
});
