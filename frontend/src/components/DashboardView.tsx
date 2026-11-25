import React from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  Archive,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  Hourglass
} from 'lucide-react';
import { Capsule, UserProfile } from '../types';
import { CapsuleCard } from './CapsuleCard';

interface DashboardViewProps {
  user: UserProfile | null;
  capsules: Capsule[];
  onCreateClick: () => void;
  onViewAllClick: () => void;
  onViewDetails: (capsule: Capsule) => void;
  onOpenCapsule?: (capsule: Capsule) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  capsules,
  onCreateClick,
  onViewAllClick,
  onViewDetails,
  onOpenCapsule,
}) => {
  // Compute metrics
  const totalCount = capsules.length;
  const lockedCount = capsules.filter((c) => c.status === 'locked').length;
  const openedCount = capsules.filter((c) => c.status === 'opened').length;

  // Find the next upcoming capsule
  const lockedCapsules = capsules
    .filter((c) => c.status === 'locked')
    .sort((a, b) => new Date(a.opening_date).getTime() - new Date(b.opening_date).getTime());

  const nextUpcoming = lockedCapsules[0];

  // Recently created capsules (sorted by created_at desc)
  const recentCapsules = [...capsules]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Calculate days until next opening
  const daysUntilNext = nextUpcoming
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextUpcoming.opening_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* ========================================================= */}
      {/* Top Banner: Greeting & Quick CTA */}
      {/* ========================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/40 via-[#131A2B] to-indigo-950/40 border border-purple-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs uppercase font-mono tracking-widest text-purple-300 font-semibold">
                ChronoVault Operational
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hello, {user?.full_name || 'Memory Keeper'} 👋
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              You currently have <span className="text-purple-300 font-semibold">{lockedCount} sealed capsules</span> safeguarding your reflections across time.
            </p>
          </div>

          <button
            onClick={onCreateClick}
            className="group px-5 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Create New Capsule</span>
          </button>
        </div>

        {/* Ambient background glow inside card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* ========================================================= */}
      {/* Metric Stat Cards */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Capsules */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Capsules
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{totalCount}</span>
            <span className="text-xs text-purple-300">Preserved</span>
          </div>
        </div>

        {/* Locked Capsules */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Locked Vaults
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{lockedCount}</span>
            <span className="text-xs text-amber-300/80">In transit</span>
          </div>
        </div>

        {/* Opened Capsules */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Opened Vaults
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{openedCount}</span>
            <span className="text-xs text-emerald-300/80">Unlocked</span>
          </div>
        </div>

        {/* Next Opening */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Next Unlock
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {daysUntilNext !== null ? `${daysUntilNext}d` : 'None'}
            </span>
            <span className="text-xs text-cyan-300/80">
              {daysUntilNext !== null ? 'Remaining' : 'Scheduled'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Upcoming Capsule Opening Spotlight / Timeline */}
      {/* ========================================================= */}
      {nextUpcoming && (
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-purple-500/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Upcoming Next In Timeline
                </span>
                <span className="text-xs text-gray-400">
                  Target: {new Date(nextUpcoming.opening_date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {nextUpcoming.title}
              </h3>
              <p className="text-xs text-gray-300 max-w-xl">
                {nextUpcoming.description || 'A sealed capsule scheduled to open soonest.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-gray-400 block">Category</span>
                <span className="text-sm font-semibold text-purple-300">{nextUpcoming.category}</span>
              </div>
              <button
                onClick={() => onViewDetails(nextUpcoming)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-2 transition-all"
              >
                <span>Inspect Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Recently Created Capsules Section */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Recently Created Capsules
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Your latest sealed letters, media vaults, and temporal memories.
            </p>
          </div>

          <button
            onClick={onViewAllClick}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>View All ({totalCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCapsules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCapsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onViewDetails={onViewDetails}
                onOpenCapsule={onOpenCapsule}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-gray-400">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Capsules Created Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Start your journey into time travel by sealing your first message, photo, or document.
            </p>
            <button
              onClick={onCreateClick}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Capsule</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
