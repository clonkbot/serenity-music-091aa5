import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const tracks = await Promise.all(
      favorites.map(async (fav) => {
        const track = await ctx.db.get(fav.trackId);
        return track;
      })
    );

    return tracks.filter((t) => t !== null && t.status === "ready");
  },
});

export const isFavorite = query({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_track", (q) =>
        q.eq("userId", userId).eq("trackId", args.trackId)
      )
      .first();

    return favorite !== null;
  },
});

export const toggle = mutation({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_track", (q) =>
        q.eq("userId", userId).eq("trackId", args.trackId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("favorites", {
        userId,
        trackId: args.trackId,
        createdAt: Date.now(),
      });
      return true;
    }
  },
});
