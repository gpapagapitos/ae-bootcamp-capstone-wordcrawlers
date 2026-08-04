# Issue Backlog Draft (Specs 005-008)

Use these as copy-ready GitHub issues. IDs continue after WC-004.

## WC-005 [P1] Implement run save envelope and adapter

- Spec refs: specs/005-save-resume-recovery/spec.md, specs/005-save-resume-recovery/tasks.md
- Scope:
  - Add schema-versioned save envelope with checksum.
  - Implement `current` + `previous` slot persistence adapter.
  - Add typed load/save error reasons.
- Acceptance:
  - Valid state saves and loads without loss.
  - Malformed payload returns explicit non-crash error.

## WC-006 [P1] Add resume gate and recovery UX

- Spec refs: specs/005-save-resume-recovery/spec.md, specs/005-save-resume-recovery/tasks.md
- Scope:
  - Startup Resume/Abandon prompt.
  - Corrupted/incompatible save messaging.
  - Save status indicator (`Saving...`/`Saved`).
- Acceptance:
  - Resume restores exact gameplay position.
  - Corrupted saves do not block app boot.

## WC-007 [P1] Complete reward and shop progression flow

- Spec refs: specs/001-core-run/tasks.md
- Scope:
  - Encounter win/lose hooks.
  - Reward generation + selection.
  - Shop buy/remove actions and UI modals.
- Acceptance:
  - Deck mutations persist correctly after rewards/shops.
  - Boss victory and defeat screens are reachable.

## WC-008 [P1] Enforce map generation contract and fairness

- Spec refs: specs/007-map-generation-contract/spec.md, specs/007-map-generation-contract/tasks.md
- Scope:
  - Validate generation config and version.
  - Deterministic node assignment by seed.
  - Route guarantees (non-elite path + pre-boss sustain).
- Acceptance:
  - Same seed/config outputs identical map.
  - Impossible configs return explicit validation error.

## WC-009 [P1] Implement Duelist and Arcanist hero definitions

- Spec refs: specs/008-hero-kit-identity-contract/spec.md, specs/008-hero-kit-identity-contract/tasks.md
- Scope:
  - Hero definition schema.
  - Starter deck/relic data for both heroes.
  - Hero-select initialization.
- Acceptance:
  - Selecting hero loads correct deck/relic state.
  - Both heroes playable in full MVP run path.

## WC-010 [P1] Add hero signature mechanics and logs

- Spec refs: specs/008-hero-kit-identity-contract/spec.md, specs/008-hero-kit-identity-contract/tasks.md
- Scope:
  - Chain and hex signature trigger hooks.
  - Deterministic effect priority.
  - Action log trace for signature outcomes.
- Acceptance:
  - Signature triggers are reproducible under fixed seeds.
  - Logs clearly indicate trigger source and effect result.

## WC-011 [P2] Build meta progression profile and unlock flow

- Spec refs: specs/006-meta-progression-and-unlocks/spec.md, specs/006-meta-progression-and-unlocks/tasks.md
- Scope:
  - Meta profile persistence.
  - Deterministic run-end currency awards.
  - Unlock purchase checks and reset behavior.
- Acceptance:
  - Unlock purchases persist across restart.
  - Profile reset does not delete active run save.

## WC-012 [P2] Create meta progression UI

- Spec refs: specs/006-meta-progression-and-unlocks/spec.md, specs/006-meta-progression-and-unlocks/tasks.md
- Scope:
  - Currency balance display.
  - Unlock listing, prerequisites, and purchase feedback.
  - Cosmetic selection panel.
- Acceptance:
  - Locked/unlocked states render correctly.
  - Insufficient-currency feedback is explicit.

## WC-013 [P1] Add deterministic integration and smoke tests

- Spec refs: specs/001-core-run/tasks.md, specs/005-save-resume-recovery/tasks.md, specs/007-map-generation-contract/tasks.md, specs/008-hero-kit-identity-contract/tasks.md
- Scope:
  - Full encounter integration test.
  - Save/resume determinism regression test.
  - One end-to-end smoke path through core loop.
- Acceptance:
  - Tests pass reliably and are non-flaky across repeated local runs.

## WC-014 [P1] Configure CI quality gates and traceability links

- Spec refs: docs/capstone-traceability.md, specs/001-core-run/tasks.md
- Scope:
  - CI checks: lint, test, build.
  - Requirement-to-test linkage doc update.
  - Failure policy documented for main branch merges.
- Acceptance:
  - CI blocks merge on failing required checks.
  - Traceability links include spec IDs and test references.
