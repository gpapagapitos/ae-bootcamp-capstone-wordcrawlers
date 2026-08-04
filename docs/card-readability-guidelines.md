# Card Readability Guidelines

Related implementation contract: `specs/004-card-visual-a11y/spec.md`

## Goals

- Players should understand each card in under 2 seconds.
- Ability timing and effect must be explicit and predictable.
- Important values (letter, cost, rarity, effect magnitude) must be visually scannable.

## Card Information Hierarchy

1. Letter anchor
- Largest element on card face.

2. Card title and role
- Title plus short role tag (attack/control/utility).

3. Ability timing
- Fixed labels such as On Submit, On Clash, On Cleanup.

4. Ability effect sentence
- One concise sentence with explicit actor and outcome.

5. Reminder text
- Optional small text for edge case clarification.

## Text Standards

- Use one sentence for primary effect when possible.
- Avoid multi-clause ambiguous effects.
- Use consistent verbs:
  - Give Hex
  - Gain Block
  - Draw Card
  - Stun Enemy
  - Fatigue Card
- Avoid implied subjects. Always state who is affected.

## Accessibility Rules

- Minimum body text size: 14px equivalent.
- Contrast ratio targets: WCAG AA minimum.
- Keep line length short to avoid dense reading blocks.
- Provide tooltip or glossary support for keywords.

## Quick QA Checklist (Per Card Variant)

- Letter anchor remains the largest element in hand and preview states.
- Timing label is visible without hover or tooltip.
- Primary effect stays readable at 14px equivalent minimum.
- Contrast passes WCAG AA for text and focus indicators.
- Rarity and role are distinguishable without color-only cues.
- Reduced motion mode keeps selection/resolution feedback clear.

## MVP Keyword Glossary

- Hex: Counter placed on enemy for later effects.
- Stun: Enemy skips its next action.
- Fatigue: Card removed from encounter rotation until battle ends.
- Clash: The phase where player and enemy effects resolve.
