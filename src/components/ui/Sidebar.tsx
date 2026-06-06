/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTrackerStore } from '@/store/trackerStore';
import { 
  Trophy, 
  Gamepad2, 
  LayoutDashboard, 
  Flame, 
  ChevronLeft,
  Users,
  User,
  BookOpen,
  MessageSquare,
  Award,
  Swords,
  Clock,
  Bell,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { progress, profile, currentUsername, hasReadUpdates, logout } = useTrackerStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Compute overall trophies unlocked for sidebar summary
  const totalUnlocked = mounted ? Object.keys(progress.unlockedAchievements).length : 0;
  const streak = mounted ? progress.streakCount : 0;

  const initials = mounted && profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'MH';

  const unreadUpdates = mounted && !hasReadUpdates[currentUsername || 'guest'];

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Library', href: '/games', icon: Gamepad2 },
    { name: 'Backlog', href: '/backlog', icon: Clock },
    { name: 'Guides', href: '/guides', icon: BookOpen },
    { name: 'Challenges', href: '/challenges', icon: Swords },
    { name: 'Leaderboard', href: '/leaderboard', icon: Award },
    { name: 'DMs', href: '/dms', icon: MessageSquare },
    { name: 'Social Hub', href: '/social', icon: Users },
    { name: 'Updates', href: '/updates', icon: Bell },
    { name: 'Profile', href: '/account', icon: User },
  ];

  const mobileNavItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Library', href: '/games', icon: Gamepad2 },
    { name: 'Backlog', href: '/backlog', icon: Clock },
    { name: 'DMs', href: '/dms', icon: MessageSquare },
    { name: 'Profile', href: '/account', icon: User },
  ];

  if (!mounted) {
    return (
      <div className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800 min-h-screen p-4">
        <div className="h-10 w-32 bg-zinc-900 rounded animate-pulse mb-8" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile Top Header / Bottom Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 z-50 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <span className="font-extrabold text-base tracking-wider uppercase text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            EndGame
          </span>
        </Link>
        <div className="flex items-center gap-3 bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-800">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-300">{streak} Day Streak</span>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 z-50 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isUpdates = item.name === 'Updates';
          const showDot = isUpdates && unreadUpdates;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${
                isActive ? 'text-purple-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-1" />
                {showDot && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[9px] font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Persistent Sticky Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-zinc-950/80 backdrop-blur-md border-r border-zinc-900 h-screen sticky top-0 transition-all duration-300 ease-in-out z-40 overflow-hidden ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-full p-1 transition-all hover:scale-115 focus:outline-none z-50"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-zinc-900/80">
          <Trophy className="w-8 h-8 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] shrink-0 animate-pulse" />
          {!isCollapsed && (
            <span className="font-extrabold text-xl tracking-wider uppercase text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-200 to-pink-500">
              ENDGAME
            </span>
          )}
        </div>

        {/* Navigation Items (Scrollable in middle) */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isUpdates = item.name === 'Updates';
            const showDot = isUpdates && unreadUpdates;
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                  {showDot && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-zinc-950 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-semibold tracking-wide transition-opacity duration-300 flex-1 flex items-center justify-between">
                    <span>{item.name}</span>
                    {showDot && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                        New
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Stats Mini Widget (Stuck to bottom of viewport) */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950">
          {!isCollapsed ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Link href="/account" className="shrink-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/10 cursor-pointer hover:scale-105 transition-transform shrink-0 relative">
                    {profile.avatarUrl && profile.avatarUrl.startsWith('linear-gradient') ? (
                      <div 
                        className="w-full h-full flex items-center justify-center font-bold text-white text-xs"
                        style={{ background: profile.avatarUrl }}
                      >
                        {initials}
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={profile.avatarUrl || 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'} 
                        alt={profile.name} 
                        className="w-full h-full object-cover" 
                      />
                    )}

                    {/* Discord style avatar border glow if equipped */}
                    {profile.avatarFrame && profile.avatarFrame !== 'none' && (
                      <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none animate-pulse ${
                        profile.avatarFrame === 'neon-blue' ? 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' :
                        profile.avatarFrame === 'ember-glow' ? 'border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                        profile.avatarFrame === 'cyber-pulsar' ? 'border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' :
                        profile.avatarFrame === 'gold-particle' ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : ''
                      }`} />
                    )}
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-400 truncate">Hunter Profile</p>
                  <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                </div>
                <button 
                  onClick={logout} 
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors shrink-0" 
                  title="Log Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-center border-t border-zinc-800/80 pt-3">
                <div>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase">Unlocked</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Trophy className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-200">{totalUnlocked}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase">Streak</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span className="text-xs font-bold text-zinc-200">{streak}d</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Link href="/account">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/10 cursor-pointer hover:scale-105 transition-transform shrink-0 relative" title="View Account">
                  {profile.avatarUrl && profile.avatarUrl.startsWith('linear-gradient') ? (
                    <div 
                      className="w-full h-full flex items-center justify-center font-bold text-white text-xs"
                      style={{ background: profile.avatarUrl }}
                    >
                      {initials}
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={profile.avatarUrl || 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'} 
                      alt={profile.name} 
                      className="w-full h-full object-cover" 
                    />
                  )}

                  {/* Discord style avatar border glow if equipped */}
                  {profile.avatarFrame && profile.avatarFrame !== 'none' && (
                    <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none ${
                      profile.avatarFrame === 'neon-blue' ? 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' :
                      profile.avatarFrame === 'ember-glow' ? 'border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                      profile.avatarFrame === 'cyber-pulsar' ? 'border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' :
                      profile.avatarFrame === 'gold-particle' ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : ''
                    }`} />
                  )}
                </div>
              </Link>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span className="text-[10px] font-bold text-zinc-300">{streak}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-zinc-900 transition-colors mt-2" 
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
