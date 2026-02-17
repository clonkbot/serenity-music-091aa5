import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Trash2, Loader2, AlertCircle, Music, Cloud, Coffee, Piano } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";

interface TrackCardProps {
  track: Doc<"tracks">;
  onPlay: () => void;
  isPlaying: boolean;
}

const genreConfig: Record<string, { icon: typeof Music; gradient: string; bg: string }> = {
  jazz: {
    icon: Music,
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
  },
  ambient: {
    icon: Cloud,
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-500/10",
  },
  lofi: {
    icon: Coffee,
    gradient: "from-pink-500 to-rose-600",
    bg: "bg-pink-500/10",
  },
  classical: {
    icon: Piano,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
  },
};

export function TrackCard({ track, onPlay, isPlaying }: TrackCardProps) {
  const toggleFavorite = useMutation(api.favorites.toggle);
  const deleteTrack = useMutation(api.tracks.remove);
  const isFavorite = useQuery(api.favorites.isFavorite, { trackId: track._id });

  const config = genreConfig[track.genre] || genreConfig.ambient;
  const GenreIcon = config.icon;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({ trackId: track._id });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this track?")) {
      deleteTrack({ id: track._id });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden hover:border-white/10 transition-all"
    >
      {/* Cover Art */}
      <div className={`aspect-square relative ${config.bg}`}>
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20`}
        />

        {/* Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id={`pattern-${track._id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="currentColor" className="text-white/20" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#pattern-${track._id})`} />
          </svg>
        </div>

        {/* Genre Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <GenreIcon className="w-16 h-16 text-white/40" />
          </motion.div>
        </div>

        {/* Status Overlay */}
        {track.status !== "ready" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            {track.status === "generating" || track.status === "pending" ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                <span className="text-sm text-white/70">
                  {track.status === "pending" ? "Queued..." : "Generating..."}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <span className="text-sm text-white/70">Generation failed</span>
              </div>
            )}
          </div>
        )}

        {/* Play Button */}
        {track.status === "ready" && (
          <motion.button
            onClick={onPlay}
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-black" />
              ) : (
                <Play className="w-6 h-6 text-black ml-1" />
              )}
            </div>
          </motion.button>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={handleFavorite}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite
                ? "bg-pink-500/20 text-pink-400"
                : "bg-black/40 text-white/60 hover:text-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </motion.button>
          <motion.button
            onClick={handleDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-black/40 text-white/60 hover:text-red-400 backdrop-blur-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white truncate">{track.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/40 capitalize">{track.genre}</span>
          <span className="text-xs text-white/40">{formatDate(track.createdAt)}</span>
        </div>
      </div>

      {/* Playing Indicator */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
      )}
    </motion.div>
  );
}
