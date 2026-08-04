import { describe, expect, it } from 'vitest';
import { createInitialRunState } from '../../src/engine/state.js';
import { passTurn, runPrepPhase, submitComposedCards, submitWord, useItem } from '../../src/engine/turn.js';
import type { Card } from '../../src/engine/types.js';

function forceHandForWord(state: ReturnType<typeof createInitialRunState>, word: string): void {
  state.deck.hand = word.split('').map((letter, index) => ({
    id: `test-${index}-${letter}`,
    letter,
    value: 1,
    rarity: 1,
    tags: []
  }));
}

describe('turn flow', () => {
  it('moves prep to spell phase', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    expect(state.phase).toBe('spell');
  });

  it('allows pass and advances turn', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    const hpBefore = state.hero.hp;

    passTurn(state);

    expect(state.turn).toBe(2);
    expect(state.phase).toBe('prep');
    expect(state.hero.hp).toBeLessThanOrEqual(hpBefore);
  });

  it('submits valid word and damages enemy', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    forceHandForWord(state, 'arc');

    const enemyHpBefore = state.enemy.hp;
    submitWord(state, 'arc');

    expect(state.enemy.hp).toBeLessThan(enemyHpBefore);
    expect(state.turn).toBe(2);
    expect(state.deck.fatigue.length).toBe(1);
  });

  it('rejects invalid words', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);

    expect(() => submitWord(state, 'zzzz')).toThrow(/strict dictionary/i);
    expect(state.phase).toBe('spell');
  });

  it('applies 1 HP loss for an unplayed Penalty card left in hand at Cleanup (spec 009 R6)', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    forceHandForWord(state, 'arc');
    state.deck.hand.push({ id: 'penalty-x', letter: 'x', value: 0, rarity: 1, tags: [], kind: 'penalty' });

    submitWord(state, 'arc');

    expect(state.actionLog.some((entry) => entry.message.includes('Unplayed Penalty card'))).toBe(true);
  });

  it('returns a played Penalty card to the shared pool instead of discard/fatigue', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    const penalty: Card = { id: 'penalty-a', letter: 'a', value: 0, rarity: 1, tags: [], kind: 'penalty' };
    const r: Card = { id: 'r1', letter: 'r', value: 2, rarity: 1, tags: [] };
    const c: Card = { id: 'c1', letter: 'c', value: 2, rarity: 1, tags: [] };
    const poolSizeBefore = state.penaltyPool.length;

    submitComposedCards(state, [penalty, r, c], 'right');

    expect(state.penaltyPool.length).toBe(poolSizeBefore + 1);
    expect(state.deck.discard.some((card) => card.id === 'penalty-a')).toBe(false);
    expect(state.deck.fatigue.some((card) => card.id === 'penalty-a')).toBe(false);
  });

  it('lets a Wild card fill in for a missing hand letter via submitComposedCards', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    forceHandForWord(state, 'rc');
    const wild: Card = { ...state.wildCard, letter: 'a' };

    const enemyHpBefore = state.enemy.hp;
    submitComposedCards(state, [wild, ...state.deck.hand], 'right');

    expect(state.enemy.hp).toBeLessThan(enemyHpBefore);
  });

  it('does not double-advance the enemy intent index on the turn it flips to Stage 2 (spec 009 R7 FAQ)', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    state.enemy.hp = 1;
    forceHandForWord(state, 'arc');

    submitWord(state, 'arc');

    expect(state.enemy.stage).toBe(2);
    expect(state.enemy.intentIndex).toBe(0);
  });

  it('spends energy and applies an item effect during the Spell phase', () => {
    const state = createInitialRunState(10, 'duelist');
    runPrepPhase(state);
    const item = state.items[0];
    const energyBefore = state.hero.energy;

    useItem(state, item.def.id);

    expect(state.hero.energy).toBe(energyBefore - item.def.energyCost);
    expect(state.items[0].usedThisTurn).toBe(true);
  });
});
