import type { Suit, Rank } from '../types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];

export const MAX_HP = 20;
export const STARTING_HP = 20;
export const ROOM_SIZE = 4;
export const CARDS_TO_RESOLVE = 3; // Must resolve 3 of 4 cards, leave 1 for next room

export const RANK_VALUES: Record<Rank, number> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Updated colors for Dark Dungeon theme
export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#ff6b6b',      // Potion red
  diamonds: '#ffd700',    // Weapon gold
  clubs: '#a0a0a0',       // Monster grey
  spades: '#c0c0c0',      // Monster silver
};

export const HIGH_SCORE_KEY = 'scoundrel_high_score';

// Monster names by suit and rank - Dark Dungeon theme
export const MONSTER_NAMES: Record<Suit, Partial<Record<Rank, string>>> = {
  spades: {
    'A': 'Death Knight',
    'K': 'Lich King',
    'Q': 'Banshee Queen',
    'J': 'Vampire Lord',
    10: 'Wraith',
    9: 'Skeleton Champion',
    8: 'Ghoul',
    7: 'Shadow Demon',
    6: 'Zombie Knight',
    5: 'Imp',
    4: 'Skeleton Archer',
    3: 'Ghost',
    2: 'Rat Swarm',
  },
  clubs: {
    'A': 'Dragon',
    'K': 'Demon Lord',
    'Q': 'Medusa',
    'J': 'Minotaur',
    10: 'Troll',
    9: 'Ogre',
    8: 'Werewolf',
    7: 'Basilisk',
    6: 'Harpy',
    5: 'Goblin Chief',
    4: 'Giant Spider',
    3: 'Kobold',
    2: 'Giant Bat',
  },
  hearts: {},
  diamonds: {},
};

// Weapon names by rank - Dark Dungeon theme
export const WEAPON_NAMES: Partial<Record<Rank, string>> = {
  10: 'Legendary Blade',
  9: 'Battle Axe',
  8: 'Warhammer',
  7: 'Longsword',
  6: 'Mace',
  5: 'Short Sword',
  4: 'Dagger',
  3: 'Rusty Sword',
  2: 'Broken Blade',
};

// Potion names by rank - Dark Dungeon theme
export const POTION_NAMES: Partial<Record<Rank, string>> = {
  10: 'Grand Elixir',
  9: 'Greater Healing',
  8: 'Healing Draught',
  7: 'Vitality Potion',
  6: 'Health Tonic',
  5: 'Minor Healing',
  4: 'Healing Salve',
  3: 'Weak Potion',
  2: 'Bandages',
};

// Card type icons - Unicode symbols for consistent cross-platform rendering
export const TYPE_ICONS = {
  monster: '☠',
  potion: '⚗',
  weapon: '⚔',
};

// Sound effect URLs (will be loaded from public/audio)
export const SOUND_EFFECTS = {
  cardFlip: '/audio/card-flip.mp3',
  damage: '/audio/damage.mp3',
  heal: '/audio/heal.mp3',
  equipWeapon: '/audio/equip.mp3',
  victory: '/audio/victory.mp3',
  defeat: '/audio/defeat.mp3',
  buttonClick: '/audio/click.mp3',
  monsterKill: '/audio/monster-kill.mp3',
};
