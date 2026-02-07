import type { Card as CardType, GameState } from '../types';
import { Card } from './Card';
import './Room.css';

interface RoomProps {
  cards: CardType[];
  gameState: GameState;
  onFightWithWeapon: (card: CardType) => void;
  onFightBarehanded: (card: CardType) => void;
  onDrink: (card: CardType) => void;
  onEquip: (card: CardType) => void;
}

export function Room({
  cards,
  gameState,
  onFightWithWeapon,
  onFightBarehanded,
  onDrink,
  onEquip
}: RoomProps) {
  if (cards.length === 0) {
    return (
      <div className="room room--empty">
        <p>Room cleared! Draw the next room...</p>
      </div>
    );
  }

  // Rule: Must leave 1 card for next room (unless deck is empty - final room)
  // When only 1 card remains and deck has cards, that card is locked
  const isLastCardLocked = cards.length === 1 && gameState.deck.length > 0;

  return (
    <div className="room">
      <div className="room__cards">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            gameState={gameState}
            onFightWithWeapon={onFightWithWeapon}
            onFightBarehanded={onFightBarehanded}
            onDrink={onDrink}
            onEquip={onEquip}
            disabled={isLastCardLocked}
          />
        ))}
      </div>
      {isLastCardLocked && (
        <p className="room__locked-hint">
          Carries to next room
        </p>
      )}
    </div>
  );
}
