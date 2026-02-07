import { useState, useCallback } from 'react';
import type { GameStatistics } from '../types';

const STATS_KEY = 'scoundrel_statistics';

function loadStats(): GameStatistics {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    totalWinScore: 0,
    bestScore: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
  };
}

function saveStats(stats: GameStatistics) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useStatistics() {
  const [stats, setStats] = useState<GameStatistics>(loadStats);

  const recordGame = useCallback((won: boolean, score: number) => {
    setStats(prev => {
      const updated: GameStatistics = {
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + (won ? 1 : 0),
        totalWinScore: prev.totalWinScore + (won ? score : 0),
        bestScore: won ? Math.max(prev.bestScore, score) : prev.bestScore,
        currentWinStreak: won ? prev.currentWinStreak + 1 : 0,
        longestWinStreak: won
          ? Math.max(prev.longestWinStreak, prev.currentWinStreak + 1)
          : prev.longestWinStreak,
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  return { stats, recordGame };
}
