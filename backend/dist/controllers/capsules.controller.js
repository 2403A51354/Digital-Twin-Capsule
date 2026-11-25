import { getSupabase } from '../services/supabase.service.js';
import { storageService } from '../services/storage.service.js';
import { isBackendSupabaseConfigured } from '../config/env.js';
const memoryCapsules = [
    {
        id: 'cap_demo_1',
        user_id: 'usr_demo',
        title: 'Letter to Future Self in 2028',
        description: 'Aspirations and dreams recorded before starting the project.',
        message: 'Remember why you started this journey. Never stop exploring.',
        category: 'Personal',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        opening_date: new Date(Date.now() + 600 * 86400000).toISOString(),
        timezone: 'UTC',
        status: 'locked',
        files: [],
    },
    {
        id: 'cap_demo_2',
        user_id: 'usr_demo',
        title: 'Graduation Day Memories',
        description: 'Memories from university graduation ceremony.',
        message: 'Congratulations to the entire graduation class!',
        category: 'Education',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        opening_date: new Date(Date.now() - 60000).toISOString(), // Target has arrived!
        timezone: 'UTC',
        status: 'locked',
        files: [],
    },
];
export const capsulesController = {
    /**
     * POST /api/capsules
     * Create a new time capsule with server-side future date validation
     */
    async createCapsule(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'User authentication required.' });
                return;
            }
            const { title, description, message, category, opening_date, timezone } = req.body;
            // 1. Validate required fields
            if (!title || !category || !opening_date) {
                res.status(400).json({ error: 'Title, category, and opening date are required.' });
                return;
            }
            // 2. Strict Server-Side Temporal Check
            const openingTimestamp = new Date(opening_date).getTime();
            const currentServerTimestamp = Date.now();
            if (isNaN(openingTimestamp)) {
                res.status(400).json({ error: 'Invalid opening date format.' });
                return;
            }
            if (openingTimestamp <= currentServerTimestamp) {
                res.status(400).json({
                    error: 'Strict Temporal Rule: The scheduled opening date must be in the future!',
                    current_server_time: new Date().toISOString(),
                    requested_opening_date: opening_date,
                });
                return;
            }
            const capsuleId = 'cap_' + Date.now();
            const filesToUpload = req.files || [];
            const uploadedFileRecords = [];
            // 3. Process file attachments
            for (const file of filesToUpload) {
                const storagePath = await storageService.uploadFile(capsuleId, file);
                uploadedFileRecords.push({
                    id: 'file_' + Math.random().toString(36).substring(2, 9),
                    capsule_id: capsuleId,
                    file_name: file.originalname,
                    file_type: file.mimetype,
                    file_size: file.size,
                    storage_path: storagePath,
                    uploaded_at: new Date().toISOString(),
                });
            }
            // 4. Persistence
            if (!isBackendSupabaseConfigured()) {
                const newMemoryCapsule = {
                    id: capsuleId,
                    user_id: userId,
                    title,
                    description: description || '',
                    message: message || '',
                    category,
                    created_at: new Date().toISOString(),
                    opening_date: new Date(opening_date).toISOString(),
                    timezone: timezone || 'UTC',
                    status: 'locked',
                    files: uploadedFileRecords,
                };
                memoryCapsules.unshift(newMemoryCapsule);
                res.status(201).json({
                    message: 'Time capsule created and temporally locked successfully.',
                    capsule: newMemoryCapsule,
                });
                return;
            }
            const supabase = getSupabase();
            // Insert capsule record into PostgreSQL
            const { data: capsule, error: capError } = await supabase
                .from('capsules')
                .insert({
                id: capsuleId,
                user_id: userId,
                title,
                description,
                message,
                category,
                opening_date,
                timezone: timezone || 'UTC',
                status: 'locked',
            })
                .select()
                .single();
            if (capError) {
                throw new Error(`Database error creating capsule: ${capError.message}`);
            }
            // Insert file metadata records
            if (uploadedFileRecords.length > 0) {
                const { error: filesError } = await supabase
                    .from('capsule_files')
                    .insert(uploadedFileRecords);
                if (filesError) {
                    console.error('Error recording files metadata:', filesError);
                }
            }
            // Create notification
            await supabase.from('notifications').insert({
                user_id: userId,
                capsule_id: capsuleId,
                message: `🔒 Capsule "${title}" created and sealed until ${new Date(opening_date).toLocaleDateString()}.`,
            });
            res.status(201).json({
                message: 'Time capsule created and temporally locked successfully.',
                capsule: {
                    ...capsule,
                    files: uploadedFileRecords,
                },
            });
        }
        catch (err) {
            console.error('Create capsule error:', err);
            res.status(500).json({ error: err.message || 'Failed to create capsule.' });
        }
    },
    /**
     * GET /api/capsules
     * Get all capsules belonging to the logged-in user
     * Redacts secret letters and signed URLs on locked capsules
     */
    async getUserCapsules(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required.' });
                return;
            }
            const now = Date.now();
            if (!isBackendSupabaseConfigured()) {
                const userCapsules = memoryCapsules.filter((c) => c.user_id === userId || c.user_id === 'usr_demo');
                // Apply temporal sanitation
                const sanitized = userCapsules.map((c) => {
                    const isLocked = c.status === 'locked' && new Date(c.opening_date).getTime() > now;
                    return {
                        ...c,
                        message: isLocked ? '[SEALED IN CRYPTOGRAPHIC VAULT]' : c.message,
                        files_count: c.files.length,
                        files: isLocked ? [] : c.files,
                    };
                });
                res.status(200).json({ capsules: sanitized });
                return;
            }
            const supabase = getSupabase();
            const { data: capsules, error } = await supabase
                .from('capsules')
                .select(`
          *,
          capsule_files (
            id, file_name, file_type, file_size, storage_path, uploaded_at
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                throw new Error(error.message);
            }
            // Sanitize locked capsules
            const sanitized = capsules.map((c) => {
                const isLocked = c.status === 'locked' && new Date(c.opening_date).getTime() > now;
                return {
                    ...c,
                    message: isLocked ? '[SEALED IN CRYPTOGRAPHIC VAULT]' : c.message,
                    files_count: c.capsule_files?.length || 0,
                    files: isLocked
                        ? (c.capsule_files || []).map((f) => ({
                            id: f.id,
                            file_name: f.file_name,
                            file_type: f.file_type,
                            file_size: f.file_size,
                        }))
                        : c.capsule_files,
                };
            });
            res.status(200).json({ capsules: sanitized });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to fetch capsules.' });
        }
    },
    /**
     * GET /api/capsules/:id
     * Get capsule details with strict server temporal enforcement
     */
    async getCapsuleById(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const now = Date.now();
            if (!isBackendSupabaseConfigured()) {
                const found = memoryCapsules.find((c) => c.id === id);
                if (!found) {
                    res.status(404).json({ error: 'Capsule not found.' });
                    return;
                }
                const isLocked = found.status === 'locked' && new Date(found.opening_date).getTime() > now;
                const isEligibleToOpen = found.status === 'locked' && new Date(found.opening_date).getTime() <= now;
                res.status(200).json({
                    capsule: {
                        ...found,
                        message: isLocked ? `[LOCKED UNTIL ${found.opening_date}]` : found.message,
                        is_locked: isLocked,
                        is_eligible_to_open: isEligibleToOpen,
                    },
                });
                return;
            }
            const supabase = getSupabase();
            const { data: capsule, error } = await supabase
                .from('capsules')
                .select(`
          *,
          capsule_files (*)
        `)
                .eq('id', id)
                .single();
            if (error || !capsule) {
                res.status(404).json({ error: 'Capsule not found.' });
                return;
            }
            // Verify ownership
            if (capsule.user_id !== userId) {
                res.status(403).json({ error: 'Access denied. You do not own this capsule.' });
                return;
            }
            const targetTime = new Date(capsule.opening_date).getTime();
            const isLocked = capsule.status === 'locked' && targetTime > now;
            const isEligibleToOpen = capsule.status === 'locked' && targetTime <= now;
            // Handle file URLs
            let filesPayload = capsule.capsule_files || [];
            if (!isLocked) {
                // Generate time-limited signed URLs for opened or eligible capsules
                filesPayload = await Promise.all(filesPayload.map(async (file) => {
                    try {
                        const signedUrl = await storageService.createSignedUrl(file.storage_path, 60);
                        return { ...file, url: signedUrl };
                    }
                    catch (e) {
                        return file;
                    }
                }));
            }
            else {
                // Redact file paths for locked capsules
                filesPayload = filesPayload.map((f) => ({
                    id: f.id,
                    file_name: f.file_name,
                    file_type: f.file_type,
                    file_size: f.file_size,
                }));
            }
            res.status(200).json({
                capsule: {
                    ...capsule,
                    message: isLocked ? `[LOCKED UNTIL ${capsule.opening_date}]` : capsule.message,
                    files: filesPayload,
                    is_locked: isLocked,
                    is_eligible_to_open: isEligibleToOpen,
                },
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to retrieve capsule.' });
        }
    },
    /**
     * POST /api/capsules/:id/open
     * Open an eligible capsule after server validates opening timestamp
     */
    async openCapsule(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const now = Date.now();
            if (!isBackendSupabaseConfigured()) {
                const found = memoryCapsules.find((c) => c.id === id);
                if (!found) {
                    res.status(404).json({ error: 'Capsule not found.' });
                    return;
                }
                const target = new Date(found.opening_date).getTime();
                if (now < target) {
                    res.status(403).json({
                        error: 'Temporal Violation: Capsule cannot be unsealed before its scheduled opening date!',
                        scheduled_opening: found.opening_date,
                        remaining_time_ms: target - now,
                    });
                    return;
                }
                found.status = 'opened';
                found.opened_at = new Date().toISOString();
                res.status(200).json({
                    message: 'Capsule unsealed successfully!',
                    capsule: found,
                });
                return;
            }
            const supabase = getSupabase();
            const { data: capsule, error } = await supabase
                .from('capsules')
                .select('*')
                .eq('id', id)
                .single();
            if (error || !capsule) {
                res.status(404).json({ error: 'Capsule not found.' });
                return;
            }
            if (capsule.user_id !== userId) {
                res.status(403).json({ error: 'You do not have permission to open this capsule.' });
                return;
            }
            // Strict temporal check
            const targetTime = new Date(capsule.opening_date).getTime();
            if (now < targetTime) {
                res.status(403).json({
                    error: 'Temporal Violation: Capsule cannot be unsealed before its scheduled opening date!',
                    scheduled_opening: capsule.opening_date,
                    remaining_time_ms: targetTime - now,
                });
                return;
            }
            // Update status to opened
            const { data: updated, error: updateError } = await supabase
                .from('capsules')
                .update({
                status: 'opened',
                opened_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select()
                .single();
            if (updateError) {
                throw new Error(updateError.message);
            }
            // Record notification
            await supabase.from('notifications').insert({
                user_id: userId,
                capsule_id: id,
                message: `🎉 You unlocked and unsealed "${capsule.title}"!`,
            });
            res.status(200).json({
                message: 'Capsule successfully unsealed!',
                capsule: updated,
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to open capsule.' });
        }
    },
    /**
     * PUT /api/capsules/:id
     * Update capsule metadata (Prevents modifying opening date to bypass locks)
     */
    async updateCapsule(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const { title, description, category } = req.body;
            if (!isBackendSupabaseConfigured()) {
                const found = memoryCapsules.find((c) => c.id === id);
                if (!found) {
                    res.status(404).json({ error: 'Capsule not found.' });
                    return;
                }
                if (title)
                    found.title = title;
                if (description)
                    found.description = description;
                if (category)
                    found.category = category;
                res.status(200).json({ message: 'Capsule updated successfully.', capsule: found });
                return;
            }
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('capsules')
                .update({
                title,
                description,
                category,
                // Intentionally do NOT allow altering opening_date once locked!
            })
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();
            if (error)
                throw new Error(error.message);
            res.status(200).json({
                message: 'Capsule updated successfully.',
                capsule: data,
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to update capsule.' });
        }
    },
    /**
     * DELETE /api/capsules/:id
     * Delete a capsule and associated storage files
     */
    async deleteCapsule(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!isBackendSupabaseConfigured()) {
                const index = memoryCapsules.findIndex((c) => c.id === id);
                if (index === -1) {
                    res.status(404).json({ error: 'Capsule not found.' });
                    return;
                }
                memoryCapsules.splice(index, 1);
                res.status(200).json({ message: 'Capsule deleted successfully.' });
                return;
            }
            const supabase = getSupabase();
            // Retrieve file paths to purge from storage
            const { data: files } = await supabase
                .from('capsule_files')
                .select('storage_path')
                .eq('capsule_id', id);
            if (files && files.length > 0) {
                const paths = files.map((f) => f.storage_path);
                await storageService.deleteFiles(paths);
            }
            // Delete from capsules table (Foreign key CASCADE removes capsule_files and notifications)
            const { error } = await supabase
                .from('capsules')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);
            if (error)
                throw new Error(error.message);
            res.status(200).json({ message: 'Capsule and artifacts deleted successfully.' });
        }
        catch (err) {
            res.status(500).json({ error: err.message || 'Failed to delete capsule.' });
        }
    },
};
