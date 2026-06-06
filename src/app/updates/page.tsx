/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Bell, Check, Sparkles, Terminal, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlatformUpdatesPage() {
  const { markUpdatesAsRead } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Mark updates as read immediately when this page is viewed
    markUpdatesAsRead();
  }, [markUpdatesAsRead]);

  if (!mounted) {
    return (
      <div className="flex-1 space-y-8 animate-pulse pt-8">
        <div className="h-10 w-48 bg-zinc-900 rounded-xl" />
        <div className="space-y-4">
          <div className="h-32 bg-zinc-900 rounded-3xl" />
          <div className="h-32 bg-zinc-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  const changelogs = [
    {
      version: "Version 1.3.0",
      date: "June 2026",
      tagline: "The Multi-User & Backlog Expansion",
      status: "Latest Update",
      icon: Sparkles,
      color: "border-purple-500 bg-purple-950/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
      additions: [
        "**Backlog Roulette Wheel**: Added a CS:GO-style physics carousel wheel to help pick a random game from your backlog library drawers.",
        "**Multi-User Auth Session Gateway**: Secured client-side profiles. Created a cinematic landing gateway supporting password validation.",
        "**Onboarding Setup Wizard**: Guided interactive steps introducing new players to profile design, Steam IDs, and backlog routines.",
        "**Site Founder Override Styling**: Customized layouts for core developers (`hunter_megan` & `m3gzz`) rendering a slow-spinning conic border, Founder badge, and floating neon canvas particles.",
        "**Updates Tab**: Built this updates timeline view, integrated with a glowing sidebar unread notification dot."
      ],
      fixes: [
        "Fixed TypeScript parameter inference mismatch inside the store's Zustand persist middleware wrapper.",
        "Resolved an array compilation mismatch during `Array.from(new Set(...))` conversions, enforcing clean index-filtering instead."
      ]
    },
    {
      version: "Version 1.2.0",
      date: "May 2026",
      tagline: "Visual Identity Customizer",
      status: "Major",
      icon: Terminal,
      color: "border-indigo-500 bg-indigo-950/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]",
      additions: [
        "**Expanded Customizer Options**: Injected primary and secondary custom colors directly into the page stylesheet via CSS variables.",
        "**Animated Cyber Patterns**: Added Scanlines, Constellations, Hex Grid, and Neon Circuit backgrounds in the customizer.",
        "**Avatar Frame Streaks**: Earn rewards like Cyber Pulsar or Ember Glow border rings by maintaining achievement unlock streaks."
      ],
      fixes: [
        "Adjusted profile custom spotlight display to correctly filter achievements by base S-Rank title."
      ]
    },
    {
      version: "Version 1.1.0",
      date: "April 2026",
      tagline: "Steam API Integration",
      status: "Sync Support",
      icon: BadgeCheck,
      color: "border-blue-500 bg-blue-950/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
      additions: [
        "**Steam OpenID Syncing**: Connected profile variables directly to public Steam account names, avatars, and bios.",
        "**Automated Achievement Parsing**: Scanned Steam libraries in parallel to update unlocked trophies and total playtimes instantly."
      ],
      fixes: [
        "Implemented secure Web API Key validation checks to prevent sync timeouts."
      ]
    },
    {
      version: "Version 1.0.0",
      date: "March 2026",
      tagline: "Platform Genesis",
      status: "Core release",
      icon: Check,
      color: "border-zinc-800 bg-zinc-900/30 text-zinc-400",
      additions: [
        "**S-Rank Game Tracking**: Integrated 30 preloaded S-Tier titles (Elden Ring, Stray, Cyberpunk) with detailed trophy structures.",
        "**Achievement Notes**: Add guides and hints to individual achievements.",
        "**Social Hub & Speedrun Challenges**: Created post feeds, comments, and DM duels."
      ],
      fixes: []
    }
  ];

  return (
    <div className="flex-1 space-y-8 pt-4 md:pt-8 font-sans pb-24 md:pb-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <Bell className="w-8 h-8 text-purple-400" />
          Update Terminal
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5">
          Platform announcements, patch notes, and version logs.
        </p>
      </div>

      {/* Changelog Timeline */}
      <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-900">
        {changelogs.map((log, logIdx) => {
          const ActiveIcon = log.icon;
          return (
            <motion.div
              key={log.version}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: logIdx * 0.1, duration: 0.3 }}
              className="relative pl-14 flex flex-col md:flex-row gap-6 md:gap-10 items-start group"
            >
              {/* Timeline Dot Icon */}
              <div className={`absolute left-2.5 top-1 w-7 h-7 rounded-lg border flex items-center justify-center z-10 transition-colors ${log.color}`}>
                <ActiveIcon className="w-4 h-4" />
              </div>

              {/* Version & Date Card */}
              <div className="w-full md:w-52 shrink-0 space-y-1 mt-1.5">
                <span className="text-sm font-extrabold text-white block group-hover:text-purple-400 transition-colors">
                  {log.version}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  {log.date}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 font-black uppercase tracking-wider block w-max mt-2">
                  {log.status}
                </span>
              </div>

              {/* Changelog Content */}
              <div className="flex-1 bg-zinc-900/40 border border-zinc-850 p-6 md:p-8 rounded-3xl shadow-lg w-full">
                <h3 className="text-lg font-black text-white tracking-tight">
                  {log.tagline}
                </h3>

                {/* Additions list */}
                {log.additions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-400 block mb-2">
                      New Features
                    </h4>
                    <ul className="space-y-2">
                      {log.additions.map((item, idx) => {
                        // Highlight markdown style **bold** text in timeline
                        const parts = item.split('**');
                        return (
                          <li key={idx} className="text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
                            <span className="text-purple-400 mt-1 shrink-0">✦</span>
                            <span>
                              {parts.map((p, pIdx) => 
                                pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-white">{p}</strong> : p
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Fixes list */}
                {log.fixes.length > 0 && (
                  <div className="mt-6 border-t border-zinc-850/60 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-2">
                      Bug Fixes & Maintenance
                    </h4>
                    <ul className="space-y-2">
                      {log.fixes.map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-400 leading-relaxed flex items-start gap-2.5">
                          <span className="text-zinc-500 mt-1 shrink-0">▪</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
