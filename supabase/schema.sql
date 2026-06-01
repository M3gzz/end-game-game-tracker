-- ==============================================================================
-- STEAM ACHIEVEMENT HUNTER - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- Paste this script directly into your Supabase SQL Editor to provision the
-- necessary database tables, constraints, security policies, and indices.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles / Users Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    steam_id TEXT UNIQUE,
    streak_count INTEGER DEFAULT 0 NOT NULL,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Games Table
CREATE TABLE IF NOT EXISTS public.games (
    id TEXT PRIMARY KEY, -- Slug-style unique identifier (e.g. 'elden-ring')
    title TEXT NOT NULL,
    developer TEXT,
    estimated_difficulty INTEGER CHECK (estimated_difficulty BETWEEN 1 AND 10),
    estimated_hours INTEGER,
    cover_url TEXT,
    banner_url TEXT,
    description TEXT,
    release_year INTEGER,
    platforms TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DLCs Table
CREATE TABLE IF NOT EXISTS public.dlcs (
    id TEXT PRIMARY KEY, -- Slug-style unique identifier (e.g. 'er-shadow-erdtree')
    game_id TEXT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    achievements_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY, -- Slug-style unique identifier (e.g. 'er-margit')
    game_id TEXT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    dlc_id TEXT REFERENCES public.dlcs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    rarity_percentage NUMERIC(5, 2) DEFAULT 100.00 CHECK (rarity_percentage BETWEEN 0.00 AND 100.00),
    tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')) NOT NULL,
    is_missable BOOLEAN DEFAULT FALSE NOT NULL,
    is_collectible BOOLEAN DEFAULT FALSE NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. User Library / Owned Games (Maps which user owns which game)
CREATE TABLE IF NOT EXISTS public.user_games (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT CHECK (status IN ('active_hunting', 'backlog', 'wishlist', 'completed', 'none')) DEFAULT 'none' NOT NULL,
    playtime_hours NUMERIC(7, 2) DEFAULT 0.00 NOT NULL,
    target_completion_date DATE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, game_id)
);

-- 7. User Progress (Maps unlocked achievements)
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, achievement_id)
);

-- 8. Achievement Notes Table
CREATE TABLE IF NOT EXISTS public.achievement_notes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, achievement_id)
);

-- 9. Activity Feed Table
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('unlock', 'lock', 'note', 'add', 'remove', 'favorite', 'pin', 'goal')),
    description TEXT NOT NULL,
    achievement_title TEXT,
    achievement_icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_achievements_game ON public.achievements(game_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_user ON public.user_games(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dlcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Games, DLCs, and Achievements are public read-only
CREATE POLICY "Allow public read access to Games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Allow public read access to DLCs" ON public.dlcs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to Achievements" ON public.achievements FOR SELECT USING (true);

-- Users can read all profiles, but only update their own
CREATE POLICY "Allow public read access to Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own library, progress, notes, and activity feed
CREATE POLICY "Allow users to manage own User Games" ON public.user_games
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to manage own User Progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to manage own Notes" ON public.achievement_notes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to manage own Activity Feed" ON public.activity_feed
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- PROFILE UPDATE TRIGGER ON SIGN UP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
