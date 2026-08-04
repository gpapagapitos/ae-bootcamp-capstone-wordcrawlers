# Spec 005 Technical Plan

## Architecture (MVP)

- Persistence layer: localStorage-first adapter with atomic write strategy (`current` + `previous`).
- Serialization: typed run-state snapshot with schema version metadata.
- Validation: runtime payload guards before hydrate.
- UI integration: app bootstrap resume gate and save-status indicator.

## Modules

1. src/app/persistence/runSave.ts

- Save/load/clear API, rotating backup handling, checksum and version checks.

2. src/app/persistence/contracts.ts

- Save payload types and schema version constants.

3. src/app/persistence/validate.ts

- Required field guards and integrity verification.

4. src/app/store/combatStore.ts

- Autosave trigger hooks after state transitions.

5. src/App.tsx

- Resume/abandon flow at startup and corrupted-save messaging path.

## Data Contracts

- RunSaveEnvelope: schemaVersion, savedAt, checksum, payload.
- RunSavePayload: full deterministic run state snapshot.
- SaveLoadResult: ok/error variant with reason codes.

## Non-Functional Goals

- Resume load under 100ms on standard dev machine.
- No app crash on malformed save payload.
- Deterministic continuity preserved across close/reopen.
