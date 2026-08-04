import { beforeEach, describe, expect, it } from 'vitest';
import { useCombatStore } from '../../src/app/store/combatStore.js';
import type { Card } from '../../src/engine/types.js';

function makeCard(id: string, letter: string): Card {
  return {
    id,
    letter,
    value: 'aeiou'.includes(letter) ? 1 : 2,
    rarity: 1,
    tags: []
  };
}

function resetStore(): void {
  useCombatStore.setState({
    encounterNodeId: null,
    run: null,
    heroId: 'duelist',
    composedCardIds: [],
    lastError: null
  });
}

describe('combat store flow', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts encounter with prep phase state', () => {
    const store = useCombatStore.getState();
    store.startEncounter('r0-l0', 1234);

    const state = useCombatStore.getState();
    expect(state.encounterNodeId).toBe('r0-l0');
    expect(state.run?.phase).toBe('prep');
    expect(state.run?.deck.hand.length).toBe(7);
  });

  it('uses provided progression deck when starting an encounter', () => {
    const store = useCombatStore.getState();
    const injectedDeck = [
      makeCard('deck-a', 'a'),
      makeCard('deck-b', 'b'),
      makeCard('deck-c', 'c'),
      makeCard('deck-d', 'd'),
      makeCard('deck-e', 'e'),
      makeCard('deck-f', 'f'),
      makeCard('deck-g', 'g'),
      makeCard('deck-h', 'h')
    ];

    store.startEncounter('r0-l0', 1234, injectedDeck, 'duelist');

    const state = useCombatStore.getState();
    const allCardIds = [
      ...(state.run?.deck.hand.map((card) => card.id) ?? []),
      ...(state.run?.deck.draw.map((card) => card.id) ?? []),
      ...(state.run?.deck.discard.map((card) => card.id) ?? []),
      ...(state.run?.deck.fatigue.map((card) => card.id) ?? [])
    ];

    expect(allCardIds.sort()).toEqual(injectedDeck.map((card) => card.id).sort());
    expect(state.run?.deck.hand.length).toBe(7);
  });

  it('runs prep to spell and submits a composed valid word', () => {
    const store = useCombatStore.getState();
    store.startEncounter('r0-l0', 1234);
    store.beginSpellPhase();

    const run = useCombatStore.getState().run;
    if (!run) {
      throw new Error('run missing in test setup');
    }

    run.deck.hand = [
      makeCard('a1', 'a'),
      makeCard('r1', 'r'),
      makeCard('c1', 'c'),
      makeCard('z1', 'z')
    ];
    useCombatStore.setState({ run: { ...run } });

    store.toggleComposedCard('a1');
    store.toggleComposedCard('r1');
    store.toggleComposedCard('c1');

    store.submitComposedWord();

    const resolved = useCombatStore.getState();
    expect(resolved.run?.turn).toBe(2);
    expect(resolved.run?.phase).toBe('prep');
    expect(resolved.run?.deck.fatigue.length).toBe(1);
    expect(resolved.composedCardIds).toEqual([]);
    expect(resolved.lastError).toBeNull();
  });

  it('reports strict dictionary feedback for invalid composed words', () => {
    const store = useCombatStore.getState();
    store.startEncounter('r0-l0', 1234);
    store.beginSpellPhase();

    const run = useCombatStore.getState().run;
    if (!run) {
      throw new Error('run missing in test setup');
    }

    run.deck.hand = [makeCard('z1', 'z'), makeCard('z2', 'z')];
    useCombatStore.setState({ run: { ...run } });

    store.toggleComposedCard('z1');
    store.toggleComposedCard('z2');
    store.submitComposedWord();

    const state = useCombatStore.getState();
    expect(state.lastError).toMatch(/strict dictionary/i);
    expect(state.run?.phase).toBe('spell');
  });

  it('keeps pass visible and clears composed letters after passing', () => {
    const store = useCombatStore.getState();
    store.startEncounter('r0-l0', 1234);
    store.beginSpellPhase();

    const run = useCombatStore.getState().run;
    if (!run) {
      throw new Error('run missing in test setup');
    }

    run.deck.hand = [makeCard('a1', 'a'), makeCard('r1', 'r')];
    useCombatStore.setState({ run: { ...run } });

    store.toggleComposedCard('a1');
    store.toggleComposedCard('r1');
    store.passCurrentTurn();

    const state = useCombatStore.getState();
    expect(state.run?.turn).toBe(2);
    expect(state.run?.phase).toBe('prep');
    expect(state.composedCardIds).toEqual([]);
    expect(state.lastError).toBeNull();
  });
});
