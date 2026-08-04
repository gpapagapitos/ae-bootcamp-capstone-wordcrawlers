import { create } from 'zustand';
import { createInitialRunState } from '../../engine/state.js';
import { createLetterCard, upgradeCard } from '../../engine/cards.js';
import type { Card, HeroId, RunState } from '../../engine/types.js';
import { pickEvent } from '../content/events.js';
import type { EventBuff, EventChoice, EventDef } from '../content/events.js';

type ModalType = 'reward' | 'shop' | 'rest' | 'event' | null;

const STARTING_HP = 20;
export const REST_HEAL_AMOUNT = 8;

interface ProgressionState {
  heroId: HeroId;
  boon: number;
  heroHp: number;
  heroMaxHp: number;
  runDeck: Card[];
  activeModal: ModalType;
  rewardOptions: Card[];
  shopOffers: Card[];
  restCardOptions: Card[];
  eventDef: EventDef | null;
  eventResult: string | null;
  eventResultEffects: EventChoice | null;
  pendingBuff: EventBuff | null;
  initialized: boolean;
  initializeRunDeck: (heroId?: HeroId, seed?: number) => void;
  syncDeckFromEncounter: (run: RunState) => void;
  openRewardModal: (seed?: number) => void;
  openShopModal: (seed?: number) => void;
  openRestModal: (seed?: number) => void;
  openEventModal: (seed?: number) => void;
  pickReward: (cardId: string) => void;
  buyShopCard: (cardId: string, replaceCardId: string) => void;
  removeDeckCard: (cardId: string) => void;
  chooseRestHeal: () => void;
  chooseRestUpgrade: (cardId: string) => void;
  chooseRestCleanse: () => void;
  chooseEventOption: (choiceId: string) => void;
  consumePendingBuff: () => EventBuff | null;
  closeModal: () => void;
  resetProgression: (heroId?: HeroId, seed?: number) => void;
}

const LETTER_POOL = 'abcdefghijklmnopqrstuvwxyz'.split('');

/**
 * Per-hero Library pool (spec 009 R13): Shop/reward cards are drawn from the hero's own
 * pool, not a shared global one. Weighted ~70/30 consonant/vowel to match each hero's
 * starter deck ratio (duelist 7/10 consonant, arcanist 8/10) so reward/shop power stays
 * comparable across heroes instead of one hero drawing disproportionately more vowels
 * (value 1) or consonants (value 2).
 */
const LIBRARY_POOLS: Record<HeroId, string[]> = {
  duelist: ['s', 'w', 'r', 'd', 'c', 't', 'l', 'k', 'b', 'g', 'm', 'p', 'n', 'o', 'a', 'i', 'e', 'u'],
  arcanist: ['h', 'x', 'g', 'l', 'p', 'y', 'n', 'c', 't', 'k', 'b', 'd', 'm', 'f', 'e', 'i', 'a', 'o']
};

function libraryPoolFor(heroId: HeroId): string[] {
  return LIBRARY_POOLS[heroId] ?? LETTER_POOL;
}

function cardValue(letter: string): number {
  return 'aeiou'.includes(letter) ? 1 : 2;
}

function createCard(letter: string, rarity: 1 | 2 | 3, source: string, index: number): Card {
  return createLetterCard(`${source}-${index}-${letter}-${Date.now()}`, letter, cardValue(letter), rarity);
}

function rotateIndex(seed: number, offset: number, size: number): number {
  return Math.abs((seed * 31 + offset * 17) % size);
}

function buildRewardOptions(seed: number, heroId: HeroId): Card[] {
  const pool = libraryPoolFor(heroId);
  return Array.from({ length: 3 }, (_, index) => {
    const letter = pool[rotateIndex(seed, index, pool.length)];
    const rarity = (index === 2 ? 2 : 1) as 1 | 2 | 3;
    return createCard(letter, rarity, 'reward', index);
  });
}

function buildShopOffers(seed: number, heroId: HeroId): Card[] {
  const pool = libraryPoolFor(heroId);
  return Array.from({ length: 4 }, (_, index) => {
    const letter = pool[rotateIndex(seed + 77, index, pool.length)];
    const rarity = (index > 1 ? 2 : 1) as 1 | 2 | 3;
    return createCard(letter, rarity, 'shop', index);
  });
}

