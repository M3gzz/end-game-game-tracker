/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import Link from 'next/link';
import { Game } from '@/types';
import { useTrackerStore } from '@/store/trackerStore';
import { Star, Pin, Heart, Clock, Layers } from 'lucide-react';
import CompletionRing from '../ui/CompletionRing';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const { progress, toggleFavorite, togglePin } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-48 bg-zinc-900/40 border border-zinc-800 rounded-3xl animate-pulse" />
    );
  }

  const isFavorite = progress.favoriteGames.includes(game.id);
  const isPinned = progress.pinnedGames.includes(game.id);
  const playtime = progress.playtimes[game.id] || 0;

  // Check for dynamic custom achievements
  const customAchievements = progress.customAchievements?.[game.id] || [];
  const achievements = customAchievements.length > 0 ? customAchievements : game.achievements;

  // Split base vs. DLC achievements
  const baseAchievements = achievements.filter(ach => !ach.dlcId);
  const dlcAchievements = achievements.filter(ach => !!ach.dlcId);

  const baseTotal = baseAchievements.length;
  const baseUnlocked = baseAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
  const basePercentage = baseTotal > 0 ? (baseUnlocked / baseTotal) * 100 : 0;

  const dlcTotal = dlcAchievements.length;
  const dlcUnlocked = dlcAchievements.filter(ach => !!progress.unlockedAchievements[ach.id]).length;
  const dlcPercentage = dlcTotal > 0 ? (dlcUnlocked / dlcTotal) * 100 : 0;

  // Compute overall trophies unlocked per category
  const bronzeUnlocked = achievements.filter(
    ach => ach.tier === 'bronze' && !!progress.unlockedAchievements[ach.id]
  ).length;
  
  const silverUnlocked = achievements.filter(
    ach => ach.tier === 'silver' && !!progress.unlockedAchievements[ach.id]
  ).length;

  const goldUnlocked = achievements.filter(
    ach => ach.tier === 'gold' && !!progress.unlockedAchievements[ach.id]
  ).length;

  // Platinum is earned when base game reaches 100%
  const isPlatinumEarned = baseTotal > 0 && baseUnlocked === baseTotal;

  return (
    <div className="group relative rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/60 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden hover:scale-[1.01] hover:shadow-blue-500/5">
      {/* Upper Half: Banner & Cover art overlay */}
      <div className="relative h-44 overflow-hidden select-none border-b border-zinc-800/80">
        {/* Banner image background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={game.bannerUrl} 
          alt={game.title}
          className="w-full h-full object-cover blur-[1px] brightness-[0.4] group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Floating Controls (Pin, Favorite) */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              togglePin(game.id);
            }}
            className={`p-2 rounded-xl border transition-all hover:scale-110 cursor-pointer ${
              isPinned 
                ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={isPinned ? 'Unpin game' : 'Pin game'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-blue-500' : ''}`} />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(game.id);
            }}
            className={`p-2 rounded-xl border transition-all hover:scale-110 cursor-pointer ${
              isFavorite 
                ? 'bg-rose-600/20 border-rose-500 text-rose-400' 
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Cover Art & Title Overlay */}
        <div className="absolute bottom-4 left-4 flex gap-4 items-end">
          {/* Cover thumbnail */}
          <div className="w-16 h-20 bg-zinc-800 rounded-xl overflow-hidden shadow-xl border border-zinc-700/80 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={game.coverUrl} 
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 pr-4">
            <h3 className="font-extrabold text-white text-base truncate drop-shadow-md group-hover:text-blue-400 transition-colors">
              {game.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5 drop-shadow-sm">{game.developer}</p>
          </div>
        </div>
      </div>

      {/* Lower Half: Stats & Progress */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Game Stats (Hours, Difficulty, Platforms) */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 select-none">
          <div className="flex items-center gap-1.5" title="Playtime">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span className="font-semibold text-zinc-300">{playtime}h</span>
          </div>
          <div className="flex items-center gap-1.5" title="Difficulty Rating">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span className="font-semibold text-zinc-300">Diff: {game.estimatedDifficulty}/10</span>
          </div>
          {dlcTotal > 0 && (
            <div className="flex items-center gap-1" title="Has DLC achievements">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1 py-0.5 rounded font-semibold">DLC</span>
            </div>
          )}
        </div>

        {/* Trophies Cabinet */}
        <div className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-3 mb-4 justify-around select-none">
          {isPlatinumEarned && (
            <div className="flex flex-col items-center" title="Platinum Unlocked!">
              <span className="text-lg">🏆</span>
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5 glow-platinum">PLATINUM</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-zinc-400">🥉</span>
            <span className="text-xs font-bold text-zinc-200">{bronzeUnlocked}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-400">🥈</span>
            <span className="text-xs font-bold text-zinc-200">{silverUnlocked}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-400">🥇</span>
            <span className="text-xs font-bold text-zinc-200">{goldUnlocked}</span>
          </div>
        </div>

        {/* Base Completion Progress Ring & Bar */}
        <div className="flex items-center gap-4 border-t border-zinc-800/50 pt-4">
          <div className="shrink-0 select-none">
            <CompletionRing 
              percentage={basePercentage} 
              size={56} 
              strokeWidth={4.5} 
              ringColor={isPlatinumEarned ? '#a0b2c6' : '#3b82f6'}
              textSize="text-[10px]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center text-xs font-semibold select-none mb-1">
              <span className="text-zinc-400">Base Achievements</span>
              <span className="text-zinc-200">{baseUnlocked}/{baseTotal}</span>
            </div>
            
            {/* Simple progress bar */}
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isPlatinumEarned 
                    ? 'bg-gradient-to-r from-slate-400 to-slate-200 glow-platinum' 
                    : 'bg-blue-500'
                }`}
                style={{ width: `${basePercentage}%` }}
              />
            </div>

            {dlcTotal > 0 && (
              <div className="mt-2.5">
                <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 mb-0.5">
                  <span>DLC Achievements</span>
                  <span>{dlcUnlocked}/{dlcTotal}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${dlcPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Details CTA Button */}
        <Link 
          href={`/games/${game.id}`}
          className="mt-4 w-full py-3 bg-zinc-900/80 hover:bg-blue-600/10 border border-zinc-800 hover:border-blue-500/30 text-zinc-300 hover:text-blue-400 text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          View Achievements
        </Link>
      </div>
    </div>
  );
}
