# Spec 005: Run Save, Resume, and Recovery

## Status
Draft

## Goal
Ensure players can safely stop and continue a run without losing progress, while preserving deterministic state and handling corrupt/incompatible saves gracefully.

## Scope
MVP local save/resume behavior for single-run mode.

## Requirements

### S1 Save Model
- System shall maintain one active run save slot for MVP.
- Save payload shall include all state required to resume deterministically: map state, encounter state, deck zones, statuses, RNG state, hero state, and run metadata.
- Save payload shall include `schemaVersion` and `savedAt` timestamp.

### S2 Autosave Triggers
- System shall autosave at these checkpoints:
  1. after entering a node,
  2. after combat turn cleanup,
  3. after reward selection,
  4. after shop transaction,
  5. after rest action.
- Autosave shall be atomic: interrupted writes must not produce partially valid state.

### S3 Resume Experience
- On app start, if an active run save exists, system shall offer Resume or Abandon options.
- Resume shall restore the exact gameplay position without re-rolling RNG outcomes.
- Abandon shall require confirmation and then clear active run save.

### S4 Corruption and Incompatibility Handling
- If save fails integrity checks, system shall mark it unreadable and present a non-blocking recovery message.
- If `schemaVersion` is unsupported, system shall present an upgrade/incompatibility message and disable resume for that slot.
- Corrupt or incompatible saves shall never crash the app.

### S5 Data Integrity and Safety
- System shall use versioned serialization contracts for run state.
- Save writes shall use temp-write + replace flow (or equivalent) to reduce corruption risk.
- Save load shall validate required fields and type constraints before hydrate.

### S6 UX Feedback
- UI shall show explicit save status during autosave (`Saving...` then `Saved`).
- UI shall provide clear copy for corrupted/incompatible saves and available next actions.

## Acceptance Criteria

1. Given an active encounter, when app is closed and reopened, then Resume restores the same turn state and legal actions.
2. Given identical seed and input history, when resumed from save, then next resolution outcomes match pre-close behavior.
3. Given interrupted save write simulation, when app restarts, then previous valid save remains recoverable.
4. Given a corrupted payload, when loading, then app remains functional and user is offered safe fallback.
5. Given unsupported `schemaVersion`, when loading, then user sees incompatibility guidance and app does not crash.

## Out of Scope
- Multiple save slots.
- Cloud sync/account save.
- Cross-device migration.

## Open Questions

1. Should MVP keep one backup save revision (`current` + `previous`) for recovery?
2. Should Resume be the default highlighted action or require explicit user choice each launch?
3. Do we need an in-run manual save indicator separate from autosave status?
