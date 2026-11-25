import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabase } from '../services/supabase.service.js';
import { isBackendSupabaseConfigured } from '../config/env.js';
import { notificationsService } from '../services/notifications.service.js';

let memoryNotifications = [
  {
    id: 'notif_1',
    user_id: 'usr_demo',
    capsule_id: 'cap_demo_2',
    message: '🎉 Your capsule "Graduation Day Memories" has reached its opening date and is ready to unlock!',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'notif_2',
    user_id: 'usr_demo',
    capsule_id: 'cap_demo_1',
    message: '🔒 Capsule "Letter to Future Self in 2028" is sealed in tamper-proof cryptographic storage.',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export const notificationsController = {
  /**
   * GET /api/notifications
   * Runs milestone check, then returns all notifications
   */
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check upcoming milestones
      await notificationsService.checkAndGenerateMilestoneAlerts(userId);

      if (!isBackendSupabaseConfigured()) {
        res.status(200).json({ notifications: memoryNotifications });
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      res.status(200).json({ notifications: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch notifications.' });
    }
  },

  /**
   * PUT /api/notifications/:id/read
   * Mark individual notification as read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!isBackendSupabaseConfigured()) {
        memoryNotifications = memoryNotifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        res.status(200).json({ message: 'Notification marked as read.' });
        return;
      }

      const supabase = getSupabase();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      res.status(200).json({ message: 'Notification marked as read.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update notification.' });
    }
  },

  /**
   * PUT /api/notifications/read-all
   */
  async markAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!isBackendSupabaseConfigured()) {
        memoryNotifications = memoryNotifications.map((n) => ({ ...n, is_read: true }));
        res.status(200).json({ message: 'All notifications marked as read.' });
        return;
      }

      const supabase = getSupabase();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update notifications.' });
    }
  },

  /**
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!isBackendSupabaseConfigured()) {
        memoryNotifications = memoryNotifications.filter((n) => n.id !== id);
        res.status(200).json({ message: 'Notification deleted.' });
        return;
      }

      const supabase = getSupabase();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      res.status(200).json({ message: 'Notification deleted.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete notification.' });
    }
  },

  /**
   * DELETE /api/notifications
   */
  async clearNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!isBackendSupabaseConfigured()) {
        memoryNotifications = [];
        res.status(200).json({ message: 'Notifications cleared.' });
        return;
      }

      const supabase = getSupabase();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      res.status(200).json({ message: 'Notifications cleared.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to clear notifications.' });
    }
  },
};
