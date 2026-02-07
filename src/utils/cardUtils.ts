import type { Card, Suit, Rank, CardType } from '../types';
import { SUITS, RANKS, RANK_VALUES } from './constants';

/**
 * Determines the type of a card based on suit and rank
 * Official rules:
 * - Clubs & Spades (all ranks) = Monsters
 * - Diamonds 2-10 = Weapons
 * - Hearts 2-10 = Health Potions
 */
export function getCardType(suit: Suit): CardType {
  // Black suits (clubs, spades) are always monsters
  if (suit === 'clubs' || suit === 'spades') {
    return 'monster';
  }
  // Diamonds are weapons
  if (suit === 'diamonds') {
    return 'weapon';
  }
  // Hearts are potions
  return 'potion';
}

/**
 * Creates a single card
 */
export function createCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${suit}-${rank}`,
    suit,
    rank,
    value: RANK_VALUES[rank],
    type: getCardType(suit),
  };
}

/**
 * Checks if a card should be included in the Scoundrel deck
 * Remove: Red Face Cards (J, Q, K) and Red Aces
 * Keep: All black cards, Diamonds 2-10, Hearts 2-10
 */
function isValidScoundrelCard(suit: Suit, rank: Rank): boolean {
  // Keep all black cards (clubs, spades)
  if (suit === 'clubs' || suit === 'spades') {
    return true;
  }
  // For red cards, only keep 2-10 (remove J, Q, K, A)
  if (rank === 'J' || rank === 'Q' || rank === 'K' || rank === 'A') {
    return false;
  }
  return true;
}

/**
 * Creates the Scoundrel deck (44 cards)
 * - 26 Monsters (all Clubs and Spades)
 * - 9 Weapons (Diamonds 2-10)
 * - 9 Potions (Hearts 2-10)
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      if (isValidScoundrelCard(suit, rank)) {
        deck.push(createCard(suit, rank));
      }
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a new shuffled deck ready for play
 */
export function createShuffledDeck(): Card[] {
  return shuffleDeck(createDeck());
}

/**
 * Gets the display name for a card
 */
export function getCardName(card: Card): string {
  const rankName = typeof card.rank === 'number'
    ? card.rank.toString()
    : { 'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace' }[card.rank];

  const suitName = {
    hearts: 'Hearts',
    diamonds: 'Diamonds',
    clubs: 'Clubs',
    spades: 'Spades',
  }[card.suit];

  return `${rankName} of ${suitName}`;
}

/**
 * Checks if a card is a red suit
 */
export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

/**
 * Checks if a card is a black suit
 */
export function isBlackSuit(suit: Suit): boolean {
  return suit === 'clubs' || suit === 'spades';
}
