import { useState, useEffect } from 'react';
import type { Card as CardType, GameState } from '../types';
import {
  SUIT_SYMBOLS,
  SUIT_COLORS,
  MAX_HP,
  MONSTER_NAMES,
  WEAPON_NAMES,
  POTION_NAMES,
  TYPE_ICONS
} from '../utils/constants';
import { canUseWeapon, calculateWeaponDamage } from '../utils/gameLogic';
import './Card.css';

interface CardProps {
  card: CardType;
  gameState: GameState;
  onFightWithWeapon: (card: CardType) => void;
  onFightBarehanded: (card: CardType) => void;
  onDrink: (card: CardType) => void;
  onEquip: (card: CardType) => void;
  disabled?: boolean;
  isNew?: boolean;
}

// Get the image path for a card
function getCardImagePath(card: CardType): string {
  const folder = card.type === 'monster' ? 'monsters' : card.type === 'weapon' ? 'weapons' : 'potions';
  return `/cards/${folder}/${card.suit}_${card.rank}.png`;
}

export function Card({
  card,
  gameState,
  onFightWithWeapon,
  onFightBarehanded,
  onDrink,
  onEquip,
  disabled,
  isNew = false
}: CardProps) {
  const [animationClass, setAnimationClass] = useState(isNew ? 'card--entering' : '');
  const [hasImage, setHasImage] = useState(false);
  const symbol = SUIT_SYMBOLS[card.suit];
  const color = SUIT_COLORS[card.suit];

  // Check if card image exists
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasImage(true);
    img.onerror = () => setHasImage(false);
    img.src = getCardImagePath(card);
  }, [card]);

  // Clear animation after it plays
  useEffect(() => {
    if (animationClass) {
      const timer = setTimeout(() => setAnimationClass(''), 500);
      return () => clearTimeout(timer);
    }
  }, [animationClass]);

  // Get themed name for the card
  const getCardName = (): string | null => {
    if (card.type === 'monster') {
      return MONSTER_NAMES[card.suit]?.[card.rank] || null;
    }
    if (card.type === 'weapon') {
      return WEAPON_NAMES[card.rank] || null;
    }
    if (card.type === 'potion') {
      return POTION_NAMES[card.rank] || null;
    }
    return null;
  };

  // Check if weapon can be used against this monster
  const weaponUsable = gameState.weapon && canUseWeapon(card.value, gameState.lastMonsterSlain);

  // Delay action dispatch so exit animation can play
  const triggerWithExitAnimation = (action: () => void) => {
    setAnimationClass('card--exiting');
    setTimeout(() => action(), 300);
  };

  const handlePrimaryClick = () => {
    if (disabled || gameState.gameStatus !== 'playing') return;

    switch (card.type) {
      case 'monster':
        if (weaponUsable) {
          triggerWithExitAnimation(() => onFightWithWeapon(card));
        } else {
          triggerWithExitAnimation(() => onFightBarehanded(card));
        }
        break;
      case 'potion':
        triggerWithExitAnimation(() => onDrink(card));
        break;
      case 'weapon':
        triggerWithExitAnimation(() => onEquip(card));
        break;
    }
  };

  const handleSecondaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || gameState.gameStatus !== 'playing') return;

    if (card.type === 'monster') {
      triggerWithExitAnimation(() => onFightBarehanded(card));
    }
  };

  const getActionLabel = (): string => {
    switch (card.type) {
      case 'monster': {
        if (weaponUsable && gameState.weapon) {
          const damage = calculateWeaponDamage(card.value, gameState.weapon.value);
          return damage > 0 ? `-${damage}` : 'No dmg';
        }
        return `-${card.value}`;
      }
      case 'potion': {
        if (gameState.potionUsedThisTurn) return 'Discard';
        if (gameState.hp >= MAX_HP) return 'Full';
        const heal = Math.min(card.value, gameState.maxHp - gameState.hp);
        return `+${heal}`;
      }
      case 'weapon': {
        return `${card.value} ATK`;
      }
    }
  };

  const cardName = getCardName();
  const typeClass = card.type;
  const typeIcon = TYPE_ICONS[card.type];

  // Build style object with optional background image
  const cardStyle: React.CSSProperties = {
    '--card-color': color,
    ...(hasImage && {
      backgroundImage: `url(${getCardImagePath(card)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }),
  } as React.CSSProperties;

  return (
    <div
      className={`card card--${typeClass} ${hasImage ? 'card--has-image' : ''} ${animationClass} ${disabled ? 'card--disabled' : ''}`}
      onClick={handlePrimaryClick}
      style={cardStyle}
    >
      {/* Dark overlay for readability when image is present */}
      {hasImage && <div className="card__image-overlay" />}

      <div className="card__corner card__corner--top">
        <span className="card__rank">{card.rank}</span>
        <span className="card__suit">{symbol}</span>
      </div>

      {/* Only show center suit if no image */}
      {!hasImage && (
        <div className="card__center">
          <span className="card__suit-large">{symbol}</span>
        </div>
      )}

      {/* Monster name overlay - only when no image */}
      {card.type === 'monster' && cardName && !hasImage && (
        <div className="card__monster-name">{cardName}</div>
      )}

      {/* Type badge - only show when no image (border color indicates type) */}
      {!hasImage && (
        <div className="card__type-badge">
          {typeIcon}
        </div>
      )}

      <div className="card__action">
        {getActionLabel()}
      </div>

      {/* Show barehanded option for monsters when weapon is available */}
      {card.type === 'monster' && weaponUsable && (
        <button
          className="card__secondary-action"
          onClick={handleSecondaryClick}
        >
          Bare: -{card.value}
        </button>
      )}

    </div>
  );
}
