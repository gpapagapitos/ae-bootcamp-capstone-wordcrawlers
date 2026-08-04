import { describe, expect, it } from 'vitest';
import { createInitialRunState } from '../../src/engine/state.js';

describe('initial run state', () => {
  it('draws 7 cards for duelist opening hand', () => {
    const state = createInitialRunState(101, 'duelist');

    expect(state.deck.hand.length).toBe(7);
  });

  it('draws 7 cards for arcanist opening hand', () => {
    const state = createInitialRunState(101, 'arcanist');

    expect(state.deck.hand.length).toBe(7);
  });
});
