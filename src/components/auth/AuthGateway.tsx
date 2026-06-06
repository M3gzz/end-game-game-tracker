'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Trophy, Lock, User, Mail, Sparkles, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthGateway() {
  const { login, register, checkMigration } = useTrackerStore();
  const [isRegister, setIsRegister] = React.useState(false);
  
  // Form Fields
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  // UI Feedback
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Proactively run migration check to convert legacy data if any
    checkMigration();
  }, [checkMigration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (isRegister) {
      if (!name.trim() || !email.trim()) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      
      // Attempt Register
      const res = register(username, name, email, password);
      if (!res.success) {
        setError(res.error || 'Registration failed.');
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } else {
      // Attempt Login
      const res = login(username, password);
      if (!res.success) {
        setError(res.error || 'Login failed.');
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleGuestMode = () => {
    // Set guest login state directly by calling logout (which initializes guest profile/progress & sets currentUsername to null)
    // Wait, let's make a guest state by logging in as 'guest'
    useTrackerStore.setState({
      currentUsername: 'guest',
      profile: {
        name: 'Guest Player',
        username: 'guest',
        avatarUrl: 'linear-gradient(135deg, #71717a 0%, #3f3f46 100%)',
        bio: 'Sign in to customize your profile, sync with Steam, and save achievements.',
        avatarFrame: 'none',
        showcasedAchievements: [],
        following: [],
      },
      progress: {
        ownedGames: [],
        unlockedAchievements: {},
        achievementNotes: {},
        favoriteGames: [],
        pinnedGames: [],
        backlogGames: [],
        wishlistGames: [],
        playtimes: {},
        activeHunting: [],
        completionGoals: {},
        streakCount: 0,
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 overflow-hidden font-sans">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Cyber Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.15]" />

      <div className="relative w-full max-w-lg mx-4">
        {/* Glow behind the glass panel */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        
        {/* Glassmorphic Panel */}
        <div className="relative bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center">
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <Trophy className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-zinc-200 to-indigo-400">
              EndGame
            </h1>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
              Where your achievements forge your legacy. Join the S-Rank community.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key={isRegister ? 'register' : 'login'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-4"
              >
                {/* Form fields */}
                {isRegister && (
                  <>
                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Megan Hunter"
                          className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="m3gzzcsgo@gmail.com"
                          className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Username Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="hunter_megan"
                      className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Security Key (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold text-center mt-2">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all"
                >
                  {loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Initialize Session')}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full text-center flex flex-col items-center py-6"
              >
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Registration Complete!</h3>
                <p className="text-xs text-zinc-400 mt-2 max-w-xs">
                  Your new profile is fully constructed in our offline storage cabinet. Let&apos;s start hunting!
                </p>
                <button
                  onClick={() => setIsRegister(false)}
                  className="mt-6 px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Form / Guest Mode Option */}
          {!success && (
            <div className="w-full border-t border-zinc-800/80 pt-6 mt-6 flex flex-col items-center gap-3.5">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                {isRegister ? 'Already registered? Sign In' : "Don't have a profile? Register one"}
              </button>

              <div className="flex items-center gap-2 w-full max-w-[150px]">
                <div className="h-[1px] bg-zinc-800/80 flex-1" />
                <span className="text-[10px] text-zinc-650 uppercase font-extrabold tracking-wider">or</span>
                <div className="h-[1px] bg-zinc-800/80 flex-1" />
              </div>

              <button
                onClick={handleGuestMode}
                className="flex items-center justify-center gap-2 w-full bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 py-3 rounded-xl text-xs font-bold transition-all"
              >
                <Gamepad2 className="w-4 h-4" />
                Browse as Guest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
