import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  User,
  Users,
  Heart,
  GraduationCap,
  Compass,
  Briefcase
} from 'lucide-react';
import { Capsule, CapsuleCategory } from '../types';
import { CountdownClock } from './CountdownClock';
import { getSynchronizedNow } from '../utils/timeSync';

interface CapsuleCardProps {
  capsule: Capsule;
  onViewDetails: (capsule: Capsule) => void;
  onOpenCapsule?: (capsule: Capsule) => void;
}

const getCategoryDetails = (category: CapsuleCategory) => {
  switch (category) {
    case 'Personal':
      return {
        icon: <User className="w-3.5 h-3.5 text-purple-400" />,
        badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      };
    case 'Friends':
      return {
        icon: <Users className="w-3.5 h-3.5 text-blue-400" />,
        badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      };
    case 'Family':
      return {
        icon: <Heart className="w-3.5 h-3.5 text-rose-400" />,
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      };
    case 'Education':
      return {
        icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />,
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'Travel':
      return {
        icon: <Compass className="w-3.5 h-3.5 text-amber-400" />,
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    case 'Career':
      return {
        icon: <Briefcase className="w-3.5 h-3.5 text-cyan-400" />,
        badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      };
    default:
      return {
        icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
        badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      };
  }
};

export const CapsuleCard: React.FC<CapsuleCardProps> = ({
  capsule,
  onViewDetails,
  onOpenCapsule,
}) => {
  const [isReadyToOpen, setIsReadyToOpen] = useState(() => {
    return new Date(capsule.opening_date).getTime() <= getSynchronizedNow();
  });

  const categoryDetails = getCategoryDetails(capsule.category);

  useEffect(() => {
    const checkArrival = () => {
      const arrived = new Date(capsule.opening_date).getTime() <= getSynchronizedNow();
      setIsReadyToOpen(arrived);
    };

    checkArrival();
    const interval = setInterval(checkArrival, 1000);
    return () => clearInterval(interval);
  }, [capsule.opening_date]);

  const isAlreadyOpened = capsule.status === 'opened';
  const isReadyToUnlock = capsule.status === 'locked' && isReadyToOpen;
  const isLocked = capsule.status === 'locked' && !isReadyToOpen;

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/10 hover:border-purple-500/40 transition-all duration-300">
      
      {/* Background soft ambient hover glow */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all pointer-events-none"></div>

      <div>
        {/* Top bar: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${categoryDetails.badgeClass}`}
          >
            {categoryDetails.icon}
            <span>{capsule.category}</span>
          </span>

          {isAlreadyOpened ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Unlock className="w-3 h-3" />
              <span>OPENED</span>
            </span>
          ) : isReadyToUnlock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>READY TO UNLOCK</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Lock className="w-3 h-3" />
              <span>LOCKED</span>
            </span>
          )}
        </div>

        {/* Capsule Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
          {capsule.title}
        </h3>

        {/* Description Excerpt */}
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
          {capsule.description || 'No description provided.'}
        </p>

        {/* Opening Date Metadata */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" /> Created
            </span>
            <span className="text-gray-300 font-medium">
              {new Date(capsule.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-purple-400">
              <Clock className="w-3.5 h-3.5" /> Unlock Date
            </span>
            <span className="text-purple-200 font-semibold">
              {new Date(capsule.opening_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Countdown Box / Status Display */}
        <div className="mt-4 p-3 rounded-2xl bg-[#090D18] border border-white/5">
          {isAlreadyOpened ? (
            <div className="text-center py-1">
              <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <Unlock className="w-4 h-4" /> Vault Unlocked
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                Opened on {capsule.opened_at ? new Date(capsule.opened_at).toLocaleDateString() : 'Arrival'}
              </span>
            </div>
          ) : isReadyToUnlock ? (
            <div className="text-center py-1">
              <span className="text-xs text-cyan-300 font-bold block animate-bounce">
                The Scheduled Date Has Arrived!
              </span>
              <span className="text-[10px] text-gray-400">Eligible for permanent unsealing</span>
            </div>
          ) : (
            <CountdownClock
              createdAt={capsule.created_at}
              openingDate={capsule.opening_date}
              compact
              onReachedZero={() => setIsReadyToOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span>{capsule.files_count ?? (capsule.files?.length || 0)} files</span>
        </span>

        {isReadyToUnlock && onOpenCapsule ? (
          <button
            onClick={() => onOpenCapsule(capsule)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Open Vault</span>
          </button>
        ) : (
          <button
            onClick={() => onViewDetails(capsule)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-xs flex items-center gap-1 border border-white/5 hover:border-purple-500/30 transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
