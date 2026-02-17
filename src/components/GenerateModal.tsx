import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { X, Sparkles, Music, Cloud, Coffee, Piano } from "lucide-react";

interface GenerateModalProps {
  onClose: () => void;
}

const genres = [
  {
    id: "jazz",
    name: "Jazz",
    icon: Music,
    color: "from-amber-500 to-orange-600",
    description: "Smooth saxophone and piano",
  },
  {
    id: "ambient",
    name: "Ambient",
    icon: Cloud,
    color: "from-cyan-500 to-blue-600",
    description: "Ethereal and atmospheric",
  },
  {
    id: "lofi",
    name: "Lo-fi",
    icon: Coffee,
    color: "from-pink-500 to-rose-600",
    description: "Chill beats to relax",
  },
  {
    id: "classical",
    name: "Classical",
    icon: Piano,
    color: "from-violet-500 to-purple-600",
    description: "Serene piano and strings",
  },
];

const promptSuggestions = [
  "Peaceful evening by the fireplace",
  "Rainy day in a cozy cafe",
  "Sunset on a quiet beach",
  "Morning meditation in the garden",
  "Stargazing on a clear night",
  "Reading in a warm library",
];

export function GenerateModal({ onClose }: GenerateModalProps) {
  const [selectedGenre, setSelectedGenre] = useState("jazz");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const createTrack = useMutation(api.tracks.create);
  const generateMusic = useAction(api.suno.generateMusic);

  const handleGenerate = async () => {
    if (!title.trim() || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const trackId = await createTrack({
        title: title.trim(),
        prompt: prompt.trim(),
        genre: selectedGenre,
      });

      // Start generation in background
      generateMusic({
        trackId,
        prompt: prompt.trim(),
        genre: selectedGenre,
      }).catch(console.error);

      onClose();
    } catch (error) {
      console.error("Failed to create track:", error);
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#12121a] rounded-3xl border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#12121a] p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-semibold">Generate Music</h2>
            <p className="text-white/50 text-sm">Create your calming soundtrack</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Genre Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-3">Choose Genre</label>
            <div className="grid grid-cols-2 gap-3">
              {genres.map((genre) => (
                <motion.button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-2xl text-left transition-all overflow-hidden ${
                    selectedGenre === genre.id
                      ? "bg-white/10 border-2 border-purple-500/50"
                      : "bg-white/5 border-2 border-transparent hover:bg-white/[0.07]"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-10`}
                  />
                  <div className="relative">
                    <genre.icon className="w-6 h-6 mb-2 text-white/80" />
                    <h3 className="font-medium text-white">{genre.name}</h3>
                    <p className="text-xs text-white/50 mt-1">{genre.description}</p>
                  </div>
                  {selectedGenre === genre.id && (
                    <motion.div
                      layoutId="genreIndicator"
                      className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-500"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Track Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your track a name..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Describe the Mood</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the atmosphere or feeling you want..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
          </div>

          {/* Prompt Suggestions */}
          <div>
            <label className="block text-sm text-white/60 mb-3">Suggestions</label>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!title.trim() || !prompt.trim() || isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Creating your track...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Music
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
