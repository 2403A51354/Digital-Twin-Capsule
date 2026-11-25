import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Hourglass, ArrowRight, X } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
  onSelectCapsule?: (capsuleId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  onSelectCapsule,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const previewNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0D121F] border border-white/10 rounded-3xl shadow-2xl shadow-purple-950/60 z-50 p-4 space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto space-y-2">
            {previewNotifications.length > 0 ? (
              previewNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                    notif.is_read
                      ? 'bg-white/5 border-white/5 text-gray-400'
                      : 'bg-[#141B2D] border-purple-500/30 text-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 ${
                        notif.is_read
                          ? 'bg-white/5 text-gray-400'
                          : 'bg-purple-600/20 text-purple-400'
                      }`}
                    >
                      <Hourglass className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="line-clamp-2 leading-relaxed">{notif.message}</p>
                      <span className="text-[9px] text-gray-500 block mt-1">
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      title="Mark as read"
                      className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-6 italic">
                No notifications right now.
              </p>
            )}
          </div>

          {/* Footer View All Link */}
          <div className="pt-2 border-t border-white/5 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onViewAll();
              }}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-1 w-full py-1"
            >
              <span>View All Notifications ({notifications.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
