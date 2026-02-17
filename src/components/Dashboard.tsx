import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  LogOut,
  Plus,
  Heart,
  History,
  Disc3,
  Menu,
  X,
} from "lucide-react";
import { GenerateModal } from "./GenerateModal";
import { TrackCard } from "./TrackCard";
import { Player } from "./Player";
import { Id } from "../../convex/_generated/dataModel";

type Tab = "all" | "favorites" | "recent";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<Id<"tracks"> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allTracks = useQuery(api.tracks.list, {});
  const favorites = useQuery(api.favorites.list, {});
  const recentlyPlayed = useQuery(api.tracks.getRecentlyPlayed, {});

  const tracks =
    activeTab === "all"
      ? allTracks
      : activeTab === "favorites"
        ? favorites
        : recentlyPlayed;

  const handlePlay = (trackId: Id<"tracks">) => {
    setCurrentTrackId(trackId);
  };

  return (
    <div className="min-h-screen relative pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                <Music className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-display text-xl font-bold hidden sm:block">Serenity</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {[
                { id: "all" as Tab, icon: Disc3, label: "All Tracks" },
                { id: "favorites" as Tab, icon: Heart, label: "Favorites" },
                { id: "recent" as Tab, icon: History, label: "Recent" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setShowGenerate(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg shadow-purple-500/25"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Generate</span>
              </motion.button>

              <motion.button
                onClick={() => signOut()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all hidden md:flex"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-white/60 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-2 border-t border-white/5 pt-4"
              >
                <div className="flex flex-col gap-2">
                  {[
                    { id: "all" as Tab, icon: Disc3, label: "All Tracks" },
                    { id: "favorites" as Tab, icon: Heart, label: "Favorites" },
                    { id: "recent" as Tab, icon: History, label: "Recent" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? "bg-purple-500/20 text-purple-300"
                          : "text-white/60"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl lg:text-4xl font-display font-bold mb-3">
            {activeTab === "all"
              ? "Your Music Library"
              : activeTab === "favorites"
                ? "Favorite Tracks"
                : "Recently Played"}
          </h1>
          <p className="text-white/50 text-lg">
            {activeTab === "all"
              ? "All your generated calming music in one place"
              : activeTab === "favorites"
                ? "Tracks you've marked as favorites"
                : "Your listening history"}
          </p>
        </motion.div>

        {/* Tracks Grid */}
        {tracks === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
              {activeTab === "all" ? (
                <Disc3 className="w-12 h-12 text-purple-400" />
              ) : activeTab === "favorites" ? (
                <Heart className="w-12 h-12 text-purple-400" />
              ) : (
                <History className="w-12 h-12 text-purple-400" />
              )}
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">
              {activeTab === "all"
                ? "No tracks yet"
                : activeTab === "favorites"
                  ? "No favorites yet"
                  : "No recent plays"}
            </h3>
            <p className="text-white/50 text-center mb-6 max-w-sm">
              {activeTab === "all"
                ? "Generate your first calming track to get started"
                : activeTab === "favorites"
                  ? "Like some tracks to see them here"
                  : "Play some tracks to build your history"}
            </p>
            {activeTab === "all" && (
              <motion.button
                onClick={() => setShowGenerate(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg shadow-purple-500/25"
              >
                <Plus className="w-5 h-5" />
                Generate Track
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
          >
            {tracks.map((track: NonNullable<typeof tracks>[number], index: number) => (
              <motion.div
                key={track._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TrackCard
                  track={track}
                  onPlay={() => handlePlay(track._id)}
                  isPlaying={currentTrackId === track._id}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
      </AnimatePresence>

      {/* Player */}
      <Player trackId={currentTrackId} onClose={() => setCurrentTrackId(null)} />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center bg-[#0a0a0f]/80 backdrop-blur-sm border-t border-white/5" style={{ zIndex: currentTrackId ? 10 : 30 }}>
        <p className="text-white/30 text-xs">
          Requested by <span className="text-white/40">@stringer_kade</span> · Built by <span className="text-white/40">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
