import { getSupabase } from './supabase.service.js';
import { isBackendSupabaseConfigured } from '../config/env.js';
export const notificationsService = {
    /**
     * Automatically inspects user's capsules and generates milestone notifications
     * (e.g. Opening today, opening within 7 days)
     */
    async checkAndGenerateMilestoneAlerts(userId) {
        if (!isBackendSupabaseConfigured())
            return;
        const supabase = getSupabase();
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        try {
            // Fetch locked capsules for user
            const { data: capsules, error } = await supabase
                .from('capsules')
                .select('id, title, opening_date')
                .eq('user_id', userId)
                .eq('status', 'locked');
            if (error || !capsules)
                return;
            // Fetch existing notification messages for this user
            const { data: existingNotifs } = await supabase
                .from('notifications')
                .select('capsule_id, message')
                .eq('user_id', userId);
            const existingSet = new Set((existingNotifs || []).map((n) => `${n.capsule_id}:${n.message}`));
            for (const cap of capsules) {
                const target = new Date(cap.opening_date).getTime();
                const diff = target - now;
                // Condition 1: Target date has arrived (diff <= 0)
                if (diff <= 0) {
                    const alertMsg = `🎉 Your time capsule "${cap.title}" has reached its opening date! It is now eligible to be unsealed.`;
                    const key = `${cap.id}:${alertMsg}`;
                    if (!existingSet.has(key)) {
                        await supabase.from('notifications').insert({
                            user_id: userId,
                            capsule_id: cap.id,
                            message: alertMsg,
                            is_read: false,
                        });
                        existingSet.add(key);
                    }
                }
                // Condition 2: Opening soon (within 7 days and future)
                else if (diff <= sevenDaysMs) {
                    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    const alertMsg = `⏳ Reminder: Capsule "${cap.title}" opens in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}!`;
                    const key = `${cap.id}:${alertMsg}`;
                    if (!existingSet.has(key)) {
                        await supabase.from('notifications').insert({
                            user_id: userId,
                            capsule_id: cap.id,
                            message: alertMsg,
                            is_read: false,
                        });
                        existingSet.add(key);
                    }
                }
            }
        }
        catch (err) {
            console.error('Error generating milestone notifications:', err);
        }
    },
};
