# Spec 010 Clarifications

## Decisions

1. Storage key naming

- Decision: use `wordcrawlers.tutorial.seen.v1`, mirroring the versioned key style of
  `RUN_SAVE_KEYS` in `src/app/persistence/contracts.ts`, stored independently of run-save
  envelopes (tutorial completion is a browser-profile preference, not run state).

2. Not-yet-relevant steps

- Decision: skip (omit) steps whose condition isn't met yet rather than showing a
  disabled/greyed step. Simpler sequencing, and it avoids a "why is this step here" gap
  for a mechanic the player hasn't encountered (e.g., Enemy Vowel before the weak vowel
  is revealed).

3. Auto-start trigger point

- Decision: auto-start on first combat encounter mount (not app boot / not hero select),
  since the mechanics being taught only exist once `CombatHud` is rendered.

4. Forced vs. dismissible

- Decision: fully dismissible at every step (Skip Tutorial always available); no forced
  steps. This is a teaching aid, not a gate, matching the "lightweight overlay" scope.

5. Replay entry point

- Decision: a `?` Help button in the `CombatHud` header, always visible during combat,
  restarts the sequence from step 1 without touching the persisted seen flag.

## Remaining Risks

- If hand/enemy state changes rapidly between steps (e.g., word submitted mid-tutorial),
  a step's anchor target could disappear. Mitigated by keeping the tutorial's own
  Next/Skip controls independent of live game state and re-evaluating step relevance
  each render.
