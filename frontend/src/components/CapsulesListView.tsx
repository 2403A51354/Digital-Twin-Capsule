import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Archive,
  Lock,
  Unlock,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { Capsule, CapsuleCategory } from '../types';
import { CapsuleCard } from './CapsuleCard';

interface CapsulesListViewProps {
  capsules: Capsule[];
  onCreateClick: () => void;
  onViewDetails: (capsule: Capsule) => void;
  onOpenCapsule?: (capsule: Capsule) => void;
}

export const CapsulesListView: React.FC<CapsulesListViewProps> = ({
  capsules,
  onCreateClick,
  onViewDetails,
  onOpenCapsule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'locked' | 'opened'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'opening_date' | 'created_at'>('opening_date');

  const categories: CapsuleCategory[] = [
    'Personal',
    'Friends',
    'Family',
    'Education',
    'Travel',
    'Career',
    'Love',
  ];

  // Filtering & Sorting logic
  const filteredCapsules = useMemo(() => {
    return capsules
      .filter((c) => {
        // Status filter
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        // Category filter
        if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchDesc = c.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'opening_date') {
          return new Date(a.opening_date).getTime() - new Date(b.opening_date).getTime();
        } else {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [capsules, statusFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Time Capsules
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse and manage your collection of temporal vaults.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Capsule</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by capsule title or description..."
              className="w-full bg-[#0D121F] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#0D121F] p-1 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({capsules.length})
            </button>
            <button
              onClick={() => setStatusFilter('locked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'locked'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Locked ({capsules.filter((c) => c.status === 'locked').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('opened')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'opened'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Unlock className="w-3 h-3" />
              <span>Opened ({capsules.filter((c) => c.status === 'opened').length})</span>
            </button>
          </div>
        </div>

        {/* Second Row: Category & Sort Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-gray-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                categoryFilter === 'all'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  categoryFilter === cat
                    ? 'bg-purple-600/20 text-purple-300 font-medium border border-purple-500/30'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0D121F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value="opening_date">Target Opening Date</option>
              <option value="created_at">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Capsules */}
      {filteredCapsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.map((capsule) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              onViewDetails={onViewDetails}
              onOpenCapsule={onOpenCapsule}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-gray-400">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Matching Capsules</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try adjusting your search query, status, or category filter to reveal your capsules.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
