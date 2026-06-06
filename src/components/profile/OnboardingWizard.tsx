'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Trophy, Palette, Link2, Sparkles, Gamepad2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingWizard() {
  const { currentUsername, hasCompletedOnboarding, completeOnboarding } = useTrackerStore();
  const [currentStep, setCurrentStep] = React.useState(0);

  // Do not render if not logged in, if guest, or if already completed
  if (!currentUsername || currentUsername === 'guest' || hasCompletedOnboarding[currentUsername]) {
    return null;
  }

  const steps = [
    {
      title: "Welcome to EndGame",
      icon: Trophy,
      color: "from-purple-500 to-indigo-500",
      description: "You've forged your entrance into the ultimate S-Rank achievement hunting community. EndGame is designed to track your completions, document your speedruns, and help you clear your library backlog.",
      tips: [
        "Track achievements with custom notes",
        "Participate in community speedrun duels",
        "Conquer your library backlog"
      ]
    },
    {
      title: "Design Your Identity",
      icon: Palette,
      color: "from-pink-500 to-rose-500",
      description: "Express your gaming persona. Head over to the Profile tab to choose avatar frames (unlocked via achievement streaks), set responsive color presets, configure backgrounds like Scanlines or Cyber Circuit, and set your clan tag.",
      tips: [
        "Earn Streak Rewards to unlock custom frames",
        "Set a custom title representing your rank",
        "Choose spotlight games to pin on your profile"
      ]
    },
    {
      title: "Synchronize Steam Library",
      icon: Link2,
      color: "from-blue-500 to-cyan-500",
      description: "No need to manually input every single achievement. You can link your Steam account directly. Enter your Steam ID (the 17-digit number starting with 765...) and sync achievements instantly.",
      tips: [
        "Find your Steam ID in your Steam Profile URLs",
        "Input your own Steam Web API key for secure syncing",
        "Track unlocked achievements automatically"
      ]
    },
    {
      title: "Vanquish Your Backlog",
      icon: Gamepad2,
      color: "from-amber-500 to-orange-500",
      description: "Stop hoarding, start playing! Add games to your Library or Wishlist, and toggle backlog status. Use our Backlog Page randomizer wheel to gamify selecting what to play next.",
      tips: [
        "Browse unplayed games separately",
        "Click the Randomize button to spin the selection wheel",
        "Accept challenges and mark active hunts"
      ]
    }
  ];

  const ActiveIcon = steps[currentStep].icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 font-sans">
      <div className="relative w-full max-w-xl">
        {/* Glow backdrop */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${steps[currentStep].color} rounded-3xl blur opacity-25 transition-all duration-500`} />

        {/* Glass Content Card */}
        <div className="relative bg-zinc-900 border border-zinc-850/90 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1.5 flex-1 max-w-[200px]">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                    idx <= currentStep ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Animated step transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col flex-1"
            >
              {/* Step Icon */}
              <div className={`w-14 h-14 bg-gradient-to-r ${steps[currentStep].color} rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg`}>
                <ActiveIcon className="w-7 h-7" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">
                {steps[currentStep].title}
              </h2>

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {steps[currentStep].description}
              </p>

              {/* Hints Box */}
              <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block mb-2">
                  Pro Tips
                </span>
                <ul className="space-y-2">
                  {steps[currentStep].tips.map((tip, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-zinc-850 pt-5 mt-2">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-850/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
            >
              {currentStep === steps.length - 1 ? 'Start Hunting' : 'Next Step'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
