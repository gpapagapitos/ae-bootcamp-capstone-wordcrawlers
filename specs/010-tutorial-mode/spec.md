# Spec 010: First-Run Tutorial Mode

## Status
Draft

## Source of Truth
`specs/009-board-game-rules-fidelity/spec.md` defines the current core combat rules
(splay left/right, top-card fatigue, Wild card letter assignment, Enemy Vowel pseudo-card,
hex/boon, Items) that this spec must onboard a new player to. This spec does not change
any combat rule; it only adds a teaching layer on top of the existing `CombatHud`.

## Goal
Give a first-time player a lightweight, skippable, in-context walkthrough of the combat
screen's mechanics before or as they encounter the relevant controls, so they are not
dropped into splay/Wild/Enemy Vowel/Items decisions with zero explanation.

## Scope
- A first-run overlay/tooltip **sequence**, not a separate scripted tutorial encounter or
  dedicated tutorial level. It runs on top of the real first combat encounter.
- Anchored, single-target tooltip steps (one highlighted UI region + short copy + Next/
  Skip controls), driven by a small ordered step-config array. No animation framework,
  no voice-over.
- Steps cover, in order:
  1. Hand fan — selecting letter cards to build a word.
  2. Splay left/right — choosing which end of the word becomes the top card.
  3. Wild card — typing a letter into the Wild card's inline input.
  4. Enemy Vowel — the pseudo-card button and its "advance enemy intent" effect.
  5. Items row — energy-gated action-row items usable during Prep.
  6. Enemy intent — reading the upcoming intent pill/banner to plan blocking.
- Persisted "seen" flag in `localStorage` (reusing the persistence patterns in
  `src/app/persistence/`) so the sequence auto-shows at most once per browser profile.
- Replayable on demand from a "Help" entry point in the combat HUD header.

## Requirements

### T1 Step Sequence
- Tutorial state shall be an ordered array of step definitions, each with: `id`, target
  anchor selector/ref, title, body copy, and (optional) a condition for when the step is
  relevant (e.g., Enemy Vowel step only shows once `enemyVowelAvailable` is true).
- Steps not relevant to the current encounter state (e.g., Enemy Vowel step before the
  weak vowel is revealed) shall be skipped automatically without breaking sequence order.
- The engine/combat rules shall never be blocked, paused, or altered by tutorial state;
  the tutorial only overlays UI.

### T2 Dismissible, Not Forced
- Every step shall offer **Next** and **Skip Tutorial** controls; there is no modal trap.
- Pressing **Skip Tutorial** at any step shall immediately end the whole sequence and
  persist the "seen" flag.
- Pressing **Next** on the final step shall end the sequence and persist the "seen" flag.
- The overlay shall not block interaction with the rest of the page (steps highlight but
  do not use a full-screen modal backdrop that traps focus away from Next/Skip).

### T3 First-Run Gating and Persistence
- A boolean "tutorialSeen" flag shall persist in `localStorage` under a dedicated key,
  separate from run-save state, following the `LocalStorageLike` abstraction already used
  by `src/app/persistence/runSave.ts` (injectable storage for testability).
- On app boot, if the flag is unset/false and the player reaches the first combat
  encounter, the tutorial sequence shall start automatically at step 1.
- If storage is unavailable, the tutorial shall default to "not seen" for that session
  (show once) but must not throw or crash the app; failures to persist are non-fatal.

### T4 Replayable Entry Point
- The combat HUD header shall expose a "Help" (`?`) button that restarts the tutorial
  sequence from step 1 regardless of the persisted flag.
- Replaying the tutorial from Help shall not reset or otherwise affect the persisted
  "seen" flag beyond it already being true.

### T5 Accessibility
- Each step shall be rendered as a labelled region (`role="dialog"` or `role="status"`
  with `aria-live="polite"`, per step content) with visible focus on the Next button.
- Copy shall be readable independent of the highlighted target (no reliance on color
  alone); Skip/Next controls shall be reachable via keyboard (Tab/Enter).

## Acceptance Criteria

1. Given a brand-new browser profile with no `tutorialSeen` flag, when the player reaches
   their first combat encounter, then the tutorial overlay opens automatically at step 1.
2. Given the tutorial is open, when the player clicks Skip Tutorial at any step, then the
   overlay closes immediately and `tutorialSeen` is persisted as `true`.
3. Given the tutorial is open at the last step, when the player clicks Next, then the
   overlay closes and `tutorialSeen` is persisted as `true`.
4. Given `tutorialSeen` is already `true` in storage, when the player starts a new run or
   reaches combat, then the tutorial does not auto-open.
5. Given the Enemy Vowel is not yet available in the current encounter, when the step
   sequence is built, then the Enemy Vowel step is omitted without breaking Next/Skip
   ordering of remaining steps.
6. Given `tutorialSeen` is `true`, when the player clicks the Help (`?`) button in the
   combat HUD, then the tutorial reopens at step 1 without clearing the persisted flag.
7. Given `localStorage` is unavailable (e.g., throws on access), when the app boots, then
   the tutorial still renders once for that session and no unhandled error is thrown.

## Out of Scope
- A separate scripted/staged tutorial encounter with fixed enemy/cards.
- Voice-over, video, or animated walkthrough sequences.
- Per-hero tutorial variants (the sequence is hero-agnostic; card labels use whatever the
  active hero's real hand/state shows).
- Analytics/telemetry on tutorial completion or step drop-off.
- Localization of tutorial copy (English only for MVP, matching the rest of the app).

## Open Questions

1. None blocking implementation — see `clarifications.md` for the two minor decisions
   made during design (storage key naming, and step-skip vs. step-disable copy for
   not-yet-relevant steps).
