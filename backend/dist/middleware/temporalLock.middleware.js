import { getSupabase } from '../services/supabase.service.js';
import { isBackendSupabaseConfigured } from '../config/env.js';
/**
 * Middleware that strictly prevents premature unsealing or tampering with locked capsules
 */
export const enforceTemporalGate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const serverNow = Date.now();
        if (!id) {
            res.status(400).json({ error: 'Capsule ID is required.' });
            return;
        }
        let capsuleOpeningDate = null;
        let capsuleStatus = 'locked';
        if (isBackendSupabaseConfigured()) {
            const supabase = getSupabase();
            const { data: capsule, error } = await supabase
                .from('capsules')
                .select('id, user_id, opening_date, status')
                .eq('id', id)
                .single();
            if (error || !capsule) {
                res.status(404).json({ error: 'Capsule not found in database.' });
                return;
            }
            if (capsule.user_id !== userId) {
                res.status(403).json({ error: 'Security Violation: Capsule ownership mismatch.' });
                return;
            }
            capsuleOpeningDate = capsule.opening_date;
            capsuleStatus = capsule.status;
        }
        if (capsuleOpeningDate) {
            const targetTime = new Date(capsuleOpeningDate).getTime();
            // If route is /open, verify server timestamp has crossed target
            if (req.path.endsWith('/open')) {
                if (serverNow < targetTime) {
                    const remainingMs = targetTime - serverNow;
                    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
                    const remainingHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
                    res.status(403).json({
                        error: 'Server Temporal Lock Active: This capsule is locked until its scheduled opening date.',
                        current_server_time: new Date(serverNow).toISOString(),
                        scheduled_opening_date: capsuleOpeningDate,
                        remaining_time: `${remainingDays} days, ${remainingHours} hours remaining`,
                        remaining_ms: remainingMs,
                    });
                    return;
                }
            }
            // If user tries to edit opening_date on a locked capsule
            if (req.method === 'PUT' && req.body.opening_date) {
                res.status(400).json({
                    error: 'Security Violation: Opening date cannot be altered on a locked capsule.',
                });
                return;
            }
        }
        next();
    }
    catch (err) {
        res.status(500).json({ error: 'Temporal verification error: ' + err.message });
    }
};
