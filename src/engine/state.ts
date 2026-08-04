import {
  createCoreItems,
  createHeroRelics,
  createLetterCard,
  createPenaltyPool,
  createWildCard,
} from "./cards.js";
import { createRng, shuffleInPlace } from "./rng.js";
import type {
  Card,
  EnemyState,
  HeroId,
  ItemInstance,
  RunState,
} from "./types.js";

const BASE_HAND_SIZE = 7;

/** Energy is a pure digital invention (spec 009 R9, no rulebook equivalent) and would
 * otherwise grow unbounded (+1/turn minimum, never reset at Cleanup); capped to keep the
 * resource meaningful instead of letting long fights snowball into unlimited item spam. */
export const MAX_ENERGY = 6;

function buildStarterDeck(heroId: HeroId): Card[] {
  const coreLetters =
    heroId === "duelist"
      ? ["s", "w", "o", "r", "d", "a", "r", "c", "i", "n"]
      : ["h", "e", "x", "g", "l", "y", "p", "h", "i", "n"];

  return coreLetters.map((letter, index) =>
    createLetterCard(
      `${heroId}-${index}-${letter}`,
      letter,
      "aeiou".includes(letter) ? 1 : 2,
      1,
    ),
  );
}

function initialEnemy(): EnemyState {
  return {
    id: "act1-boss-proxy",
    name: "The Ink Warden",
    stage: 1,
    hp: 28,
    maxHp: 28,
    block: 0,
    hex: 0,
    boon: 0,
    stunned: false,
    intentIndex: 0,
    intents: [
      { type: "attack", value: 3 },
      { type: "block", value: 2 },
      { type: "hex", value: 1 },
      { type: "charge", value: 5 },
    ],
    stage2: {
      hp: 18,
      intents: [
        { type: "attack", value: 5 },
        { type: "hex", value: 1 },
        { type: "attack", value: 2 },
        { type: "block", value: 3 },
      ],
    },
    weakVowel: "i",
  };
}

/** Pulls a Penalty card from the shared pool and adds it to the hero's discard pile (spec 009 R6). */
export function addPenaltyCardToDeck(state: RunState): void {
  const card = state.penaltyPool.pop();
  if (!card) {
    return;
  }

  state.deck.discard.push(card);
  state.actionLog.push({
    turn: state.turn,
    message: `A Penalty card (${card.letter.toUpperCase()}) is added to your deck.`,
  });
}

/** Returns a played Penalty card to the bottom of the shared pool (spec 009 R6). */
export function returnPenaltyCardToPool(state: RunState, card: Card): void {
  state.penaltyPool.unshift(card);
}

export function drawCards(state: RunState, amount: number): void {
  for (let i = 0; i < amount; i += 1) {
    if (state.deck.draw.length === 0) {
      if (state.deck.discard.length === 0) {
        break;
      }

      state.deck.draw = [...state.deck.discard];
      state.deck.discard = [];
      shuffleInPlace(state.deck.draw, createRng(state.seed + state.turn + i));
    }

    const card = state.deck.draw.pop();
    if (card) {
      state.deck.hand.push(card);
    }
  }
}

export function createInitialRunState(
  seed: number,
  heroId: HeroId,
  boon = 0,
): RunState {
  const rng = createRng(seed);
  const deck = buildStarterDeck(heroId);
  shuffleInPlace(deck, rng);

  const items: ItemInstance[] = createCoreItems(heroId).map((def) => ({
    def,
    usedThisTurn: false,
    spent: false,
  }));

  const relics: ItemInstance[] = createHeroRelics(heroId).map((def) => ({
    def,
    usedThisTurn: false,
    spent: false,
  }));

  const state: RunState = {
    seed,
    hero: {
      id: heroId,
      hp: 20,
      maxHp: 20,
      block: 0,
      energy: 3,
      hex: 0,
      boon,
    },
    enemy: initialEnemy(),
    deck: {
      draw: deck,
      hand: [],
      discard: [],
      fatigue: [],
    },
    phase: "prep",
    turn: 1,
    pendingWord: null,
    pendingWordCards: [],
    pendingItemHits: 0,
    wildCard: createWildCard(heroId),
    relics,
    penaltyPool: createPenaltyPool(),
    enemyVowelAvailable: true,
    items,
    actionLog: [],
    dictionaryMode: "strict",
  };

  drawCards(state, BASE_HAND_SIZE);

  state.actionLog.push({
    turn: state.turn,
    message: "Run started. Draw 7 cards.",
  });

  return state;
}
