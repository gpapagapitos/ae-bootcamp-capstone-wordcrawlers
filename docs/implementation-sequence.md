# Implementation Sequence (Specs 001 + 005-008)

## Objective

Execute remaining MVP work in dependency-safe order while preserving deterministic engine behavior and capstone evidence quality.

## Priority Rules

- Determinism and state integrity before content growth.
- Engine/data contracts before UI polish.
- Reward/shop flow before meta progression economy.
- Hero identity and pool weighting before balance assertions.

## Wave 1: Finish Core Loop Closure (Spec 001 + Spec 005 Foundation)

1. Encounter outcome hooks (win/lose) in run flow.
2. Reward generation/selection and shop buy/remove actions.
3. Reward/shop modal UI and run-end screens.
4. Save envelope contract + persistence adapter (`current`/`previous`).
5. Save/load/abandon behavior with validation and fallback.

Exit criteria:

- Player can complete one full act+boss run with save/resume support.
- Reward and shop choices mutate deck correctly.

## Wave 2: Determinism and Map Contract Hardening (Spec 005 + Spec 007)

1. Autosave checkpoints (node enter, cleanup, reward, shop, rest).
2. Resume gate and corrupted/incompatible save messaging.
3. Map generation input/output contracts and config validation.
4. Fairness constraints: non-elite route and pre-boss sustain path.
5. Lookahead metadata and map trace fields.

Exit criteria:

- Same seed + state path reproduces map and combat outcomes.
- Map generation guarantees fairness constraints in tests.

## Wave 3: Hero Identity Contract (Spec 008)

1. Hero definition schema, starter deck/relic data.
2. Duelist/Arcanist signature hooks in combat resolution.
3. Hero select initialization and in-run identity context.
4. Hero-aware reward weighting with neutral pool guarantee.

Exit criteria:

- Both heroes run end-to-end under one-act MVP.
- Hero mechanics are action-log readable and deterministic.

## Wave 4: Meta Progression (Spec 006)

1. Meta profile schema and persistence.
2. Deterministic run-end currency service.
3. Unlock catalog and purchase transaction checks.
4. Meta screen UI and reset flow.
5. Gameplay unlock integration into content pools.

Exit criteria:

- Currency and unlock states persist across restart.
- Cosmetic and gameplay unlock paths are both functional.

## Wave 5: Quality Gates and Evidence

1. Integration test: one full encounter loop.
2. E2E smoke: map -> combat -> reward/shop -> run end.
3. Save corruption/version mismatch tests.
4. Map distribution determinism test harness.
5. Hero seed-suite delta report and traceability updates.
6. CI wiring for lint/test/build + requirement linkage docs.

Exit criteria:

- CI passes lint/test/build on mainline.
- Requirement -> code -> test links documented for capstone review.

## Suggested Sprint Cut

- Sprint A: Wave 1 + Wave 2
- Sprint B: Wave 3 + Wave 4
- Sprint C: Wave 5 + balancing polish
