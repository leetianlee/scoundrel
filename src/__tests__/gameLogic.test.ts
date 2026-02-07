import { describe, it, expect } from 'vitest';
import {
  calculateWeaponDamage,
  canUseWeapon,
  calculateHealing,
  calculateScore,
  canProceedToNextRoom,
  canAvoidRoom,
  canDrinkPotion,
  checkGameOver,
  getCardsToDrawCount,
} from '../utils/gameLogic';
import { createDeck } from '../utils/cardUtils';

describe('calculateWeaponDamage', () => {
  it('returns monster - weapon when monster is stronger', () => {
    expect(calculateWeaponDamage(10, 7)).toBe(3);
  });

  it('returns 0 when weapon is equal to monster', () => {
    expect(calculateWeaponDamage(5, 5)).toBe(0);
  });

  it('returns 0 when weapon is stronger than monster', () => {
    expect(calculateWeaponDamage(3, 8)).toBe(0);
  });

  it('handles ace monster (14) vs low weapon', () => {
    expect(calculateWeaponDamage(14, 2)).toBe(12);
  });
});

describe('canUseWeapon', () => {
  it('allows any monster when weapon is fresh (null)', () => {
    expect(canUseWeapon(14, null)).toBe(true);
  });

  it('allows weaker monster after killing stronger', () => {
    expect(canUseWeapon(5, 10)).toBe(true);
  });

  it('allows equal monster', () => {
    expect(canUseWeapon(7, 7)).toBe(true);
  });

  it('disallows stronger monster after killing weaker', () => {
    expect(canUseWeapon(10, 5)).toBe(false);
  });
});

describe('calculateHealing', () => {
  it('heals normally when below max', () => {
    expect(calculateHealing(10, 5)).toBe(15);
  });

  it('caps at 20 HP', () => {
    expect(calculateHealing(18, 5)).toBe(20);
  });

  it('returns 20 when already full', () => {
    expect(calculateHealing(20, 5)).toBe(20);
  });
});

describe('calculateScore', () => {
  it('returns HP when winning', () => {
    expect(calculateScore(15, true, [], false, 0)).toBe(15);
  });

  it('adds potion bonus when winning at full HP with last potion', () => {
    expect(calculateScore(20, true, [], true, 8)).toBe(28);
  });

  it('returns just HP when winning at full HP without last potion', () => {
    expect(calculateScore(20, true, [], false, 0)).toBe(20);
  });

  it('returns negative score on loss (HP - remaining monsters)', () => {
    const monsters = [
      { id: 'spades-A', suit: 'spades' as const, rank: 'A' as const, value: 14, type: 'monster' as const },
      { id: 'clubs-K', suit: 'clubs' as const, rank: 'K' as const, value: 13, type: 'monster' as const },
    ];
    expect(calculateScore(0, false, monsters, false, 0)).toBe(-27);
  });

  it('ignores non-monster cards when calculating loss score', () => {
    const mixed = [
      { id: 'spades-5', suit: 'spades' as const, rank: 5 as const, value: 5, type: 'monster' as const },
      { id: 'hearts-8', suit: 'hearts' as const, rank: 8 as const, value: 8, type: 'potion' as const },
    ];
    expect(calculateScore(3, false, mixed, false, 0)).toBe(-2);
  });
});

describe('canProceedToNextRoom', () => {
  it('allows when 1 card remains', () => {
    expect(canProceedToNextRoom(3, 1)).toBe(true);
  });

  it('allows when 0 cards remain', () => {
    expect(canProceedToNextRoom(4, 0)).toBe(true);
  });

  it('disallows when 2+ cards remain', () => {
    expect(canProceedToNextRoom(1, 3)).toBe(false);
  });
});

describe('canAvoidRoom', () => {
  it('allows when room is full and last was not avoided', () => {
    expect(canAvoidRoom(false, 4)).toBe(true);
  });

  it('disallows when last room was avoided', () => {
    expect(canAvoidRoom(true, 4)).toBe(false);
  });

  it('disallows when room is not full', () => {
    expect(canAvoidRoom(false, 3)).toBe(false);
  });
});

describe('canDrinkPotion', () => {
  it('allows when HP < 20 and no potion used', () => {
    expect(canDrinkPotion(15, false)).toBe(true);
  });

  it('disallows when HP is full', () => {
    expect(canDrinkPotion(20, false)).toBe(false);
  });

  it('disallows when potion already used this turn', () => {
    expect(canDrinkPotion(10, true)).toBe(false);
  });
});

describe('checkGameOver', () => {
  it('returns lost when HP is 0', () => {
    expect(checkGameOver(0, 10, 4)).toBe('lost');
  });

  it('returns won when deck and room are empty', () => {
    expect(checkGameOver(15, 0, 0)).toBe('won');
  });

  it('returns null when still playing', () => {
    expect(checkGameOver(10, 20, 4)).toBe(null);
  });
});

describe('getCardsToDrawCount', () => {
  it('draws 4 for empty room', () => {
    expect(getCardsToDrawCount(0)).toBe(4);
  });

  it('draws 3 for 1-card room', () => {
    expect(getCardsToDrawCount(1)).toBe(3);
  });

  it('draws 0 for full room', () => {
    expect(getCardsToDrawCount(4)).toBe(0);
  });
});

describe('createDeck', () => {
  it('creates exactly 44 cards', () => {
    expect(createDeck()).toHaveLength(44);
  });

  it('has 26 monsters', () => {
    const deck = createDeck();
    expect(deck.filter(c => c.type === 'monster')).toHaveLength(26);
  });

  it('has 9 weapons', () => {
    const deck = createDeck();
    expect(deck.filter(c => c.type === 'weapon')).toHaveLength(9);
  });

  it('has 9 potions', () => {
    const deck = createDeck();
    expect(deck.filter(c => c.type === 'potion')).toHaveLength(9);
  });

  it('contains no red face cards or red aces', () => {
    const deck = createDeck();
    const redFaceCards = deck.filter(c =>
      (c.suit === 'hearts' || c.suit === 'diamonds') &&
      (c.rank === 'J' || c.rank === 'Q' || c.rank === 'K' || c.rank === 'A')
    );
    expect(redFaceCards).toHaveLength(0);
  });
});
