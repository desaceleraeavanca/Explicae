-- Users table (extended from Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analogies table
CREATE TABLE IF NOT EXISTS public.analogies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  audience TEXT NOT NULL,
  analogy_text TEXT NOT NULL,
  category TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audience profiles table
CREATE TABLE IF NOT EXISTS public.audience_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  context TEXT,
  age_range TEXT,
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL, -- 'count', 'streak', 'special'
  requirement_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges (achievements)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Daily sparks (analogia do dia)
CREATE TABLE IF NOT EXISTS public.daily_sparks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept TEXT NOT NULL,
  audience TEXT NOT NULL,
  analogy_text TEXT NOT NULL,
  spark_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats for gamification
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_analogies INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analogies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sparks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for analogies
CREATE POLICY "Users can view own analogies" ON public.analogies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analogies" ON public.analogies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analogies" ON public.analogies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analogies" ON public.analogies
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audience profiles
CREATE POLICY "Users can view own audience profiles" ON public.audience_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audience profiles" ON public.audience_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audience profiles" ON public.audience_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own audience profiles" ON public.audience_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for badges (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view badges" ON public.badges
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for user badges
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily sparks (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view daily sparks" ON public.daily_sparks
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for user stats
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analogies_user_id ON public.analogies(user_id);
CREATE INDEX IF NOT EXISTS idx_analogies_created_at ON public.analogies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analogies_category ON public.analogies(category);
CREATE INDEX IF NOT EXISTS idx_analogies_is_favorite ON public.analogies(is_favorite);
CREATE INDEX IF NOT EXISTS idx_audience_profiles_user_id ON public.audience_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_sparks_date ON public.daily_sparks(spark_date DESC);
