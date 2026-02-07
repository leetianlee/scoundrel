import type { LeaderboardEntry } from '../types';
import './Leaderboard.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  highlightId: string | null;
  onRefresh: () => void;
  title?: string;
}

function formatTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getRankLabel(index: number): string {
  if (index === 0) return '\u{1F451}'; // crown
  if (index === 1) return '2nd';
  if (index === 2) return '3rd';
  return `${index + 1}`;
}

export function Leaderboard({ entries, loading, error, highlightId, onRefresh, title }: LeaderboardProps) {
  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <h3 className="leaderboard__title">{title || 'Global Leaderboard'}</h3>
        <button className="leaderboard__refresh" onClick={onRefresh} disabled={loading}>
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="leaderboard__error">
          {error}
          <button className="leaderboard__retry" onClick={onRefresh}>Retry</button>
        </div>
      )}

      {loading && entries.length === 0 && (
        <div className="leaderboard__loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="leaderboard__skeleton" />
          ))}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="leaderboard__empty">No scores yet. Be the first!</div>
      )}

      {entries.length > 0 && (
        <div className="leaderboard__list">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`leaderboard__entry ${
                index < 3 ? `leaderboard__entry--top${index + 1}` : ''
              } ${entry.id === highlightId ? 'leaderboard__entry--highlight' : ''}`}
            >
              <span className={`leaderboard__rank ${index < 3 ? 'leaderboard__rank--top' : ''}`}>
                {getRankLabel(index)}
              </span>
              <span className="leaderboard__nickname">{entry.nickname}</span>
              <span className="leaderboard__score">{entry.score}</span>
              <span className="leaderboard__hp">{entry.hp_remaining} HP</span>
              <span className="leaderboard__time">{formatTimeAgo(entry.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
