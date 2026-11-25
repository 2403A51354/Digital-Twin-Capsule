-- ==============================================================================
-- CHRONOVAULT: SUPABASE STORAGE CONFIGURATION & POLICIES
-- Creates private bucket 'capsule-files' and enforces strict private access
-- ==============================================================================

-- 1. Create the private bucket for capsule artifacts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'capsule-files',
    'capsule-files',
    false, -- STRICTLY PRIVATE: prevents unauthorized public URL access
    52428800, -- 50 MB limit per file
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800;

-- ==============================================================================
-- 2. STORAGE OBJECT POLICIES
-- Path structure: capsules/{capsule_id}/{file_name}
-- ==============================================================================

-- Allow authenticated users to upload files to capsules they own
CREATE POLICY "Users can upload files to own capsules"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'capsule-files' AND
    EXISTS (
        SELECT 1 FROM public.capsules
        WHERE id::text = (storage.foldername(name))[2]
        AND user_id = auth.uid()
    )
);

-- Allow authenticated users to view/download files from their own capsules
CREATE POLICY "Users can read files from own capsules"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'capsule-files' AND
    EXISTS (
        SELECT 1 FROM public.capsules
        WHERE id::text = (storage.foldername(name))[2]
        AND user_id = auth.uid()
    )
);

-- Allow users to delete files from their own capsules
CREATE POLICY "Users can delete files from own capsules"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'capsule-files' AND
    EXISTS (
        SELECT 1 FROM public.capsules
        WHERE id::text = (storage.foldername(name))[2]
        AND user_id = auth.uid()
    )
);
