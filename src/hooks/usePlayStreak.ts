import { useState, useCallback } from 'react';

const STREAK_KEY = 'scoundrel_daily_streak';
const LAST_PLAYED_KEY = 'scoundrel_daily_last_completed';

interface StreakData {
  currentStreak: number;
  lastPlayedDate: string | null;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Read streak data from localStorage
 */
function getStreakData(): StreakData {
  const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  const lastPlayedDate = localStorage.getItem(LAST_PLAYED_KEY);
  return {
    currentStreak: isNaN(streak) ? 0 : streak,
    lastPlayedDate,
  };
}

/**
 * Calculate the effective current streak.
 * - If last played today: streak is current value
 * - If last played yesterday: streak is current value (still alive)
 * - If last played before yesterday: streak is 0 (broken)
 */
function getEffectiveStreak(): number {
  const { currentStreak, lastPlayedDate } = getStreakData();
  if (!lastPlayedDate || currentStreak === 0) return 0;

  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  if (lastPlayedDate === today || lastPlayedDate === yesterday) {
    return currentStreak;
  }
  // Streak broken — too many days since last play
  return 0;
}

/**
 * Hook to track consecutive days played.
 * Call `recordPlay()` whenever a game ends (win or lose).
 * The streak increments once per day.
 */
export function usePlayStreak() {
  const [streak, setStreak] = useState(getEffectiveStreak);

  const recordPlay = useCallback(() => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const { currentStreak, lastPlayedDate } = getStreakData();

    let newStreak: number;
    if (lastPlayedDate === today) {
      // Already played today — no change
      newStreak = currentStreak;
    } else if (lastPlayedDate === yesterday && currentStreak > 0) {
      // Played yesterday — extend streak
      newStreak = currentStreak + 1;
    } else {
      // First play or streak was broken — start at 1
      newStreak = 1;
    }

    localStorage.setItem(STREAK_KEY, String(newStreak));
    localStorage.setItem(LAST_PLAYED_KEY, today);
    setStreak(newStreak);
  }, []);

  return { streak, recordPlay };
}
