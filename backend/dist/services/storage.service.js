import { getSupabase } from './supabase.service.js';
import { isBackendSupabaseConfigured } from '../config/env.js';
export const storageService = {
    /**
     * Upload file buffer to private Supabase Storage bucket 'capsule-files'
     */
    async uploadFile(capsuleId, file) {
        const supabase = getSupabase();
        const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `capsules/${capsuleId}/${Date.now()}_${sanitizedFileName}`;
        if (!isBackendSupabaseConfigured() || !supabase) {
            // Return simulated storage path in offline/demo mode
            return storagePath;
        }
        const { data, error } = await supabase.storage
            .from('capsule-files')
            .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            console.error('Storage upload error:', error);
            throw new Error(`Failed to upload file to storage: ${error.message}`);
        }
        return storagePath;
    },
    /**
     * Generate secure, time-limited signed download URL
     * Default expiration: 60 seconds (1 minute)
     */
    async createSignedUrl(storagePath, expiresIn = 60) {
        const supabase = getSupabase();
        if (!isBackendSupabaseConfigured() || !supabase) {
            // In demo mode, return simulated download path
            return `/api/storage/preview/${encodeURIComponent(storagePath)}`;
        }
        const { data, error } = await supabase.storage
            .from('capsule-files')
            .createSignedUrl(storagePath, expiresIn);
        if (error) {
            console.error('Error creating signed URL:', error);
            throw new Error(`Could not generate signed URL: ${error.message}`);
        }
        return data.signedUrl;
    },
    /**
     * Delete files belonging to a capsule
     */
    async deleteFiles(storagePaths) {
        const supabase = getSupabase();
        if (!isBackendSupabaseConfigured() || !supabase || storagePaths.length === 0)
            return;
        await supabase.storage.from('capsule-files').remove(storagePaths);
    },
};
