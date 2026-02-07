import { useState } from 'react';
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
}

export function GameOver({
  gameState, onRestart,
  onSubmitScore, leaderboardEntries, leaderboardLoading, leaderboardError,
  submitting, submitted, submittedId, onRefreshLeaderboard,
}: GameOverProps) {
  const { gameStatus, score, highScore, hp } = gameState;
  const isWin = gameStatus === 'won';
  const isNewHighScore = score >= highScore && score > 0;
  const canSubmit = isWin && score > 0;

  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('scoundrel_nickname') || '';
  });
  const [showLeaderboard, setShowLeaderboard] = useState(submitted);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nickname.trim() || submitting || submitted) return;
    await onSubmitScore(nickname.trim());
  };

  const handleShare = async () => {
    const result = await shareScore(score, isWin);
    if (result === 'copied') {
      setShareStatus('Copied!');
      setTimeout(() => setShareStatus(null), 2000);
    } else if (result === 'failed') {
      setShareStatus('Failed');
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
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
            {shareStatus || 'Share'}
          </button>
          {!showLeaderboard && (
            <button
              className="game-over__leaderboard-btn"
              onClick={() => {
                setShowLeaderboard(true);
                onRefreshLeaderboard();
              }}
            >
              Leaderboard
            </button>
          )}
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <Leaderboard
            entries={leaderboardEntries}
            loading={leaderboardLoading}
            error={leaderboardError}
            highlightId={submittedId}
            onRefresh={onRefreshLeaderboard}
          />
        )}
      </div>
    </div>
  );
}
