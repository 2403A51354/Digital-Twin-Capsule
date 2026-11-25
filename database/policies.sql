-- ==============================================================================
-- CHRONOVAULT: ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user can strictly access only their own data
-- ==============================================================================

-- 1. Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. POLICIES FOR 'profiles'
-- ==============================================================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Allow the system trigger to insert user profile
CREATE POLICY "Service role or user can insert profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 3. POLICIES FOR 'capsules'
-- ==============================================================================

-- Users can only view their own capsules
CREATE POLICY "Users can view own capsules"
    ON public.capsules
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert capsules under their own account
CREATE POLICY "Users can insert own capsules"
    ON public.capsules
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own capsules
CREATE POLICY "Users can update own capsules"
    ON public.capsules
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own capsules
CREATE POLICY "Users can delete own capsules"
    ON public.capsules
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. POLICIES FOR 'capsule_files'
-- ==============================================================================

-- Users can only view files belonging to capsules they own
CREATE POLICY "Users can view files of own capsules"
    ON public.capsule_files
    FOR SELECT
    USING (
        capsule_id IN (
            SELECT id FROM public.capsules WHERE user_id = auth.uid()
        )
    );

-- Users can insert files only to capsules they own
CREATE POLICY "Users can insert files into own capsules"
    ON public.capsule_files
    FOR INSERT
    WITH CHECK (
        capsule_id IN (
            SELECT id FROM public.capsules WHERE user_id = auth.uid()
        )
    );

-- Users can delete files only from capsules they own
CREATE POLICY "Users can delete files from own capsules"
    ON public.capsule_files
    FOR DELETE
    USING (
        capsule_id IN (
            SELECT id FROM public.capsules WHERE user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 5. POLICIES FOR 'notifications'
-- ==============================================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update (e.g. mark read) their own notifications
CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);
