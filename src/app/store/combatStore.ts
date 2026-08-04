import { create } from 'zustand';
import { passTurn, runPrepPhase, submitComposedCards, useItem as engineUseItem } from '../../engine/turn.js';
import { createInitialRunState } from '../../engine/state.js';
import { createRng, shuffleInPlace } from '../../engine/rng.js';
import type { Card } from '../../engine/types.js';
import type { HeroId, RunState, SplayDirection } from '../../engine/types.js';
import type { EventBuff } from '../content/events.js';

export const WILD_CARD_ID = 'WILD';
export const ENEMY_VOWEL_CARD_ID = 'ENEMY_VOWEL';

interface CombatState {
  encounterNodeId: string | null;
  run: RunState | null;
  heroId: HeroId;
  composedCardIds: string[];
  splay: SplayDirection;
  wildLetter: string;
  lastError: string | null;
  startEncounter: (
    nodeId: string,
    seed?: number,
    runDeck?: Card[],
    heroId?: HeroId,
    boon?: number,
    heroHp?: number,
    heroMaxHp?: number,
    pendingBuff?: EventBuff | null
  ) => void;
  leaveEncounter: () => void;
  beginSpellPhase: () => void;
  toggleComposedCard: (cardId: string) => void;
  setWildLetter: (letter: string) => void;
  toggleWildCard: () => void;
  toggleEnemyVowelCard: () => void;
  useItem: (itemId: string) => void;
  undoComposedLetter: () => void;
  clearComposedWord: () => void;
  setSplay: (splay: SplayDirection) => void;
  submitComposedWord: () => void;
  passCurrentTurn: () => void;
  clearError: () => void;
  setError: (message: string) => void;
}

const DEFAULT_HERO: HeroId = 'duelist';

function cloneCard(card: Card): Card {
  return {
    ...card,
    tags: [...card.tags]
  };
}

function createEncounterState(
  seed: number,
  heroId: HeroId,
  runDeck?: Card[],
  boon = 0,
  heroHp?: number,
  heroMaxHp?: number,
  pendingBuff?: EventBuff | null
): RunState {
  const run = createInitialRunState(seed, heroId, boon);
  if (heroMaxHp !== undefined) {
    run.hero.maxHp = heroMaxHp;
  }
  if (heroHp !== undefined) {
    run.hero.hp = Math.max(0, Math.min(heroHp, run.hero.maxHp));
  }

  if (pendingBuff) {
    if (pendingBuff.type === 'heroBonusEnergy') {
      run.hero.energy += pendingBuff.value;
    } else if (pendingBuff.type === 'heroBonusBlock') {
      run.hero.block += pendingBuff.value;
    } else if (pendingBuff.type === 'enemyHex') {
      run.enemy.hex += pendingBuff.value;
    }
  }

  if (!runDeck || runDeck.length === 0) {
    return run;
  }

  const draw = runDeck.map(cloneCard);
  shuffleInPlace(draw, createRng(seed));

  run.deck.draw = draw;
  run.deck.hand = [];
  run.deck.discard = [];
  run.deck.fatigue = [];

  for (let index = 0; index < 7; index += 1) {
    const card = run.deck.draw.pop();
    if (!card) {
      break;
    }
    run.deck.hand.push(card);
  }

  run.actionLog = [{ turn: run.turn, message: 'Run started. Draw 7 cards.' }];
  return run;
}

