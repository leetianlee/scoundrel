import { useState, useCallback } from 'react';
import type { LeaderboardEntry } from '../types';

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  submitted: boolean;
  submittedId: string | null;
  fetchLeaderboard: () => Promise<void>;
  submitScore: (nickname: string, score: number, hpRemaining: number) => Promise<boolean>;
  resetSubmitted: () => void;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEntries(data);
    } catch {
      setError('Could not load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitScore = useCallback(async (
    nickname: string, score: number, hpRemaining: number
  ): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, score, hp_remaining: hpRemaining }),
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
      await fetchLeaderboard();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchLeaderboard]);

  const resetSubmitted = useCallback(() => {
    setSubmitted(false);
    setSubmittedId(null);
    setError(null);
  }, []);

  return {
    entries, loading, error, submitting, submitted, submittedId,
    fetchLeaderboard, submitScore, resetSubmitted,
  };
}
