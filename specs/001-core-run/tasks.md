# Spec 001 Tasks

## Phase A: Foundation

- [x] Create TypeScript project skeleton and lint/test tooling.
- [x] Implement core domain types and run-state schema.
- [x] Add seedable RNG utility for deterministic runs.

## Phase B: Core Combat Engine

- [x] Implement turn phases and transition guards.
- [x] Implement word validation module with local dictionary.
- [x] Implement combat resolution order and status processing.
- [x] Implement fatigue selection and movement rules.
- [x] Add engine unit tests for every phase transition.

## Phase C: Progression Loop

- [x] Implement encounter victory/defeat checks.
- [x] Implement reward generation and selection.
- [x] Implement shop actions: buy card, remove card.
- [x] Implement simple map progression to boss.

## Phase D: UI Vertical Slice

- [x] Build Act 1 map screen with connected-node navigation.
- [x] Add readable card design prototype with clear ability text hierarchy.
- [x] Build combat HUD with hand, intent, and action log.
- [x] Build word entry UX with submit and pass actions.
- [x] Build reward and shop modal flows.
- [x] Build run-end screens (victory/defeat).

## Phase E: Quality and Capstone Evidence

- [ ] Add integration tests for one full encounter.
- [ ] Add one E2E smoke test for a mini run.
- [x] Add session handoff documentation for continuity across sessions.
- [ ] Add docs linking requirements to tests.
- [ ] Configure CI for lint, test, and build.

## Phase F: Resolved Spec Decisions

- [x] Enforce repeat-word stacking penalty (-10% per repeat after first, cap -40%).
- [x] Add engine tests for repeat penalty floor/cap behavior.
- [x] Lock dictionary mode to strict for MVP run state.
- [x] Add validation tests confirming proper nouns are rejected in strict mode.
- [x] Set MVP opening hand size to 7 cards at run start.
- [x] Add tests confirming opening hand count is 7 for both heroes.
- [x] Add explicit word-validation tests documenting contextual Y behavior via dictionary validity.
- [x] Add card token system for rarity sigils plus fallback utility shapes.
- [x] Add timing-label icon set (text remains mandatory) in card UI.
- [ ] Add global high-contrast toggle independent from dyslexia-friendly font mode.
- [ ] Add accessibility test checklist execution for card variants (default, hover, selected, disabled, reward preview, upgraded).
