import type { TutorialContext, TutorialStep } from './tutorialSteps.js';
import { getRelevantSteps, TUTORIAL_STEPS } from './tutorialSteps.js';

export interface TutorialControllerState {
  stepIndex: number;
  steps: TutorialStep[];
}

export function createTutorialState(
  context: TutorialContext,
  steps: TutorialStep[] = TUTORIAL_STEPS
): TutorialControllerState {
  return { stepIndex: 0, steps: getRelevantSteps(context, steps) };
}

export function isLastTutorialStep(state: TutorialControllerState): boolean {
  return state.stepIndex >= state.steps.length - 1;
}

/** Advances one step, or returns null when the sequence is finished (last step's Next was pressed). */
export function advanceTutorialStep(state: TutorialControllerState): TutorialControllerState | null {
  if (isLastTutorialStep(state)) {
    return null;
  }
  return { ...state, stepIndex: state.stepIndex + 1 };
}

export function currentTutorialStep(state: TutorialControllerState): TutorialStep | null {
  return state.steps[state.stepIndex] ?? null;
}
