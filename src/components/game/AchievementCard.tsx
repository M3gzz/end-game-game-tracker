/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { Achievement } from '@/types';
import { useTrackerStore } from '@/store/trackerStore';
import { Check, Eye, EyeOff, FileText, Calendar, Trash2, BookOpen, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AchievementCardProps {
  achievement: Achievement;
  gameTitle: string;
}

export default function AchievementCard({ achievement, gameTitle }: AchievementCardProps) {
  const { progress, toggleAchievement, setAchievementNote } = useTrackerStore();
  const [mounted, setMounted] = React.useState(false);
  const [isRevealed, setIsRevealed] = React.useState(!achievement.isHidden);
  const [showNoteEditor, setShowNoteEditor] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (progress.achievementNotes[achievement.id]) {
      setNoteText(progress.achievementNotes[achievement.id]);
    }
  }, [achievement.id, progress.achievementNotes]);

  if (!mounted) {
    return (
      <div className="w-full h-32 bg-zinc-900/40 border border-zinc-800 rounded-3xl animate-pulse" />
    );
  }

  const unlockedAt = progress.unlockedAchievements[achievement.id];
  const isUnlocked = !!unlockedAt;
  const currentNote = progress.achievementNotes[achievement.id] || '';

  // Calculate Rarity category and coloring
  const rarity = achievement.rarityPercentage;
  let rarityLabel = 'Common';
  let rarityColor = 'text-zinc-400 bg-zinc-800/80 border-zinc-700/50';
  let rarityGlow = '';

  if (rarity < 10) {
    rarityLabel = 'Ultra Rare';
    rarityColor = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
    rarityGlow = 'glow-platinum';
  } else if (rarity < 20) {
    rarityLabel = 'Rare';
    rarityColor = 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60';
    rarityGlow = 'glow-gold';
  } else if (rarity < 50) {
    rarityLabel = 'Uncommon';
    rarityColor = 'text-slate-300 bg-slate-800/50 border-slate-700/50';
    rarityGlow = 'glow-silver';
  }

  // Border and shadow classes based on trophy tier
  const tierBorders = {
    bronze: 'border-amber-800/60 hover:border-amber-700/80 shadow-amber-900/5',
    silver: 'border-slate-700/80 hover:border-slate-600/80 shadow-slate-700/5',
    gold: 'border-yellow-700/60 hover:border-yellow-600/80 shadow-yellow-500/5',
    platinum: 'border-cyan-700/60 hover:border-cyan-600/80 shadow-cyan-500/5',
  };

  const handleToggle = () => {
    toggleAchievement(
      achievement.id, 
      achievement.gameId, 
      gameTitle, 
      achievement.title, 
      achievement.iconUrl
    );
  };

  const handleNoteSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAchievementNote(achievement.id, noteText);
    setShowNoteEditor(false);
  };

  const handleDeleteNote = () => {
    setAchievementNote(achievement.id, '');
    setNoteText('');
    setShowNoteEditor(false);
  };

  return (
    <div 
      className={`glass-panel rounded-3xl border p-5 transition-all duration-300 flex flex-col gap-4 relative group ${
        isUnlocked 
          ? 'bg-blue-600/5 border-blue-500/40 shadow-blue-500/5 glow-blue' 
          : tierBorders[achievement.tier]
      }`}
    >
      {/* Dynamic Unlock Overlay Flash */}
      {isUnlocked && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Main Row */}
      <div className="flex gap-4 items-start relative z-10">
        
        {/* Achievement Icon Badge */}
        <div 
          onClick={handleToggle}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl cursor-pointer select-none shrink-0 transition-transform hover:scale-105 active:scale-95 border ${
            isUnlocked 
              ? 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white border-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'
          }`}
          title="Click to toggle unlock status"
        >
          {(() => {
            const icon = achievement.iconUrl?.trim() || '';
            const isUrl = icon.startsWith('http') || icon.startsWith('//') || icon.includes('/') || icon.includes('.');
            if (isUrl) {
              return (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={icon.startsWith('//') ? `https:${icon}` : icon} 
                    alt="" 
                    className={`w-10 h-10 object-contain rounded-xl transition-all duration-300 ${
                      isUnlocked ? '' : 'opacity-25 grayscale brightness-50'
                    }`} 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <span className="fallback-icon hidden text-xl leading-none">{isUnlocked ? '🏆' : '🔒'}</span>
                </>
              );
            }
            return <span className="text-xl leading-none">{isUnlocked ? (icon || '🏆') : '🔒'}</span>;
          })()}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Title */}
            <h4 
              className={`font-bold text-sm truncate cursor-pointer hover:text-blue-400 transition-colors ${
                isUnlocked ? 'text-blue-300 font-extrabold' : 'text-zinc-100'
              } ${!isRevealed ? 'blur-sm select-none' : ''}`}
              onClick={handleToggle}
            >
              {achievement.title}
            </h4>

            {/* Hidden Achievement Indicator */}
            {achievement.isHidden && (
              <button 
                onClick={() => setIsRevealed(!isRevealed)}
                className="text-[10px] bg-zinc-800 border border-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded font-bold hover:text-white transition-all flex items-center gap-1 select-none"
              >
                {isRevealed ? <EyeOff className="w-3 h-3 text-zinc-400" /> : <Eye className="w-3 h-3 text-blue-400 animate-pulse" />}
                {isRevealed ? 'Hide Spoilers' : 'Reveal Hidden'}
              </button>
            )}
          </div>

          {/* Description */}
          <p className={`text-xs text-zinc-400 leading-relaxed transition-all ${
            !isRevealed ? 'blur-md select-none pointer-events-none' : ''
          }`}>
            {achievement.description}
          </p>

          {/* Tags Drawer */}
          <div className="flex flex-wrap items-center gap-2 mt-3 select-none">
            {/* Rarity */}
            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${rarityColor} ${rarityGlow}`}>
              {rarityLabel} ({rarity}%)
            </span>
            
            {/* Trophy Type */}
            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full capitalize ${
              achievement.tier === 'gold' 
                ? 'text-yellow-400 bg-yellow-950/20 border-yellow-800/40' 
                : achievement.tier === 'silver' 
                ? 'text-slate-300 bg-slate-800/40 border-slate-700/40' 
                : achievement.tier === 'platinum' 
                ? 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40' 
                : 'text-amber-500 bg-amber-950/20 border-amber-900/40'
            }`}>
              {achievement.tier}
            </span>

            {/* Custom tags */}
            {achievement.isMissable && (
              <span className="text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                ⚠️ Missable
              </span>
            )}
            {achievement.isCollectible && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                📦 Collectible
              </span>
            )}
          </div>
        </div>

        {/* Completion Toggle checkbox */}
        <div className="flex flex-col items-center justify-center shrink-0 h-14">
          <button 
            onClick={handleToggle}
            className={`w-7 h-7 rounded-xl border flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all ${
              isUnlocked 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-zinc-900 border-zinc-800 text-transparent hover:border-zinc-700'
            }`}
          >
            <Check className={`w-4 h-4 transition-all duration-300 ${isUnlocked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
          </button>
        </div>
      </div>

      {/* Unlock timestamp */}
      {isUnlocked && (
        <div className="text-[10px] text-blue-400/80 font-semibold flex items-center gap-1 mt-1 border-t border-blue-500/10 pt-2.5 select-none relative z-10">
          <Calendar className="w-3.5 h-3.5" />
          Unlocked on {new Date(unlockedAt).toLocaleDateString()} at {new Date(unlockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {/* Trophy Guide Section */}
      {achievement.guide && isRevealed && (
        <div className="border-t border-zinc-800/40 pt-3 relative z-10">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between w-full text-xs font-semibold text-zinc-400 hover:text-blue-400 transition-colors cursor-pointer group/guide"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-500 group-hover/guide:scale-110 transition-transform" />
              <span>Trophy Guide & Walkthrough</span>
            </div>
            <div className="text-[10px] text-zinc-500 flex items-center gap-1 select-none">
              <span>{showGuide ? 'Hide Guide' : 'Show Guide'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          <AnimatePresence initial={false}>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 bg-zinc-950/60 border border-zinc-850/60 rounded-2xl p-3.5 text-xs text-zinc-300 leading-relaxed shadow-inner border-blue-500/10">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base leading-none mt-0.5 select-none text-blue-400">💡</span>
                    <p>{achievement.guide}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Note Widget Drawer */}
      <div className="border-t border-zinc-800/40 pt-3 relative z-10">
        {!showNoteEditor ? (
          <div className="flex items-center justify-between text-xs">
            {currentNote ? (
              <div className="flex-1 min-w-0 pr-4 flex items-start gap-2 text-zinc-300">
                <FileText className="w-3.5 h-3.5 mt-0.5 text-zinc-500 shrink-0" />
                <p className="italic line-clamp-2 leading-relaxed">{currentNote}</p>
              </div>
            ) : (
              <span className="text-zinc-500 italic select-none">No personal tracking notes yet.</span>
            )}
            <button 
              onClick={() => setShowNoteEditor(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer shrink-0 transition-colors ml-auto hover:underline"
            >
              {currentNote ? 'Edit Note' : '+ Add Notes'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleNoteSave} className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record custom checklists, walkthrough locations, or progress counts..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none h-16 transition-all"
              maxLength={200}
            />
            <div className="flex justify-end gap-2">
              {currentNote && (
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="px-2.5 py-1.5 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowNoteEditor(false);
                  setNoteText(currentNote);
                }}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
