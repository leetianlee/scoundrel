import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { GameState, LeaderboardEntry } from '../types';
import { shareScore } from '../utils/shareUtils';
import { Leaderboard } from './Leaderboard';
import './GameOver.css';

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
  onSubmitScore: (nickname: string) => Promise<boolean>;
  leaderboardEntries: LeaderboardEntry[];
  leaderboardLoading: boolean;
  leaderboardError: string | null;
  submitting: boolean;
  submitted: boolean;
  submittedId: string | null;
  onRefreshLeaderboard: () => void;
  streak?: number;
}

export function GameOver({
  gameState, onRestart,
  onSubmitScore, leaderboardEntries, leaderboardLoading, leaderboardError,
  submitting, submitted, submittedId, onRefreshLeaderboard,
  streak,
}: GameOverProps) {
  const { gameStatus, score, highScore, hp } = gameState;
  const isWin = gameStatus === 'won';
  const isNewHighScore = score >= highScore && score > 0;
  const canSubmit = isWin && score > 0;

  // Read streak from localStorage as fallback (markCompleted writes synchronously)
  const effectiveStreak = Math.max(
    streak ?? 0,
    (() => {
      try {
        const val = parseInt(localStorage.getItem('scoundrel_daily_streak') || '0', 10);
        return isNaN(val) ? 0 : val;
      } catch {
        return 0;
      }
    })()
  );

  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('scoundrel_nickname') || '';
  });
  const [showLeaderboard, setShowLeaderboard] = useState(submitted);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  // Auto-show leaderboard after score submission
  useEffect(() => {
    if (submitted && !showLeaderboard) {
      setShowLeaderboard(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const handleSubmit = async () => {
    if (!nickname.trim() || submitting || submitted) return;
    await onSubmitScore(nickname.trim());
  };

  const handleShare = async () => {
    const result = await shareScore(score, isWin);
    if (result === 'copied') {
      setShareStatus('Copied to clipboard!');
      setTimeout(() => setShareStatus(null), 2500);
    } else if (result === 'failed') {
      setShareStatus('Copy failed');
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <>
      <div className={`game-over game-over--${isWin ? 'win' : 'lose'}`}>
        <div className={`game-over__content game-over__content--${isWin ? 'win' : 'lose'}`}>
          <div className="game-over__icon">
            {isWin ? '♛' : '☠'}
          </div>

          <h2 className="game-over__title">
            {isWin ? 'Victory!' : 'Defeated!'}
          </h2>

          <p className="game-over__message">
            {isWin
              ? 'You conquered the dungeon!'
              : 'The dungeon claims another soul...'}
          </p>

          <div className="game-over__stats">
            <div className="game-over__stat">
              <span className="game-over__stat-label">Final Score</span>
              <span className="game-over__stat-value game-over__score">
                {score}
                {isNewHighScore && <span className="game-over__new-high">NEW HIGH!</span>}
              </span>
            </div>

            <div className="game-over__stat">
              <span className="game-over__stat-label">HP Remaining</span>
              <span className="game-over__stat-value">{hp}</span>
            </div>

            <div className="game-over__stat">
              <span className="game-over__stat-label">High Score</span>
              <span className="game-over__stat-value">{highScore}</span>
            </div>
          </div>

          {/* Play streak info */}
          {effectiveStreak > 0 && (
            <div className="game-over__streak">
              <span className="game-over__streak-fire">🔥</span>
              <span className="game-over__streak-count">{effectiveStreak} day streak!</span>
              <span className="game-over__streak-message">
                {effectiveStreak >= 7 ? 'Legendary!' : effectiveStreak >= 3 ? 'Keep it going!' : 'Come back tomorrow!'}
              </span>
            </div>
          )}

          {/* Message for losses explaining no submission */}
          {!isWin && (
            <div className="game-over__loss-hint">
              Only victories qualify for the leaderboard. Try again!
            </div>
          )}

          {/* Score submission — only for wins */}
          {canSubmit && !submitted && (
            <div className="game-over__submit">
              <input
                className="game-over__nickname-input"
                type="text"
                placeholder="Enter your name..."
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={20}
                disabled={submitting}
              />
              <button
                className="game-over__submit-btn"
                onClick={handleSubmit}
                disabled={!nickname.trim() || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Score'}
              </button>
            </div>
          )}

          {submitted && (
            <div className="game-over__submitted">
              Score submitted!
            </div>
          )}

          {/* Action buttons */}
          <div className="game-over__actions">
            <button className="game-over__restart" onClick={onRestart}>
              Play Again
            </button>
            <button className="game-over__share-btn" onClick={handleShare}>
              {shareStatus || (hasNativeShare ? 'Share' : 'Copy Score')}
            </button>
            <button
              className="game-over__leaderboard-btn"
              onClick={() => {
                const next = !showLeaderboard;
                setShowLeaderboard(next);
                if (next) {
                  onRefreshLeaderboard();
                }
              }}
            >
              {showLeaderboard ? 'Hide Leaderboard' : 'Leaderboard'}
            </button>
          </div>

        </div>
      </div>

      {/* Leaderboard modal — portaled to document.body to avoid any CSS containment issues */}
      {showLeaderboard && createPortal(
        <div className="leaderboard-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, background: 'rgba(0,0,0,0.9)', padding: 20 }} onClick={() => setShowLeaderboard(false)}>
          <div className="leaderboard-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="leaderboard-modal__close" onClick={() => setShowLeaderboard(false)}>
              ✕
            </button>
            <Leaderboard
              entries={leaderboardEntries}
              loading={leaderboardLoading}
              error={leaderboardError}
              highlightId={submittedId}
              onRefresh={onRefreshLeaderboard}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
