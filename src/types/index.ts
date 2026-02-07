// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'J' | 'Q' | 'K' | 'A';
export type CardType = 'monster' | 'potion' | 'weapon';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
  type: CardType;
}

// Game State
export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  hp: number;
  maxHp: number;
  weapon: Card | null;
  lastMonsterSlain: number | null; // Value of last monster killed by current weapon
  deck: Card[];
  room: Card[];
  discard: Card[];
  roomCardsResolved: number;
  potionUsedThisTurn: boolean; // Can only use 1 potion per turn
  lastRoomAvoided: boolean; // Can't avoid two rooms in a row
  gameStatus: GameStatus;
  score: number;
  highScore: number;
  lastAction: string | null;
  isDailyChallenge: boolean;
  dailySeed: string | null;
}

// Actions
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'START_DAILY_CHALLENGE'; seed: string }
  | { type: 'DRAW_ROOM' }
  | { type: 'FIGHT_MONSTER'; card: Card; useWeapon: boolean }
  | { type: 'DRINK_POTION'; card: Card }
  | { type: 'EQUIP_WEAPON'; card: Card }
  | { type: 'AVOID_ROOM' }
  | { type: 'SET_HIGH_SCORE'; score: number };

// Leaderboard
export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  hp_remaining: number;
  created_at: string;
}

export interface DailyLeaderboardEntry extends LeaderboardEntry {
  challenge_date: string;
}

// Statistics
export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  totalWinScore: number;
  bestScore: number;
  longestWinStreak: number;
  currentWinStreak: number;
}

// UI State
export interface CardAction {
  type: 'fight' | 'fight_barehanded' | 'drink' | 'equip';
  label: string;
  disabled: boolean;
  reason?: string;
}