function encounterDeckToRunDeck(run: RunState): Card[] {
  return [
    ...run.deck.draw,
    ...run.deck.hand,
    ...run.deck.discard,
    ...run.deck.fatigue
  ];
}

const CURSE_LETTERS = ['q', 'z', 'x', 'j', 'v', 'w', 'k'];

/** Event-only curse card: mirrors engine Penalty cards but with a collision-free id. */
function createCursedCard(index: number): Card {
  const letter = CURSE_LETTERS[index % CURSE_LETTERS.length];
  return {
    id: `event-curse-${index}-${Date.now()}`,
    letter,
    value: 0,
    rarity: 1,
    tags: [],
    kind: 'penalty',
    left: { hits: 0, blocks: 0, energy: 0 },
    right: { hits: 0, blocks: 0, energy: 0 }
  };
}

function priceForCard(card: Card): number {
  if (card.rarity === 1) {
    return 4;
  }
  if (card.rarity === 2) {
    return 7;
  }
  return 11;
}

const REMOVE_CARD_PRICE = 5;
const STARTING_BOON = 12;

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  heroId: 'duelist',
  boon: STARTING_BOON,
  heroHp: STARTING_HP,
  heroMaxHp: STARTING_HP,
  runDeck: [],
  activeModal: null,
  rewardOptions: [],
  shopOffers: [],
  restCardOptions: [],
  eventDef: null,
  eventResult: null,
  eventResultEffects: null,
  pendingBuff: null,
  initialized: false,

  initializeRunDeck: (heroId = 'duelist', seed = 20260731) => {
    if (get().initialized) {
      return;
    }

    const run = createInitialRunState(seed, heroId);
    set({
      heroId,
      boon: STARTING_BOON,
      heroHp: run.hero.maxHp,
      heroMaxHp: run.hero.maxHp,
      runDeck: encounterDeckToRunDeck(run),
      initialized: true,
      activeModal: null,
      rewardOptions: [],
      shopOffers: []
    });
  },

  syncDeckFromEncounter: (run) => {
    set({
      runDeck: encounterDeckToRunDeck(run),
      boon: run.hero.boon,
      heroHp: run.hero.hp,
      heroMaxHp: run.hero.maxHp
    });
  },

  openRewardModal: (seed = Date.now()) => {
    set({
      activeModal: 'reward',
      rewardOptions: buildRewardOptions(seed, get().heroId)
    });
  },

  openShopModal: (seed = Date.now()) => {
    set({
      activeModal: 'shop',
      shopOffers: buildShopOffers(seed, get().heroId)
    });
  },

  openRestModal: (seed = Date.now()) => {
    const state = get();
    const upgradable = state.runDeck.filter((card) => card.kind === 'letter' && !card.tags.includes('upgraded'));
    const pool = upgradable.length > 0 ? upgradable : state.runDeck;
    const options = Array.from({ length: Math.min(3, pool.length) }, (_, index) => {
      const pickIndex = rotateIndex(seed, index, pool.length);
      return pool[pickIndex];
    });

    set({
      activeModal: 'rest',
      restCardOptions: options
    });
  },

  openEventModal: (seed = Date.now()) => {
    set({
      activeModal: 'event',
      eventDef: pickEvent(seed),
      eventResult: null,
      eventResultEffects: null
    });
  },

  pickReward: (cardId) => {
    const state = get();
    const card = state.rewardOptions.find((item) => item.id === cardId);
    if (!card) {
      return;
    }

    set({
      runDeck: [...state.runDeck, card],
      rewardOptions: [],
      activeModal: null
    });
  },

  buyShopCard: (cardId, replaceCardId) => {
    const state = get();
    const card = state.shopOffers.find((item) => item.id === cardId);
    if (!card) {
      return;
    }

    const price = priceForCard(card);
    if (state.boon < price) {
      return;
    }

    const replaceIndex = state.runDeck.findIndex((item) => item.id === replaceCardId);
    if (replaceIndex === -1 || state.runDeck[replaceIndex].kind === 'penalty') {
      return;
    }

    const runDeck = [...state.runDeck];
    runDeck[replaceIndex] = card;

    set({
      boon: state.boon - price,
      runDeck,
      shopOffers: state.shopOffers.filter((item) => item.id !== cardId)
    });
  },

  removeDeckCard: (cardId) => {
    const state = get();
    if (state.boon < REMOVE_CARD_PRICE) {
      return;
    }

    const target = state.runDeck.find((card) => card.id === cardId);
    if (!target || target.kind === 'penalty') {
      return;
    }

    set({
      boon: state.boon - REMOVE_CARD_PRICE,
      runDeck: state.runDeck.filter((card) => card.id !== cardId)
    });
  },

  chooseRestHeal: () => {
    const state = get();
    set({
      heroHp: Math.min(state.heroMaxHp, state.heroHp + REST_HEAL_AMOUNT),
      activeModal: null,
      restCardOptions: []
    });
  },

  chooseRestUpgrade: (cardId) => {
    const state = get();
    set({
      runDeck: state.runDeck.map((card) => (card.id === cardId ? upgradeCard(card) : card)),
      activeModal: null,
      restCardOptions: []
    });
  },

  chooseRestCleanse: () => {
    const state = get();
    const index = state.runDeck.findIndex((card) => card.kind === 'penalty');
    if (index === -1) {
      return;
    }

    set({
      runDeck: [...state.runDeck.slice(0, index), ...state.runDeck.slice(index + 1)],
      activeModal: null,
      restCardOptions: []
    });
  },

  chooseEventOption: (choiceId) => {
    const state = get();
    const choice = state.eventDef?.choices.find((item) => item.id === choiceId);
    if (!choice) {
      return;
    }

    let runDeck = state.runDeck;
    if (choice.cardEffect === 'addCard') {
      const pool = libraryPoolFor(state.heroId);
      const letter = pool[rotateIndex(Date.now(), runDeck.length, pool.length)];
      runDeck = [...runDeck, createCard(letter, 1, 'event', runDeck.length)];
    } else if (choice.cardEffect === 'removeCard' && runDeck.length > 5) {
      const index = rotateIndex(Date.now(), runDeck.length, runDeck.length);
      runDeck = runDeck.filter((_, i) => i !== index);
    } else if (choice.cardEffect === 'upgradeCard') {
      const eligible = runDeck.filter((card) => card.kind === 'letter' && !card.tags.includes('upgraded'));
      if (eligible.length > 0) {
        const target = eligible[rotateIndex(Date.now(), 0, eligible.length)];
        runDeck = runDeck.map((card) => (card.id === target.id ? upgradeCard(card) : card));
      }
    } else if (choice.cardEffect === 'curseCard') {
      runDeck = [...runDeck, createCursedCard(runDeck.length)];
    }

    set({
      heroHp: Math.max(0, Math.min(state.heroMaxHp, state.heroHp + (choice.deltaHp ?? 0))),
      boon: Math.max(0, state.boon + (choice.deltaBoon ?? 0)),
      runDeck,
      pendingBuff: choice.buff ?? state.pendingBuff,
      eventResult: choice.outcomeText,
      eventResultEffects: choice
    });
  },

  consumePendingBuff: () => {
    const buff = get().pendingBuff;
    if (buff) {
      set({ pendingBuff: null });
    }
    return buff;
  },

  closeModal: () => {
    set({
      activeModal: null,
      rewardOptions: [],
      shopOffers: [],
      restCardOptions: [],
      eventDef: null,
      eventResult: null,
      eventResultEffects: null
    });
  },

  resetProgression: (heroId = 'duelist', seed = Date.now()) => {
    const run = createInitialRunState(seed, heroId);
    set({
      heroId,
      boon: STARTING_BOON,
      heroHp: run.hero.maxHp,
      heroMaxHp: run.hero.maxHp,
      runDeck: encounterDeckToRunDeck(run),
      activeModal: null,
      rewardOptions: [],
      shopOffers: [],
      restCardOptions: [],
      eventDef: null,
      eventResult: null,
      eventResultEffects: null,
      pendingBuff: null,
      initialized: true
    });
  }
}));

export function getCardDisplayName(card: Card): string {
  return `${card.letter.toUpperCase()} Sigil`;
}

export function getCardPrice(card: Card): number {
  return priceForCard(card);
}
