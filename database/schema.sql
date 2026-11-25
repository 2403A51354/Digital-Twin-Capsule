-- ==============================================================================
-- CHRONOVAULT: DIGITAL TIME CAPSULE DATABASE SCHEMA
-- PostgreSQL (Supabase Compatible)
-- ==============================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- Linked directly to Supabase Auth (auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on profiles email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 2. CAPSULES TABLE
-- Stores time capsules with temporal lock constraints
-- ==============================================================================
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

-- Optimize query indexes for capsules
CREATE INDEX IF NOT EXISTS idx_capsules_user_id ON public.capsules(user_id);
CREATE INDEX IF NOT EXISTS idx_capsules_opening_date ON public.capsules(opening_date);
CREATE INDEX IF NOT EXISTS idx_capsules_status ON public.capsules(status);
CREATE INDEX IF NOT EXISTS idx_capsules_user_status ON public.capsules(user_id, status);

-- ==============================================================================
-- 3. CAPSULE_FILES TABLE
-- Stores metadata for photos, videos, audio, and documents attached to capsules
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.capsule_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on capsule_id for fast file retrieval
CREATE INDEX IF NOT EXISTS idx_capsule_files_capsule_id ON public.capsule_files(capsule_id);

-- ==============================================================================
-- 4. NOTIFICATIONS TABLE
-- Stores upcoming opening alerts and status updates for users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimize notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Whenever a user signs up via Supabase Auth, a profile is generated automatically.
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
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
