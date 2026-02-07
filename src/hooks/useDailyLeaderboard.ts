import { useState, useCallback } from 'react';
import type { DailyLeaderboardEntry } from '../types';

interface UseDailyLeaderboardReturn {
  entries: DailyLeaderboardEntry[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  submitted: boolean;
  submittedId: string | null;
  fetchDailyLeaderboard: (date: string) => Promise<void>;
  submitDailyScore: (
    nickname: string,
    score: number,
    hpRemaining: number,
    challengeDate: string
  ) => Promise<boolean>;
  resetSubmitted: () => void;
}

export function useDailyLeaderboard(): UseDailyLeaderboardReturn {
  const [entries, setEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const fetchDailyLeaderboard = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/daily-leaderboard?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEntries(data);
    } catch {
      setError('Could not load daily leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitDailyScore = useCallback(
    async (
      nickname: string,
      score: number,
      hpRemaining: number,
      challengeDate: string
    ): Promise<boolean> => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch('/api/submit-daily-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname,
            score,
            hp_remaining: hpRemaining,
            challenge_date: challengeDate,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Submission failed');
        }
        const entry = await res.json();
        setSubmitted(true);
        setSubmittedId(entry.id);
        // Save nickname for next time
        localStorage.setItem('scoundrel_nickname', nickname);
        // Refresh leaderboard
        await fetchDailyLeaderboard(challengeDate);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Submission failed');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDailyLeaderboard]
  );

  const resetSubmitted = useCallback(() => {
    setSubmitted(false);
    setSubmittedId(null);
    setError(null);
  }, []);

  return {
    entries,
    loading,
    error,
    submitting,
    submitted,
    submittedId,
    fetchDailyLeaderboard,
    submitDailyScore,
    resetSubmitted,
  };
}
