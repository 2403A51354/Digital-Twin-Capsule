import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, Clock } from 'lucide-react';
import { calculatePrecisionCountdown, CountdownMetrics, syncServerTime } from '../utils/timeSync';

interface CountdownClockProps {
  createdAt: string;
  openingDate: string;
  onReachedZero?: () => void;
  compact?: boolean;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({
  createdAt,
  openingDate,
  onReachedZero,
  compact = false,
}) => {
  const [metrics, setMetrics] = useState<CountdownMetrics>(() =>
    calculatePrecisionCountdown(createdAt, openingDate)
  );

  useEffect(() => {
    // Initial sync
    syncServerTime();

    const interval = setInterval(() => {
      const updated = calculatePrecisionCountdown(createdAt, openingDate);
      setMetrics(updated);

      if (updated.isReady && onReachedZero) {
        onReachedZero();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, openingDate, onReachedZero]);

  if (metrics.isReady) {
    return (
      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/30 text-center animate-pulse">
        <span className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scheduled Opening Timestamp Arrived!</span>
        </span>
        <span className="text-[10px] text-gray-400 block mt-0.5">
          Eligible for permanent unsealing
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-1.5 font-mono">
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="bg-[#101726] py-1 px-1.5 rounded-lg border border-white/5">
            <span className="block text-sm font-bold text-white">{metrics.days}</span>
            <span className="text-[8px] text-purple-300 uppercase">Days</span>
          </div>
          <div className="bg-[#101726] py-1 px-1.5 rounded-lg border border-white/5">
            <span className="block text-sm font-bold text-white">{metrics.hours}</span>
            <span className="text-[8px] text-purple-300 uppercase">Hrs</span>
          </div>
          <div className="bg-[#101726] py-1 px-1.5 rounded-lg border border-white/5">
            <span className="block text-sm font-bold text-white">{metrics.minutes}</span>
            <span className="text-[8px] text-purple-300 uppercase">Min</span>
          </div>
          <div className="bg-[#101726] py-1 px-1.5 rounded-lg border border-white/5">
            <span className="block text-sm font-bold text-white">{metrics.seconds}</span>
            <span className="text-[8px] text-purple-300 uppercase">Sec</span>
          </div>
        </div>

        {/* Temporal Progress Bar */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 text-center space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs text-purple-300 font-sans">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <span>Server-Synchronized Temporal Lock</span>
        </span>
        <span className="text-[11px] text-gray-400 font-mono">
          {metrics.progressPercent.toFixed(1)}% Journey Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-1000"
          style={{ width: `${metrics.progressPercent}%` }}
        />
      </div>

      {/* 4-Unit Grid */}
      <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
        <div className="bg-[#090D18] p-3 rounded-2xl border border-white/5">
          <span className="block text-2xl font-bold text-white">{metrics.days}</span>
          <span className="text-[10px] text-purple-300 uppercase">Days</span>
        </div>
        <div className="bg-[#090D18] p-3 rounded-2xl border border-white/5">
          <span className="block text-2xl font-bold text-white">{metrics.hours}</span>
          <span className="text-[10px] text-purple-300 uppercase">Hours</span>
        </div>
        <div className="bg-[#090D18] p-3 rounded-2xl border border-white/5">
          <span className="block text-2xl font-bold text-white">{metrics.minutes}</span>
          <span className="text-[10px] text-purple-300 uppercase">Mins</span>
        </div>
        <div className="bg-[#090D18] p-3 rounded-2xl border border-white/5">
          <span className="block text-2xl font-bold text-white">{metrics.seconds}</span>
          <span className="text-[10px] text-purple-300 uppercase">Secs</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 font-sans">
        Protected by atomic server clock synchronization. Decryption is prohibited before arrival.
      </p>
    </div>
  );
};
