import type { Card } from '../types';
import { MAX_HP, ROOM_SIZE } from './constants';

/**
 * Calculates damage when fighting a monster with a weapon
 * Damage = Monster value - Weapon value (minimum 0)
 */
export function calculateWeaponDamage(monsterValue: number, weaponValue: number): number {
  return Math.max(0, monsterValue - weaponValue);
}

/**
 * Checks if a weapon can be used against a monster
 * Weapon can only kill monsters with value <= last monster slain by this weapon
 */
export function canUseWeapon(
  monsterValue: number,
  lastMonsterSlain: number | null
): boolean {
  // If weapon hasn't been used yet, it can fight any monster
  if (lastMonsterSlain === null) {
    return true;
  }
  // Can only fight monsters with value <= last monster slain
  return monsterValue <= lastMonsterSlain;
}

/**
 * Calculates healing from a potion (capped at max HP)
 */
export function calculateHealing(currentHp: number, potionValue: number): number {
  return Math.min(currentHp + potionValue, MAX_HP);
}

/**
 * Calculates the final score according to official rules:
 * - If dead: subtract remaining monster values from HP (negative score)
 * - If won: score = remaining HP
 * - If won with full HP and last card was potion: score = HP + potion value
 */
export function calculateScore(
  hp: number,
  won: boolean,
  remainingDeck: Card[],
  lastCardWasPotion: boolean,
  lastPotionValue: number
): number {
  if (!won) {
    // Sum up all remaining monster values in the deck
    const remainingMonsterDamage = remainingDeck
      .filter(card => card.type === 'monster')
      .reduce((sum, card) => sum + card.value, 0);
    return hp - remainingMonsterDamage; // Will be negative
  }

  // Won the game
  if (hp === MAX_HP && lastCardWasPotion) {
    return hp + lastPotionValue;
  }
  return hp;
}

/**
 * Checks if the player can proceed to the next room
 * Must resolve 3 of 4 cards (leave 1 for next room)
 */
export function canProceedToNextRoom(_roomCardsResolved: number, roomSize: number): boolean {
  // Turn is complete when only 1 card remains
  return roomSize <= 1;
}

/**
 * Checks if the player can avoid the current room
 * Cannot avoid if last room was avoided, and must be a full room (4 cards)
 */
export function canAvoidRoom(lastRoomAvoided: boolean, roomSize: number): boolean {
  return !lastRoomAvoided && roomSize === ROOM_SIZE;
}

/**
 * Checks if the player can drink a potion
 * Must have HP < 20 and not have used a potion this turn
 */
export function canDrinkPotion(currentHp: number, potionUsedThisTurn: boolean): boolean {
  return currentHp < MAX_HP && !potionUsedThisTurn;
}

/**
 * Checks if the game is over (win or lose)
 */
export function checkGameOver(hp: number, deckSize: number, roomSize: number): 'won' | 'lost' | null {
  if (hp <= 0) {
    return 'lost';
  }
  // Win when deck is empty and room is empty
  if (deckSize === 0 && roomSize === 0) {
    return 'won';
  }
  return null;
}

/**
 * Gets the number of cards to draw for the room
 */
export function getCardsToDrawCount(currentRoomSize: number): number {
  return Math.max(0, ROOM_SIZE - currentRoomSize);
}
