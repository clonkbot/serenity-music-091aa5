import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    genre: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let tracksQuery = ctx.db
      .query("tracks")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    const tracks = await tracksQuery.order("desc").collect();

    if (args.genre) {
      return tracks.filter((t) => t.genre === args.genre);
    }

    return tracks;
  },
});

export const getById = query({
  args: { id: v.id("tracks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const track = await ctx.db.get(args.id);
    if (!track || track.userId !== userId) return null;

    return track;
  },
});

export const getReady = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "ready")
      )
      .order("desc")
      .collect();

    return tracks;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    prompt: v.string(),
    genre: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const trackId = await ctx.db.insert("tracks", {
      userId,
      title: args.title,
      prompt: args.prompt,
      genre: args.genre,
      status: "pending",
      createdAt: Date.now(),
    });

    return trackId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tracks"),
    status: v.string(),
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sunoTaskId: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const track = await ctx.db.get(args.id);
    if (!track || track.userId !== userId) {
      throw new Error("Track not found");
    }

    const updates: Record<string, unknown> = { status: args.status };
    if (args.audioUrl) updates.audioUrl = args.audioUrl;
    if (args.imageUrl) updates.imageUrl = args.imageUrl;
    if (args.sunoTaskId) updates.sunoTaskId = args.sunoTaskId;
    if (args.duration) updates.duration = args.duration;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tracks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const track = await ctx.db.get(args.id);
    if (!track || track.userId !== userId) {
      throw new Error("Track not found");
    }

    // Also remove from favorites and history
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_track", (q) => q.eq("trackId", args.id))
      .collect();
    for (const fav of favorites) {
      await ctx.db.delete(fav._id);
    }

    const history = await ctx.db
      .query("playHistory")
      .filter((q) => q.eq(q.field("trackId"), args.id))
      .collect();
    for (const h of history) {
      await ctx.db.delete(h._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const recordPlay = mutation({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("playHistory", {
      userId,
      trackId: args.trackId,
      playedAt: Date.now(),
    });
  },
});

export const getRecentlyPlayed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const history = await ctx.db
      .query("playHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    const trackIds = [...new Set(history.map((h) => h.trackId))];
    const tracks = await Promise.all(
      trackIds.slice(0, 5).map((id) => ctx.db.get(id))
    );

    return tracks.filter((t) => t !== null && t.status === "ready");
  },
});
