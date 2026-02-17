import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Suno API integration for music generation
// Note: In production, SUNO_API_KEY should be set in Convex environment variables

const SUNO_API_BASE = "https://api.suno.ai/v1";

export const generateMusic = action({
  args: {
    trackId: v.id("tracks"),
    prompt: v.string(),
    genre: v.string(),
  },
  handler: async (ctx, args) => {
    // Update status to generating
    await ctx.runMutation(api.tracks.updateStatus, {
      id: args.trackId,
      status: "generating",
    });

    try {
      // Build the enhanced prompt based on genre
      const genrePrompts: Record<string, string> = {
        jazz: "smooth jazz, saxophone, piano, relaxing jazz melody",
        ambient: "ambient, atmospheric, ethereal, meditation music",
        lofi: "lo-fi hip hop, chill beats, relaxing study music",
        classical: "classical piano, calming orchestra, serene strings",
      };

      const enhancedPrompt = `${args.prompt}, ${genrePrompts[args.genre] || genrePrompts.ambient}`;

      // In production, this would call the actual Suno API
      // For demo purposes, we'll simulate the API response
      const apiKey = process.env.SUNO_API_KEY;

      if (apiKey) {
        // Real Suno API call
        const response = await fetch(`${SUNO_API_BASE}/generate`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            duration: 60,
            make_instrumental: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Suno API error: ${response.statusText}`);
        }

        const data = await response.json();

        await ctx.runMutation(api.tracks.updateStatus, {
          id: args.trackId,
          status: "ready",
          audioUrl: data.audio_url,
          imageUrl: data.image_url,
          sunoTaskId: data.id,
          duration: data.duration,
        });
      } else {
        // Demo mode: simulate generation with sample audio
        // Using royalty-free sample audio for demo
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const sampleAudioUrls: Record<string, string> = {
          jazz: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          ambient: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          classical: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        };

        await ctx.runMutation(api.tracks.updateStatus, {
          id: args.trackId,
          status: "ready",
          audioUrl: sampleAudioUrls[args.genre] || sampleAudioUrls.ambient,
          duration: 120,
        });
      }
    } catch (error) {
      console.error("Music generation failed:", error);
      await ctx.runMutation(api.tracks.updateStatus, {
        id: args.trackId,
        status: "failed",
      });
      throw error;
    }
  },
});
