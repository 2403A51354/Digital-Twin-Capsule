import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Hourglass,
  Trash2,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearNotifications: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearNotifications,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Automated milestone warnings, scheduled opening alarms, and security alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllAsRead}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-300 border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
          <button
            onClick={onClearNotifications}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-[#0D121F] p-1 rounded-xl border border-white/10 w-fit text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'unread'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'read'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Read ({notifications.filter((n) => n.is_read).length})
        </button>
      </div>

      {/* Notifications list */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'bg-[#0D121F]/70 border-white/5 text-gray-400'
                  : 'bg-[#141B2D] border-purple-500/30 text-white shadow-lg shadow-purple-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl mt-0.5 ${
                    n.is_read
                      ? 'bg-white/5 text-gray-400'
                      : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  <Hourglass className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-500 block">
                    {new Date(n.created_at).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {!n.is_read && onMarkAsRead && (
                  <button
                    onClick={() => onMarkAsRead(n.id)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-white/5"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {onDeleteNotification && (
                  <button
                    onClick={() => onDeleteNotification(n.id)}
                    title="Delete notification"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 space-y-3">
          <Bell className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Notifications In This Filter</h3>
          <p className="text-xs text-gray-400">
            {filter === 'unread'
              ? 'You are all caught up! No unread notifications.'
              : 'Notifications will appear here as your capsules reach upcoming milestones.'}
          </p>
        </div>
      )}
    </div>
  );
};
