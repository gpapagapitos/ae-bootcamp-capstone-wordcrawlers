# Spec 005 Tasks

## Phase A: Contracts and Persistence Foundation

- [x] Define run-save payload envelope with schema version and checksum.
- [x] Implement persistence adapter with `current` and `previous` slot keys.
- [x] Add runtime payload validation guards and typed error codes.

## Phase B: Save/Load Core Behavior

- [x] Implement atomic save write flow (write temp -> promote current -> rotate previous).
- [x] Implement load flow with fallback from `current` to `previous`.
- [x] Implement clear/abandon active run behavior.

## Phase C: Autosave Integration

- [x] Wire autosave triggers after node entry.
- [x] Wire autosave triggers after combat cleanup.
- [x] Wire autosave triggers after reward/shop/rest actions.
- [x] Add debounce/duplicate-guard for same-tick writes.

## Phase D: UX and Recovery Messaging

- [x] Add startup resume gate (Resume or Abandon).
- [x] Add save status indicator (`Saving...` / `Saved`).
- [x] Add corrupted/incompatible save fallback messaging.

## Phase E: Quality and Determinism

- [x] Add unit tests for save validation, version mismatch, and corruption fallback.
- [ ] Add integration test for close/reopen deterministic continuation.
- [ ] Add negative tests for interrupted-write simulation.
