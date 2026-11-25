import React from 'react';
import {
  Hourglass,
  LayoutDashboard,
  Archive,
  PlusCircle,
  Bell,
  User,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavigationTab = 'dashboard' | 'my-capsules' | 'create-capsule' | 'notifications' | 'profile';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  user: UserProfile | null;
  onLogout: () => void;
  unreadNotificationsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  unreadNotificationsCount = 2,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'my-capsules',
      label: 'My Capsules',
      icon: <Archive className="w-5 h-5" />,
    },
    {
      id: 'create-capsule',
      label: 'Create Capsule',
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotificationsCount,
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0B0F19] border-r border-white/5 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo & Brand */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <Hourglass className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                  ChronoVault
                </span>
                <span className="text-[9px] tracking-widest uppercase font-mono text-purple-400 font-semibold -mt-0.5">
                  Temporal Engine
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white md:hidden hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Create CTA inside Sidebar */}
          <div className="p-4">
            <button
              onClick={() => {
                onSelectTab('create-capsule');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Capsule</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-inner'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-purple-400' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: User Card & Logout */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* User Profile Summary */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Active User'}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {user?.email || 'user@vault.com'}
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
