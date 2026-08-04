export interface TutorialContext {
  enemyVowelAvailable: boolean;
}

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  /** CSS selector for the on-screen region this step points at; used for a highlight ring only. */
  highlightSelector: string;
  /** Steps without a condition are always relevant. */
  condition?: (context: TutorialContext) => boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'hand',
    title: 'Your Hand',
    body: 'Tap letter cards in your hand to add them to the word you are building.',
    highlightSelector: '[data-tutorial="hand-tray"]'
  },
  {
    id: 'splay',
    title: 'Splay Left or Right',
    body:
      'Choose Splay Left or Splay Right before casting. It decides which end of your word becomes the top card and which edge values (hits/blocks/energy) count.',
    highlightSelector: '[data-tutorial="splay-toggle"]'
  },
  {
    id: 'wild',
    title: 'Wild Card',
    body: 'The Wild card can stand in for any letter. Type a letter into its box to use it in your word.',
    highlightSelector: '[data-tutorial="wild-card"]'
  },
  {
    id: 'enemy-vowel',
    title: 'Enemy Weak Spot',
    body:
      "This enemy has a weak-spot vowel you can play. Making it your word's top card advances the enemy's next intent immediately.",
    highlightSelector: '[data-tutorial="enemy-vowel"]',
    condition: (context) => context.enemyVowelAvailable
  },
  {
    id: 'items',
    title: 'Items',
    body: 'Items cost energy and activate once per turn during Prep, before you cast your word.',
    highlightSelector: '[data-tutorial="items-row"]'
  },
  {
    id: 'intent',
    title: 'Enemy Intent',
    body: 'Watch this row to see what the enemy plans to do next, so you know when to block instead of attack.',
    highlightSelector: '[data-tutorial="intent-row"]'
  }
];

export function getRelevantSteps(context: TutorialContext, steps: TutorialStep[] = TUTORIAL_STEPS): TutorialStep[] {
  return steps.filter((step) => !step.condition || step.condition(context));
}
