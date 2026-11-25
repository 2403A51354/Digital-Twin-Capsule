import { useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { notificationsApi, checkBackendHealth } from '../services/api';

const LOCAL_STORAGE_KEY = 'chronovault_notifs';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const isOnline = await checkBackendHealth();
      if (isOnline) {
        const remote = await notificationsApi.getAll();
        setNotifications(remote);
      }
    } catch (e) {
      console.warn('Using local notifications cache');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const isOnline = await checkBackendHealth();
      if (isOnline) {
        await notificationsApi.markAsRead(id);
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const isOnline = await checkBackendHealth();
      if (isOnline) {
        await notificationsApi.markAllRead();
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const isOnline = await checkBackendHealth();
      if (isOnline) {
        await notificationsApi.delete(id);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const clearNotifications = async () => {
    try {
      const isOnline = await checkBackendHealth();
      if (isOnline) {
        await notificationsApi.clearAll();
      }
      setNotifications([]);
    } catch (e) {
      setNotifications([]);
    }
  };

  const addNotification = (message: string, capsuleId?: string) => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      user_id: userId || 'usr_demo',
      capsule_id: capsuleId || '',
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    addNotification,
  };
};
