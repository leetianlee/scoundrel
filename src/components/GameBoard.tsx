import { useState, useEffect, useRef, useCallback } from 'react';
import type { Card } from '../types';
import { useGameState } from '../hooks/useGameState';
import { useSoundContext } from '../hooks/useSound';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useDailyChallenge } from '../hooks/useDailyChallenge';
import { useDailyLeaderboard } from '../hooks/useDailyLeaderboard';
import { useStatistics } from '../hooks/useStatistics';
import { PlayerStatus } from './PlayerStatus';
import { Room } from './Room';
import { GameOver } from './GameOver';
import { HowToPlay } from './HowToPlay';
import { FloatingNumber } from './FloatingNumber';
import { canProceedToNextRoom, canAvoidRoom } from '../utils/gameLogic';
import { ROOM_SIZE } from '../utils/constants';
import './GameBoard.css';

export function GameBoard() {
  const { state, actions } = useGameState();
  const { playSound, soundEnabled, toggleSound } = useSoundContext();
  const leaderboard = useLeaderboard();
  const dailyChallenge = useDailyChallenge();
  const dailyLeaderboard = useDailyLeaderboard();
  const { stats, recordGame } = useStatistics();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [boardClass, setBoardClass] = useState('');
  const prevHpRef = useRef(state.hp);
  const prevGameStatusRef = useRef(state.gameStatus);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; value: number }[]>([]);
  const floatingIdRef = useRef(0);

  const canProceed = canProceedToNextRoom(state.roomCardsResolved, state.room.length);
  const canAvoid = canAvoidRoom(state.lastRoomAvoided, state.room.length);
  const isGameOver = state.gameStatus === 'won' || state.gameStatus === 'lost';
  const cardsRemaining = state.room.length;
  const cardsResolved = state.roomCardsResolved;

  const removeFloatingNumber = useCallback((id: number) => {
    setFloatingNumbers(prev => prev.filter(n => n.id !== id));
  }, []);

  // Fetch leaderboard on mount
  useEffect(() => {
    leaderboard.fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Record game statistics and mark daily challenge completed when game ends
  useEffect(() => {
    if (
      (state.gameStatus === 'won' || state.gameStatus === 'lost') &&
      prevGameStatusRef.current === 'playing'
    ) {
      recordGame(state.gameStatus === 'won', state.score);
      // Mark daily challenge as completed (updates streak immediately)
      if (state.isDailyChallenge) {
        dailyChallenge.markCompleted();
      }
    }
    prevGameStatusRef.current = state.gameStatus;
  }, [state.gameStatus, state.score, state.isDailyChallenge, recordGame, dailyChallenge]);

  // Play sounds and animations based on HP changes
  useEffect(() => {
    const delta = state.hp - prevHpRef.current;
    if (delta < 0) {
      playSound('damage');
      setBoardClass('game-board--damage');
      floatingIdRef.current += 1;
      setFloatingNumbers(prev => [...prev, { id: floatingIdRef.current, value: delta }]);
    } else if (delta > 0) {
      playSound('heal');
      setBoardClass('game-board--heal');
      floatingIdRef.current += 1;
      setFloatingNumbers(prev => [...prev, { id: floatingIdRef.current, value: delta }]);
    }
    prevHpRef.current = state.hp;

    // Clear animation class
    const timer = setTimeout(() => setBoardClass(''), 400);
    return () => clearTimeout(timer);
  }, [state.hp, playSound]);

  // Play game over sounds
  useEffect(() => {
    if (state.gameStatus === 'won') {
      playSound('victory');
    } else if (state.gameStatus === 'lost') {
      playSound('defeat');
    }
  }, [state.gameStatus, playSound]);

  // Handlers for fighting
  const handleFightWithWeapon = (card: Card) => {
    playSound('monsterKill');
    actions.fightMonster(card, true);
  };

  const handleFightBarehanded = (card: Card) => {
    actions.fightMonster(card, false);
  };

  const handleEquipWeapon = (card: Card) => {
    playSound('equipWeapon');
    actions.equipWeapon(card);
  };

  const handleDrawRoom = () => {
    playSound('cardFlip');
    actions.drawRoom();
  };

  const handleAvoidRoom = () => {
    playSound('buttonClick');
    actions.avoidRoom();
  };

  const handleNewGame = () => {
    playSound('buttonClick');
    leaderboard.resetSubmitted();
    dailyLeaderboard.resetSubmitted();
    actions.startGame();
  };

  const handleStartDailyChallenge = () => {
    playSound('buttonClick');
    leaderboard.resetSubmitted();
    dailyLeaderboard.resetSubmitted();
    actions.startDailyChallenge(dailyChallenge.todaySeed);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    roomCards: state.room,
    gameState: state,
    onFightWithWeapon: handleFightWithWeapon,
    onFightBarehanded: handleFightBarehanded,
    onDrink: actions.drinkPotion,
    onEquip: handleEquipWeapon,
    onDrawRoom: handleDrawRoom,
    onAvoidRoom: handleAvoidRoom,
    onNewGame: handleNewGame,
  });

  return (
    <div className={`game-board ${boardClass}`}>
      <header className="game-board__header">
        <h1 className="game-board__title">Scoundrel</h1>
        <div className="game-board__header-controls">
          <div className="game-board__deck-section">
            <div className="game-board__deck-pile">
              {state.deck.length > 6 && (
                <div className="game-board__card-back game-board__card-back--3" />
              )}
              {state.deck.length > 3 && (
                <div className="game-board__card-back game-board__card-back--2" />
              )}
              {state.deck.length > 0 && (
                <div className="game-board__card-back game-board__card-back--1" />
              )}
            </div>
            <span className="game-board__deck-count">{state.deck.length} left</span>
          </div>
          <span className="game-board__high-score">Best: {state.highScore}</span>
          <span className="game-board__stats-display">
            {stats.gamesPlayed > 0 && `${stats.gamesWon}W / ${stats.gamesPlayed}G`}
          </span>
          <button
            className="game-board__help-btn"
            onClick={handleNewGame}
          >
            New Game
          </button>
          <button
            className="game-board__help-btn game-board__help-btn--daily"
            onClick={handleStartDailyChallenge}
          >
            {dailyChallenge.streak > 0 ? `🔥${dailyChallenge.streak} Daily` : 'Daily'}
          </button>
          <button
            className="game-board__help-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
          </button>
          <button
            className="game-board__help-btn"
            onClick={() => setShowHowToPlay(true)}
          >
            How to Play
          </button>
        </div>
      </header>

      <PlayerStatus gameState={state} />

      <main className="game-board__main">
        {state.isDailyChallenge && (
          <div className="game-board__daily-badge">
            ⭐ Daily Challenge: {state.dailySeed}
            {dailyChallenge.streak > 0 && (
              <span className="game-board__streak-badge">🔥 {dailyChallenge.streak} day streak</span>
            )}
          </div>
        )}

        <div className="game-board__room-header game-board__room-header--compact">
          <span className="game-board__room-label">Dungeon Room</span>
          <div className="game-board__room-status">
            {cardsResolved > 0 && (
              <span className="game-board__resolved">
                {cardsResolved} faced · {cardsRemaining} left
              </span>
            )}
            {state.potionUsedThisTurn && (
              <span className="game-board__potion-used">Potion used</span>
            )}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {floatingNumbers.map(fn => (
            <FloatingNumber
              key={fn.id}
              id={fn.id}
              value={fn.value}
              onComplete={() => removeFloatingNumber(fn.id)}
            />
          ))}
        </div>

        <Room
          cards={state.room}
          gameState={state}
          onFightWithWeapon={handleFightWithWeapon}
          onFightBarehanded={handleFightBarehanded}
          onDrink={actions.drinkPotion}
          onEquip={handleEquipWeapon}
        />

        {state.lastAction && (
          <div className="game-board__action-log">
            {state.lastAction}
          </div>
        )}

        <div className="game-board__controls">
          {/* Avoid Room button - only when room is full and last wasn't avoided */}
          {canAvoid && (
            <button
              className="game-board__btn game-board__btn--avoid"
              onClick={handleAvoidRoom}
            >
              Avoid Room
            </button>
          )}

          {/* Proceed button - only when 1 card left */}
          {canProceed && state.room.length === 1 && state.deck.length > 0 && (
            <button
              className="game-board__btn game-board__btn--proceed"
              onClick={handleDrawRoom}
            >
              Continue →
            </button>
          )}

          {/* Draw new room when empty */}
          {state.room.length === 0 && state.deck.length > 0 && (
            <button
              className="game-board__btn game-board__btn--proceed"
              onClick={handleDrawRoom}
            >
              Enter Room →
            </button>
          )}

          {/* Status hint */}
          {!canProceed && state.room.length > 1 && (
            <p className="game-board__hint">
              Face {state.room.length - 1} more · leave 1 behind
            </p>
          )}

          {state.lastRoomAvoided && state.room.length === ROOM_SIZE && (
            <p className="game-board__hint game-board__hint--warning">
              Cannot avoid two rooms in a row
            </p>
          )}

          {/* Keyboard shortcuts hint - desktop only */}
          <div className="game-board__keyboard-hint">
            Keys: 1-4 cards · A avoid · Enter continue · N new game
          </div>
        </div>
      </main>

      {isGameOver && (
        <GameOver
          gameState={state}
          onRestart={handleNewGame}
          onSubmitScore={async (nickname) => {
            return leaderboard.submitScore(nickname, state.score, state.hp);
          }}
          leaderboardEntries={leaderboard.entries}
          leaderboardLoading={leaderboard.loading}
          leaderboardError={leaderboard.error}
          submitting={leaderboard.submitting}
          submitted={leaderboard.submitted}
          submittedId={leaderboard.submittedId}
          onRefreshLeaderboard={leaderboard.fetchLeaderboard}
          isDailyChallenge={state.isDailyChallenge}
          dailySeed={state.dailySeed}
          dailyStreak={dailyChallenge.streak}
          onSubmitDailyScore={async (nickname) => {
            if (!state.dailySeed) return false;
            return dailyLeaderboard.submitDailyScore(
              nickname,
              state.score,
              state.hp,
              state.dailySeed
            );
          }}
          dailyLeaderboardEntries={dailyLeaderboard.entries}
          dailyLeaderboardLoading={dailyLeaderboard.loading}
          dailyLeaderboardError={dailyLeaderboard.error}
          dailySubmitting={dailyLeaderboard.submitting}
          dailySubmitted={dailyLeaderboard.submitted}
          dailySubmittedId={dailyLeaderboard.submittedId}
          onRefreshDailyLeaderboard={() => {
            if (state.dailySeed) {
              dailyLeaderboard.fetchDailyLeaderboard(state.dailySeed);
            }
          }}
        />
      )}

      <HowToPlay isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  );
}
