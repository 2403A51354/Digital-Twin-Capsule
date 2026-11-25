import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CapsulesListView } from './components/CapsulesListView';
import { CapsuleDetailsModal } from './components/CapsuleDetailsModal';
import { CreateCapsuleModal } from './components/CreateCapsuleModal';
import { NotificationsView } from './components/NotificationsView';
import { NotificationDropdown } from './components/NotificationDropdown';
import { ProfileView } from './components/ProfileView';
import { Capsule } from './types';
import { useCapsules } from './hooks/useCapsules';
import { useNotifications } from './hooks/useNotifications';
import { triggerCapsuleUnsealConfetti } from './utils/confetti';
import { Menu, Hourglass, Server, Wifi } from 'lucide-react';

function MainAppContent() {
  const { user, loading: authLoading, signOut, updateProfile } = useAuth();
  const {
    capsules,
    loading: capsulesLoading,
    backendOnline,
    createCapsule,
    openCapsule,
  } = useCapsules(user?.id);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    addNotification,
  } = useNotifications(user?.id);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleViewDetails = (capsule: Capsule) => {
    setSelectedCapsule(capsule);
    setDetailsModalOpen(true);
  };

  // Open capsule action
  const handleOpenCapsule = async (capsuleToOpen: Capsule) => {
    try {
      triggerCapsuleUnsealConfetti();
      const unsealed = await openCapsule(capsuleToOpen);

      if (selectedCapsule && selectedCapsule.id === capsuleToOpen.id) {
        setSelectedCapsule(unsealed);
      }

      addNotification(
        `✨ You unlocked and unsealed "${capsuleToOpen.title}"! Welcome back to these memories.`,
        capsuleToOpen.id
      );
    } catch (err: any) {
      alert(err.message || 'Failed to open capsule.');
    }
  };

  // Create capsule action
  const handleCreateCapsule = async (newCapsuleData: Partial<Capsule>, files: File[]) => {
    try {
      const created = await createCapsule(newCapsuleData, files);
      addNotification(
        `🔒 Capsule "${created.title}" has been created and locked until ${new Date(
          created.opening_date
        ).toLocaleDateString()}.`,
        created.id
      );
      setCurrentTab('my-capsules');
    } catch (err: any) {
      alert(err.message || 'Failed to create capsule.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Hourglass className="w-6 h-6 text-white animate-spin" />
          </div>
          <span className="text-xs font-mono tracking-widest text-purple-300 uppercase">
            Synchronizing ChronoVault Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-gray-100 flex flex-col selection:bg-purple-600/30 selection:text-purple-200">
      {!user ? (
        <>
          <Navbar
            onOpenAuth={handleOpenAuth}
            onNavigateHome={() => setCurrentTab('dashboard')}
          />
          <main className="flex-1">
            <LandingPage onOpenAuth={handleOpenAuth} />
          </main>
          <Footer />
        </>
      ) : (
        <div className="flex-1 flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'create-capsule') {
                setCreateModalOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            user={user}
            onLogout={signOut}
            unreadNotificationsCount={unreadCount}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header with backend connection indicator & Notification Bell */}
            <header className="h-20 bg-[#070A12]/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <span className="text-xs uppercase font-mono tracking-widest text-purple-400 font-semibold">
                  {currentTab.replace('-', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Connection Status */}
                {backendOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <Server className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">REST API Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    <Wifi className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Local Mode Active</span>
                  </span>
                )}

                {/* Header Notification Dropdown Bell */}
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onViewAll={() => setCurrentTab('notifications')}
                />

                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition-all"
                >
                  <span>New Capsule</span>
                </button>
              </div>
            </header>

            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
              {currentTab === 'dashboard' && (
                <DashboardView
                  user={user}
                  capsules={capsules}
                  onCreateClick={() => setCreateModalOpen(true)}
                  onViewAllClick={() => setCurrentTab('my-capsules')}
                  onViewDetails={handleViewDetails}
                  onOpenCapsule={handleOpenCapsule}
                />
              )}

              {currentTab === 'my-capsules' && (
                <CapsulesListView
                  capsules={capsules}
                  onCreateClick={() => setCreateModalOpen(true)}
                  onViewDetails={handleViewDetails}
                  onOpenCapsule={handleOpenCapsule}
                />
              )}

              {currentTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                  onClearNotifications={clearNotifications}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  user={user}
                  onUpdateProfile={updateProfile}
                  onLogout={signOut}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <CreateCapsuleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateCapsule}
      />

      <CapsuleDetailsModal
        capsule={selectedCapsule}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedCapsule(null);
        }}
        onOpenCapsule={handleOpenCapsule}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
