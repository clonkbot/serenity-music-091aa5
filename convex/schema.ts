import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Generated music tracks
  tracks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    prompt: v.string(),
    genre: v.string(), // "jazz", "ambient", "lofi", "classical"
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.string(), // "pending", "generating", "ready", "failed"
    sunoTaskId: v.optional(v.string()),
    duration: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  // User's favorite tracks
  favorites: defineTable({
    userId: v.id("users"),
    trackId: v.id("tracks"),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_track", ["trackId"])
    .index("by_user_and_track", ["userId", "trackId"]),

  // Playback history
  playHistory: defineTable({
    userId: v.id("users"),
    trackId: v.id("tracks"),
    playedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_recent", ["userId", "playedAt"]),
});
