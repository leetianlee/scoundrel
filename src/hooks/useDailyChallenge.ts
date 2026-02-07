import { useState, useCallback } from 'react';
import { getDailySeed } from '../utils/cardUtils';

const DAILY_COMPLETION_KEY = 'scoundrel_daily_completed';
const DAILY_STREAK_KEY = 'scoundrel_daily_streak';
const DAILY_LAST_COMPLETED_KEY = 'scoundrel_daily_last_completed';

interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
}

interface UseDailyChallengeReturn {
  todaySeed: string;
  hasCompletedToday: boolean;
  streak: number;
  markCompleted: () => void;
}

/**
 * Get yesterday's date seed in YYYY-MM-DD format
 */
function getYesterdaySeed(): string {
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
  const streak = parseInt(localStorage.getItem(DAILY_STREAK_KEY) || '0', 10);
  const lastCompletedDate = localStorage.getItem(DAILY_LAST_COMPLETED_KEY);
  return {
    currentStreak: isNaN(streak) ? 0 : streak,
    lastCompletedDate,
  };
}

/**
 * Calculate the effective current streak based on last completion date.
 * - If last completed today: streak is current value
 * - If last completed yesterday: streak is current value (will continue if they play today)
 * - If last completed before yesterday: streak resets to 0
 */
function getEffectiveStreak(todaySeed: string): number {
  const streakData = getStreakData();
  const { currentStreak, lastCompletedDate } = streakData;
  if (!lastCompletedDate || currentStreak === 0) return 0;

  const yesterdaySeed = getYesterdaySeed();

  if (lastCompletedDate === todaySeed) {
    // Completed today — streak is current
    return currentStreak;
  } else if (lastCompletedDate === yesterdaySeed) {
    // Completed yesterday — streak is still alive (awaiting today's completion)
    return currentStreak;
  } else {
    // Streak broken — too many days since last completion
    return 0;
  }
}

/**
 * Check if today's daily challenge has been completed
 */
function checkCompletedToday(todaySeed: string): boolean {
  const stored = localStorage.getItem(DAILY_COMPLETION_KEY);
  return stored === todaySeed;
}

export function useDailyChallenge(): UseDailyChallengeReturn {
  const todaySeed = getDailySeed();

  // Use useState initializers to read from localStorage (React 19 safe pattern)
  const [hasCompletedToday, setHasCompletedToday] = useState(
    () => checkCompletedToday(todaySeed)
  );
  const [streak, setStreak] = useState(
    () => getEffectiveStreak(todaySeed)
  );

  const markCompleted = useCallback(() => {
    // Mark today as completed
    localStorage.setItem(DAILY_COMPLETION_KEY, todaySeed);

    // Update streak
    const streakData = getStreakData();
    const yesterdaySeed = getYesterdaySeed();

    let newStreak: number;
    if (streakData.lastCompletedDate === todaySeed) {
      // Already completed today — don't change streak
      newStreak = streakData.currentStreak;
    } else if (
      streakData.lastCompletedDate === yesterdaySeed &&
      streakData.currentStreak > 0
    ) {
      // Completed yesterday — extend streak
      newStreak = streakData.currentStreak + 1;
    } else {
      // First completion or streak was broken — start at 1
      newStreak = 1;
    }

    localStorage.setItem(DAILY_STREAK_KEY, String(newStreak));
    localStorage.setItem(DAILY_LAST_COMPLETED_KEY, todaySeed);

    // Update React state so UI re-renders
    setHasCompletedToday(true);
    setStreak(newStreak);
  }, [todaySeed]);

  return {
    todaySeed,
    hasCompletedToday,
    streak,
    markCompleted,
  };
}
