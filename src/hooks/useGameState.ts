import { useReducer, useEffect } from 'react';
import type { GameState, GameAction, Card } from '../types';
import { createShuffledDeck, createShuffledDeckSeeded } from '../utils/cardUtils';
import {
  calculateWeaponDamage,
  calculateHealing,
  calculateScore,
  canProceedToNextRoom,
  getCardsToDrawCount,
  checkGameOver,
} from '../utils/gameLogic';
import { STARTING_HP, MAX_HP, HIGH_SCORE_KEY, ROOM_SIZE } from '../utils/constants';

// Track last potion for scoring bonus
let lastPotionValue = 0;
let lastCardWasPotion = false;

function getInitialState(): GameState {
  const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
  return {
    hp: STARTING_HP,
    maxHp: MAX_HP,
    weapon: null,
    lastMonsterSlain: null,
    deck: [],
    room: [],
    discard: [],
    roomCardsResolved: 0,
    potionUsedThisTurn: false,
    lastRoomAvoided: false,
    gameStatus: 'playing',
    score: 0,
    highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
    lastAction: null,
    isDailyChallenge: false,
    dailySeed: null,
  };
}

function removeCardFromRoom(room: Card[], cardId: string): Card[] {
  return room.filter((c) => c.id !== cardId);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const deck = createShuffledDeck();
      const room = deck.slice(0, ROOM_SIZE);
      const remainingDeck = deck.slice(ROOM_SIZE);

      // Reset potion tracking
      lastPotionValue = 0;
      lastCardWasPotion = false;

      return {
        ...getInitialState(),
        deck: remainingDeck,
        room,
        highScore: state.highScore,
        lastAction: 'Game started! Face 3 of 4 cards in each room...',
      };
    }

    case 'START_DAILY_CHALLENGE': {
      const { seed } = action;
      const deck = createShuffledDeckSeeded(seed);
      const room = deck.slice(0, ROOM_SIZE);
      const remainingDeck = deck.slice(ROOM_SIZE);

      // Reset potion tracking
      lastPotionValue = 0;
      lastCardWasPotion = false;

      return {
        ...getInitialState(),
        deck: remainingDeck,
        room,
        highScore: state.highScore,
        isDailyChallenge: true,
        dailySeed: seed,
        lastAction: `Daily Challenge started! (${seed})`,
      };
    }

    case 'DRAW_ROOM': {
      if (!canProceedToNextRoom(state.roomCardsResolved, state.room.length)) {
        return state;
      }

      const cardsToDraw = getCardsToDrawCount(state.room.length);
      const newCards = state.deck.slice(0, cardsToDraw);
      const remainingDeck = state.deck.slice(cardsToDraw);
      const newRoom = [...state.room, ...newCards];

      // Check for win condition
      const gameOver = checkGameOver(state.hp, remainingDeck.length, newRoom.length);

      if (gameOver === 'won') {
        const finalScore = calculateScore(state.hp, true, [], lastCardWasPotion, lastPotionValue);
        return {
          ...state,
          deck: remainingDeck,
          room: newRoom,
          roomCardsResolved: 0,
          potionUsedThisTurn: false,
          lastRoomAvoided: false,
          gameStatus: 'won',
          score: finalScore,
          highScore: Math.max(state.highScore, finalScore),
          lastAction: 'Victory! You conquered the dungeon!',
        };
      }

      return {
        ...state,
        deck: remainingDeck,
        room: newRoom,
        roomCardsResolved: 0,
        potionUsedThisTurn: false,
        lastRoomAvoided: false,
        lastAction: newCards.length > 0
          ? `Entered new room with ${newCards.length} new card${newCards.length > 1 ? 's' : ''}...`
          : 'Continue with remaining card...',
      };
    }

    case 'FIGHT_MONSTER': {
      const { card, useWeapon } = action;
      let damage: number;
      let newLastMonsterSlain = state.lastMonsterSlain;
      let weaponAction = '';

      // Track that last card was not a potion
      lastCardWasPotion = false;

      if (useWeapon && state.weapon) {
        // Fight with weapon
        damage = calculateWeaponDamage(card.value, state.weapon.value);
        newLastMonsterSlain = card.value; // Track this monster as last slain
        weaponAction = damage > 0
          ? ` Weapon dealt ${state.weapon.value} damage.`
          : ` Weapon blocked all damage!`;
      } else {
        // Fight barehanded - take full damage
        damage = card.value;
      }

      const newHp = Math.max(0, state.hp - damage);
      const newRoom = removeCardFromRoom(state.room, card.id);

      // Check for game over
      const gameOver = checkGameOver(newHp, state.deck.length, newRoom.length);

      if (gameOver === 'lost') {
        const finalScore = calculateScore(0, false, [...state.deck, ...newRoom], false, 0);
        return {
          ...state,
          hp: 0,
          lastMonsterSlain: newLastMonsterSlain,
          room: newRoom,
          discard: [...state.discard, card],
          roomCardsResolved: state.roomCardsResolved + 1,
          gameStatus: 'lost',
          score: finalScore,
          lastAction: `Defeated by the ${card.value}-power monster!`,
        };
      }

      if (gameOver === 'won') {
        const finalScore = calculateScore(newHp, true, [], false, 0);
        return {
          ...state,
          hp: newHp,
          lastMonsterSlain: newLastMonsterSlain,
          room: newRoom,
          discard: [...state.discard, card],
          roomCardsResolved: state.roomCardsResolved + 1,
          gameStatus: 'won',
          score: finalScore,
          highScore: Math.max(state.highScore, finalScore),
          lastAction: 'Victory! You conquered the dungeon!',
        };
      }

      const damageText = damage > 0 ? `Took ${damage} damage!` : 'No damage taken!';
      const methodText = useWeapon && state.weapon ? '' : ' (barehanded)';
      return {
        ...state,
        hp: newHp,
        lastMonsterSlain: useWeapon && state.weapon ? newLastMonsterSlain : state.lastMonsterSlain,
        room: newRoom,
        discard: [...state.discard, card],
        roomCardsResolved: state.roomCardsResolved + 1,
        lastAction: `Fought ${card.value} monster${methodText}. ${damageText}${weaponAction}`,
      };
    }

    case 'DRINK_POTION': {
      const { card } = action;

      // Check if already used potion this turn
      if (state.potionUsedThisTurn) {
        // Second potion is discarded with no effect
        const newRoom = removeCardFromRoom(state.room, card.id);

        // Check for win
        const gameOver = checkGameOver(state.hp, state.deck.length, newRoom.length);

        if (gameOver === 'won') {
          const finalScore = calculateScore(state.hp, true, [], false, 0);
          return {
            ...state,
            room: newRoom,
            discard: [...state.discard, card],
            roomCardsResolved: state.roomCardsResolved + 1,
            gameStatus: 'won',
            score: finalScore,
            highScore: Math.max(state.highScore, finalScore),
            lastAction: 'Victory! You conquered the dungeon!',
          };
        }

        return {
          ...state,
          room: newRoom,
          discard: [...state.discard, card],
          roomCardsResolved: state.roomCardsResolved + 1,
          lastAction: `Potion discarded (already used one this turn).`,
        };
      }

      const newHp = calculateHealing(state.hp, card.value);
      const healed = newHp - state.hp;
      const newRoom = removeCardFromRoom(state.room, card.id);

      // Track for scoring bonus
      lastCardWasPotion = true;
      lastPotionValue = card.value;

      // Check for win
      const gameOver = checkGameOver(newHp, state.deck.length, newRoom.length);

      if (gameOver === 'won') {
        const finalScore = calculateScore(newHp, true, [], true, card.value);
        return {
          ...state,
          hp: newHp,
          room: newRoom,
          discard: [...state.discard, card],
          roomCardsResolved: state.roomCardsResolved + 1,
          potionUsedThisTurn: true,
          gameStatus: 'won',
          score: finalScore,
          highScore: Math.max(state.highScore, finalScore),
          lastAction: 'Victory! You conquered the dungeon!',
        };
      }

      return {
        ...state,
        hp: newHp,
        room: newRoom,
        discard: [...state.discard, card],
        roomCardsResolved: state.roomCardsResolved + 1,
        potionUsedThisTurn: true,
        lastAction: healed > 0 ? `Drank potion. Healed ${healed} HP!` : `Drank potion. Already at max HP!`,
      };
    }

    case 'EQUIP_WEAPON': {
      const { card } = action;
      const oldWeapon = state.weapon;
      const newRoom = removeCardFromRoom(state.room, card.id);

      // Track that last card was not a potion
      lastCardWasPotion = false;

      // Discard old weapon and any monsters on it (we track this conceptually)
      // In the physical game, monsters are stacked on the weapon
      // For simplicity, we just discard the old weapon
      const newDiscard = oldWeapon
        ? [...state.discard, oldWeapon]
        : [...state.discard];

      // Check for win
      const gameOver = checkGameOver(state.hp, state.deck.length, newRoom.length);

      if (gameOver === 'won') {
        const finalScore = calculateScore(state.hp, true, [], false, 0);
        return {
          ...state,
          weapon: card,
          lastMonsterSlain: null, // Reset - new weapon hasn't killed anything yet
          room: newRoom,
          discard: newDiscard,
          roomCardsResolved: state.roomCardsResolved + 1,
          gameStatus: 'won',
          score: finalScore,
          highScore: Math.max(state.highScore, finalScore),
          lastAction: 'Victory! You conquered the dungeon!',
        };
      }

      return {
        ...state,
        weapon: card,
        lastMonsterSlain: null, // Reset - new weapon hasn't killed anything yet
        room: newRoom,
        discard: newDiscard,
        roomCardsResolved: state.roomCardsResolved + 1,
        lastAction: `Equipped ${card.rank}♦ (${card.value} ATK)!${oldWeapon ? ' Old weapon discarded.' : ''}`,
      };
    }

    case 'AVOID_ROOM': {
      // Can only avoid if last room wasn't avoided and room is full
      if (state.lastRoomAvoided || state.room.length !== ROOM_SIZE) {
        return state;
      }

      // Put all 4 cards at the bottom of the deck
      const newDeck = [...state.deck, ...state.room];

      // Draw a new room
      const newRoom = newDeck.slice(0, ROOM_SIZE);
      const remainingDeck = newDeck.slice(ROOM_SIZE);

      // Track that last card was not a potion
      lastCardWasPotion = false;

      return {
        ...state,
        deck: remainingDeck,
        room: newRoom,
        roomCardsResolved: 0,
        potionUsedThisTurn: false,
        lastRoomAvoided: true,
        lastAction: 'Avoided the room! Cards moved to bottom of dungeon.',
      };
    }

    case 'SET_HIGH_SCORE': {
      return {
        ...state,
        highScore: action.score,
      };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, getInitialState());

  // Save high score to localStorage
  useEffect(() => {
    if (state.highScore > 0) {
      localStorage.setItem(HIGH_SCORE_KEY, state.highScore.toString());
    }
  }, [state.highScore]);

  // Auto-start game on mount
  useEffect(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const startGame = () => dispatch({ type: 'START_GAME' });
  const startDailyChallenge = (seed: string) => dispatch({ type: 'START_DAILY_CHALLENGE', seed });
  const drawRoom = () => dispatch({ type: 'DRAW_ROOM' });
  const fightMonster = (card: Card, useWeapon: boolean) =>
    dispatch({ type: 'FIGHT_MONSTER', card, useWeapon });
  const drinkPotion = (card: Card) => dispatch({ type: 'DRINK_POTION', card });
  const equipWeapon = (card: Card) => dispatch({ type: 'EQUIP_WEAPON', card });
  const avoidRoom = () => dispatch({ type: 'AVOID_ROOM' });

  return {
    state,
    actions: {
      startGame,
      startDailyChallenge,
      drawRoom,
      fightMonster,
      drinkPotion,
      equipWeapon,
      avoidRoom,
    },
  };
}
