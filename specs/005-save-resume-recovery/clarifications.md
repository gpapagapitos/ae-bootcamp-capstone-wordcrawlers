# Spec 005 Clarifications

## Decisions

1. Backup save revision
- Decision: Keep one rotating backup revision (`current` + `previous`) for MVP.

2. Launch resume default
- Decision: If an active save is healthy, Resume is the default highlighted action.

3. Manual save indicator
- Decision: No separate manual save action in MVP; autosave state indicator only.

4. Save format
- Decision: JSON payload with explicit `schemaVersion` and integrity checksum.

5. Integrity check
- Decision: Validate required fields + checksum before hydrate.

6. Corruption fallback
- Decision: Attempt load `current`, then fallback to `previous`; if both fail, mark run unrecoverable and continue app boot.

7. Autosave cadence guard
- Decision: Debounce autosave writes to avoid rapid duplicate writes within the same state tick.

## Remaining Risks

- Frequent writes may increase storage wear on lower-end devices.
- Save migrations may become brittle if state shape changes too quickly.
- Backup slot logic must be tested against interrupted-write edge cases.
