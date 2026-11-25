let serverTimeOffsetMs = 0;
let isSynchronized = false;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Sync client clock offset with the atomic server time
 */
export const syncServerTime = async (): Promise<number> => {
  try {
    const clientBefore = Date.now();
    const res = await fetch(`${API_BASE_URL}/capsules/server-time`);
    if (res.ok) {
      const data = await res.json();
      const clientAfter = Date.now();
      const roundTripLatency = (clientAfter - clientBefore) / 2;
      const accurateServerTime = data.server_timestamp + roundTripLatency;

      serverTimeOffsetMs = accurateServerTime - clientAfter;
      isSynchronized = true;
    }
  } catch {
    // If backend offline, offset remains 0
    serverTimeOffsetMs = 0;
  }
  return serverTimeOffsetMs;
};

/**
 * Get current timestamp synchronized against the server's atomic clock
 */
export const getSynchronizedNow = (): number => {
  return Date.now() + serverTimeOffsetMs;
};

export interface CountdownMetrics {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isReady: boolean;
  progressPercent: number; // 0 to 100%
  totalDurationMs: number;
  remainingMs: number;
}

/**
 * Calculate precision countdown metrics
 */
export const calculatePrecisionCountdown = (
  createdAtIso: string,
  openingDateIso: string
): CountdownMetrics => {
  const now = getSynchronizedNow();
  const start = new Date(createdAtIso).getTime();
  const target = new Date(openingDateIso).getTime();

  const totalDurationMs = Math.max(1, target - start);
  const remainingMs = Math.max(0, target - now);

  const isReady = remainingMs <= 0;

  // Percentage elapsed (0 to 100%)
  const elapsedMs = Math.max(0, now - start);
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingMs / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isReady,
    progressPercent,
    totalDurationMs,
    remainingMs,
  };
};
