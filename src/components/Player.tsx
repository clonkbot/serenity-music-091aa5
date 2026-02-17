import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Heart,
  Music,
  Cloud,
  Coffee,
  Piano,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface PlayerProps {
  trackId: Id<"tracks"> | null;
  onClose: () => void;
}

const genreIcons: Record<string, typeof Music> = {
  jazz: Music,
  ambient: Cloud,
  lofi: Coffee,
  classical: Piano,
};

export function Player({ trackId, onClose }: PlayerProps) {
  const track = useQuery(api.tracks.getById, trackId ? { id: trackId } : "skip");
  const recordPlay = useMutation(api.tracks.recordPlay);
  const toggleFavorite = useMutation(api.favorites.toggle);
  const isFavorite = useQuery(
    api.favorites.isFavorite,
    trackId ? { trackId } : "skip"
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (track?.audioUrl && audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      recordPlay({ trackId: track._id });
    }
  }, [track?._id, track?.audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!trackId || !track) return null;

  const GenreIcon = genreIcons[track.genre] || Music;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-10 left-0 right-0 z-50 px-4 pb-4"
      >
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a24]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="relative h-1 bg-white/10">
              <div
                className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="p-4 flex items-center gap-4">
              {/* Track Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0"
                  animate={isPlaying ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <GenreIcon className="w-6 h-6 text-purple-400" />
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-medium text-white truncate">{track.title}</h3>
                  <p className="text-sm text-white/50 capitalize">{track.genre}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 text-white/40 hover:text-white transition-colors hidden sm:block">
                  <SkipBack className="w-5 h-5" />
                </button>

                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-black" />
                  ) : (
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  )}
                </motion.button>

                <button className="p-2 text-white/40 hover:text-white transition-colors hidden sm:block">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Time */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/50 min-w-[100px] justify-center">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Volume & Actions */}
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>

                <motion.button
                  onClick={() => toggleFavorite({ trackId: track._id })}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite ? "text-pink-400" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </motion.button>

                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
