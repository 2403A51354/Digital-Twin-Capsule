-- ==============================================================================
-- CHRONOVAULT: ALL-IN-ONE SUPABASE SETUP SCRIPT
-- Copy and paste this entire script into your Supabase SQL Editor and click RUN.
-- ==============================================================================

-- 1. Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Capsules Table
CREATE TABLE IF NOT EXISTS public.capsules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    message TEXT,
    category TEXT NOT NULL CHECK (category IN ('Personal', 'Friends', 'Family', 'Education', 'Travel', 'Career', 'Love')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    opening_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'opened')),
    opened_at TIMESTAMP WITH TIME ZONE
);

-- Capsule Files Table (Metadata for media & documents)
CREATE TABLE IF NOT EXISTS public.capsule_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. CREATE PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_capsules_user_id ON public.capsules(user_id);
CREATE INDEX IF NOT EXISTS idx_capsules_opening_date ON public.capsules(opening_date);
CREATE INDEX IF NOT EXISTS idx_capsules_status ON public.capsules(status);
CREATE INDEX IF NOT EXISTS idx_capsules_user_status ON public.capsules(user_id, status);
CREATE INDEX IF NOT EXISTS idx_capsule_files_capsule_id ON public.capsule_files(capsule_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- ==============================================================================
-- 4. AUTOMATIC USER PROFILE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if rerun
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role or user can insert profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own capsules" ON public.capsules;
DROP POLICY IF EXISTS "Users can insert own capsules" ON public.capsules;
DROP POLICY IF EXISTS "Users can update own capsules" ON public.capsules;
DROP POLICY IF EXISTS "Users can delete own capsules" ON public.capsules;

DROP POLICY IF EXISTS "Users can view files of own capsules" ON public.capsule_files;
DROP POLICY IF EXISTS "Users can insert files into own capsules" ON public.capsule_files;
DROP POLICY IF EXISTS "Users can delete files from own capsules" ON public.capsule_files;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role or user can insert profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Capsules Policies
CREATE POLICY "Users can view own capsules" ON public.capsules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own capsules" ON public.capsules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own capsules" ON public.capsules FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own capsules" ON public.capsules FOR DELETE USING (auth.uid() = user_id);

-- Capsule Files Policies
CREATE POLICY "Users can view files of own capsules" ON public.capsule_files FOR SELECT USING (
    capsule_id IN (SELECT id FROM public.capsules WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert files into own capsules" ON public.capsule_files FOR INSERT WITH CHECK (
    capsule_id IN (SELECT id FROM public.capsules WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete files from own capsules" ON public.capsule_files FOR DELETE USING (
    capsule_id IN (SELECT id FROM public.capsules WHERE user_id = auth.uid())
);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. PRIVATE STORAGE BUCKET CONFIGURATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('capsule-files', 'capsule-files', false, 52428800)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 52428800;
