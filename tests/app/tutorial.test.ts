import { describe, expect, it } from 'vitest';
import {
  advanceTutorialStep,
  createTutorialState,
  currentTutorialStep,
  isLastTutorialStep
} from '../../src/app/components/tutorialController.js';
import { getRelevantSteps, type TutorialStep } from '../../src/app/components/tutorialSteps.js';
import { isTutorialSeen, markTutorialSeen, TUTORIAL_SEEN_KEY } from '../../src/app/persistence/tutorial.js';
import type { LocalStorageLike } from '../../src/app/persistence/contracts.js';

class MemoryStorage implements LocalStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

class ThrowingStorage implements LocalStorageLike {
  getItem(): string | null {
    throw new Error('storage unavailable');
  }

  setItem(): void {
    throw new Error('storage unavailable');
  }

  removeItem(): void {
    throw new Error('storage unavailable');
  }
}

const TEST_STEPS: TutorialStep[] = [
  { id: 'a', title: 'A', body: 'a', highlightSelector: '[data-tutorial="a"]' },
  { id: 'b', title: 'B', body: 'b', highlightSelector: '[data-tutorial="b"]' },
  {
    id: 'conditional',
    title: 'C',
    body: 'c',
    highlightSelector: '[data-tutorial="c"]',
    condition: (context) => context.enemyVowelAvailable
  },
  { id: 'd', title: 'D', body: 'd', highlightSelector: '[data-tutorial="d"]' }
];

describe('tutorial step relevance', () => {
  it('omits conditional steps whose condition is not met', () => {
    const steps = getRelevantSteps({ enemyVowelAvailable: false }, TEST_STEPS);
    expect(steps.map((step) => step.id)).toEqual(['a', 'b', 'd']);
  });

  it('includes conditional steps whose condition is met', () => {
    const steps = getRelevantSteps({ enemyVowelAvailable: true }, TEST_STEPS);
    expect(steps.map((step) => step.id)).toEqual(['a', 'b', 'conditional', 'd']);
  });
});

describe('tutorial step-advancement controller', () => {
  it('starts at step 0 with only relevant steps', () => {
    const state = createTutorialState({ enemyVowelAvailable: false }, TEST_STEPS);
    expect(state.stepIndex).toBe(0);
    expect(currentTutorialStep(state)?.id).toBe('a');
    expect(isLastTutorialStep(state)).toBe(false);
  });

  it('advances through each relevant step in order', () => {
    let state = createTutorialState({ enemyVowelAvailable: false }, TEST_STEPS);

    const next1 = advanceTutorialStep(state);
    expect(next1).not.toBeNull();
    state = next1!;
    expect(currentTutorialStep(state)?.id).toBe('b');

    const next2 = advanceTutorialStep(state);
    expect(next2).not.toBeNull();
    state = next2!;
    expect(currentTutorialStep(state)?.id).toBe('d');
    expect(isLastTutorialStep(state)).toBe(true);
  });

  it('returns null when advancing past the last step (sequence finished)', () => {
    let state = createTutorialState({ enemyVowelAvailable: false }, TEST_STEPS);
    state = advanceTutorialStep(state)!;
    state = advanceTutorialStep(state)!;
    expect(isLastTutorialStep(state)).toBe(true);

    const finished = advanceTutorialStep(state);
    expect(finished).toBeNull();
  });

  it('does not mutate the input state when advancing', () => {
    const state = createTutorialState({ enemyVowelAvailable: false }, TEST_STEPS);
    const originalIndex = state.stepIndex;
    advanceTutorialStep(state);
    expect(state.stepIndex).toBe(originalIndex);
  });
});

describe('tutorial-seen persistence flag', () => {
  it('defaults to not seen when storage is empty', () => {
    const storage = new MemoryStorage();
    expect(isTutorialSeen(storage)).toBe(false);
  });

  it('persists seen=true after marking, and reads it back', () => {
    const storage = new MemoryStorage();
    markTutorialSeen(storage);
    expect(storage.getItem(TUTORIAL_SEEN_KEY)).toBe('true');
    expect(isTutorialSeen(storage)).toBe(true);
  });

  it('defaults to not seen (never throws) when storage access throws', () => {
    const storage = new ThrowingStorage();
    expect(() => isTutorialSeen(storage)).not.toThrow();
    expect(isTutorialSeen(storage)).toBe(false);
  });

  it('does not throw when marking seen fails to persist', () => {
    const storage = new ThrowingStorage();
    expect(() => markTutorialSeen(storage)).not.toThrow();
  });
});
