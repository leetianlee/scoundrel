import { useEffect } from 'react';
import type { Card, GameState } from '../types';
import { canUseWeapon, canProceedToNextRoom, canAvoidRoom } from '../utils/gameLogic';

interface UseKeyboardShortcutsProps {
  roomCards: Card[];
  gameState: GameState;
  onFightWithWeapon: (card: Card) => void;
  onFightBarehanded: (card: Card) => void;
  onDrink: (card: Card) => void;
  onEquip: (card: Card) => void;
  onDrawRoom: () => void;
  onAvoidRoom: () => void;
  onNewGame: () => void;
}

export function useKeyboardShortcuts({
  roomCards,
  gameState,
  onFightWithWeapon,
  onFightBarehanded,
  onDrink,
  onEquip,
  onDrawRoom,
  onAvoidRoom,
  onNewGame,
}: UseKeyboardShortcutsProps) {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      // New game: N (works in any game state)
      if (key === 'n') {
        onNewGame();
        e.preventDefault();
        return;
      }

      // All other shortcuts require playing state
      if (gameState.gameStatus !== 'playing') return;

      // Card selection: 1-4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index >= roomCards.length) return;

        const card = roomCards[index];

        // Check if card is locked (last card when deck has cards)
        const isLastCardLocked = roomCards.length === 1 && gameState.deck.length > 0;
        if (isLastCardLocked) return;

        // Dispatch primary action for card type
        switch (card.type) {
          case 'monster': {
            const weaponUsable = gameState.weapon && canUseWeapon(card.value, gameState.lastMonsterSlain);
            if (weaponUsable) {
              onFightWithWeapon(card);
            } else {
              onFightBarehanded(card);
            }
            break;
          }
          case 'potion':
            onDrink(card);
            break;
          case 'weapon':
            onEquip(card);
            break;
        }
        e.preventDefault();
        return;
      }

      // Avoid room: A
      if (key === 'a') {
        if (canAvoidRoom(gameState.lastRoomAvoided, roomCards.length)) {
          onAvoidRoom();
          e.preventDefault();
        }
        return;
      }

      // Continue/Enter room: Enter or C
      if (key === 'enter' || key === 'c') {
        if (canProceedToNextRoom(gameState.roomCardsResolved, roomCards.length)) {
          onDrawRoom();
          e.preventDefault();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    roomCards,
    gameState,
    onFightWithWeapon,
    onFightBarehanded,
    onDrink,
    onEquip,
    onDrawRoom,
    onAvoidRoom,
    onNewGame,
  ]);
}
