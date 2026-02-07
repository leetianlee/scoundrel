import { useMemo } from 'react';
import { getDailySeed } from '../utils/cardUtils';

const DAILY_COMPLETION_KEY = 'scoundrel_daily_completed';

interface UseDailyChallengeReturn {
  todaySeed: string;
  hasCompletedToday: boolean;
  markCompleted: () => void;
}

export function useDailyChallenge(): UseDailyChallengeReturn {
  const todaySeed = getDailySeed();

  // Derive completion status directly from localStorage (no effect needed)
  const hasCompletedToday = useMemo(() => {
    const stored = localStorage.getItem(DAILY_COMPLETION_KEY);
    return stored === todaySeed;
  }, [todaySeed]);

  const markCompleted = () => {
    localStorage.setItem(DAILY_COMPLETION_KEY, todaySeed);
    // Force a re-render by triggering a storage event won't work in same tab,
    // but the parent component will re-render after game over anyway
  };

  return {
    todaySeed,
    hasCompletedToday,
    markCompleted,
  };
}