export const useCombatStore = create<CombatState>((set, get) => ({
  encounterNodeId: null,
  run: null,
  heroId: DEFAULT_HERO,
  composedCardIds: [],
  splay: 'right',
  wildLetter: '',
  lastError: null,

  startEncounter: (nodeId: string, seed = Date.now(), runDeck, heroId, boon = 0, heroHp, heroMaxHp, pendingBuff) => {
    const resolvedHeroId = heroId ?? get().heroId;
    set({
      encounterNodeId: nodeId,
      run: createEncounterState(seed, resolvedHeroId, runDeck, boon, heroHp, heroMaxHp, pendingBuff),
      heroId: resolvedHeroId,
      composedCardIds: [],
      splay: 'right',
      wildLetter: '',
      lastError: null
    });
  },

  leaveEncounter: () => {
    set({ encounterNodeId: null, run: null, composedCardIds: [], lastError: null });
  },

  beginSpellPhase: () => {
    const run = get().run;
    if (!run || run.phase !== 'prep') {
      return;
    }

    runPrepPhase(run);
    set({ run: { ...run }, composedCardIds: [], lastError: null });
  },

  toggleComposedCard: (cardId: string) => {
    const run = get().run;
    if (!run || run.phase !== 'spell') {
      return;
    }

    const cardInHand = run.deck.hand.some((card) => card.id === cardId);
    if (!cardInHand) {
      set({ lastError: 'Selected card is no longer available in hand.' });
      return;
    }

    const state = get();
    const alreadySelected = state.composedCardIds.includes(cardId);
    if (alreadySelected) {
      set({
        composedCardIds: state.composedCardIds.filter((id) => id !== cardId),
        lastError: null
      });
      return;
    }

    set({ composedCardIds: [...state.composedCardIds, cardId], lastError: null });
  },

  undoComposedLetter: () => {
    const state = get();
    if (state.composedCardIds.length === 0) {
      return;
    }

    set({ composedCardIds: state.composedCardIds.slice(0, -1), lastError: null });
  },

  clearComposedWord: () => {
    set({ composedCardIds: [], lastError: null });
  },

  setSplay: (splay: SplayDirection) => {
    set({ splay });
  },

  setWildLetter: (letter: string) => {
    set({ wildLetter: letter.toLowerCase().slice(0, 1) });
  },

  toggleWildCard: () => {
    const run = get().run;
    if (!run || run.phase !== 'spell') {
      return;
    }

    const state = get();
    if (state.composedCardIds.includes(WILD_CARD_ID)) {
      set({ composedCardIds: state.composedCardIds.filter((id) => id !== WILD_CARD_ID), lastError: null });
      return;
    }

    set({ composedCardIds: [...state.composedCardIds, WILD_CARD_ID], lastError: null });
  },

  toggleEnemyVowelCard: () => {
    const run = get().run;
    if (!run || run.phase !== 'spell' || !run.enemyVowelAvailable) {
      return;
    }

    const state = get();
    if (state.composedCardIds.includes(ENEMY_VOWEL_CARD_ID)) {
      set({ composedCardIds: state.composedCardIds.filter((id) => id !== ENEMY_VOWEL_CARD_ID), lastError: null });
      return;
    }

    set({ composedCardIds: [...state.composedCardIds, ENEMY_VOWEL_CARD_ID], lastError: null });
  },

  useItem: (itemId: string) => {
    const run = get().run;
    if (!run || run.phase !== 'spell') {
      return;
    }

    try {
      engineUseItem(run, itemId);
      set({ run: { ...run }, lastError: null });
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : 'Failed to use item.' });
    }
  },

  submitComposedWord: () => {
    const run = get().run;
    if (!run || run.phase !== 'spell') {
      return;
    }

    const { composedCardIds, splay, wildLetter } = get();
    if (composedCardIds.length === 0) {
      set({ lastError: 'Compose a word before submitting.' });
      return;
    }

    if (composedCardIds.includes(WILD_CARD_ID) && !/^[a-z]$/i.test(wildLetter)) {
      set({ lastError: 'Choose a letter for the Wild card before casting.' });
      return;
    }

    const handById = new Map(run.deck.hand.map((card) => [card.id, card]));
    const composedCards = composedCardIds.map((id) => {
      if (id === WILD_CARD_ID) {
        return { ...run.wildCard, letter: wildLetter };
      }
      if (id === ENEMY_VOWEL_CARD_ID) {
        return {
          ...run.wildCard,
          id: 'enemy-vowel-active',
          letter: run.enemy.weakVowel ?? '',
          kind: 'enemyVowel' as const,
          ability: "Advances the enemy's intent to its next action."
        };
      }
      return handById.get(id);
    }).filter((card): card is NonNullable<typeof card> => Boolean(card));

    if (composedCards.length !== composedCardIds.length) {
      set({ lastError: 'Composed word is out of sync with hand. Rebuild and submit again.' });
      return;
    }

    try {
      submitComposedCards(run, composedCards, splay);
      set({ run: { ...run }, composedCardIds: [], wildLetter: '', lastError: null });
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : 'Failed to submit word.' });
    }
  },

  passCurrentTurn: () => {
    const run = get().run;
    if (!run || run.phase !== 'spell') {
      return;
    }

    passTurn(run);
    set({ run: { ...run }, composedCardIds: [], lastError: null });
  },

  clearError: () => {
    set({ lastError: null });
  },

  setError: (message: string) => {
    set({ lastError: message });
  }
}));
