import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { Music, Sparkles, Headphones } from "lucide-react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid email or password" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Left Side - Branding */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center lg:text-left max-w-md"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="relative">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Music className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
              Serenity
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="text-white/90">Calming Music</span>
          </h1>

          <p className="text-white/60 text-lg lg:text-xl leading-relaxed mb-8">
            Generate personalized jazz, ambient, and lo-fi music designed to help you relax, focus, and find peace.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            {[
              { icon: Music, label: "Jazz" },
              { icon: Sparkles, label: "Ambient" },
              { icon: Headphones, label: "Lo-fi" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <item.icon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/70">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating music notes decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-500/20 text-4xl"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                rotate: [-5, 5, -5],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              ♪
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 p-6 lg:p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-semibold mb-2">
                {flow === "signIn" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-white/50 text-sm">
                {flow === "signIn"
                  ? "Sign in to access your music library"
                  : "Start generating calming music today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <input name="flow" type="hidden" value={flow} />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                    />
                    Loading...
                  </span>
                ) : flow === "signIn" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-4 text-white/40 text-sm">or</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            <motion.button
              onClick={handleAnonymous}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              Continue as Guest
            </motion.button>

            <p className="text-center mt-6 text-white/50 text-sm">
              {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setFlow(flow === "signIn" ? "signUp" : "signIn");
                  setError(null);
                }}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-white/30 text-xs">
          Requested by <span className="text-white/40">@stringer_kade</span> · Built by <span className="text-white/40">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
