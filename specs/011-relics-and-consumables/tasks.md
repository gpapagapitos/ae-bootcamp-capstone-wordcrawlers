# Spec 011 Tasks

## Phase A: Sign-off and Content Canon (done — Phase B unblocked)

- [x] Get explicit user sign-off on `clarifications.md` open decisions 1-4 (roll chance,
      Consumable cap, magnitude scale, Shop pricing). Signed off 2026-08-04.
- [x] Run the draft Consumable/Boss Relic/Standard Relic content list (clarifications.md
      §5) through `docs/content-canon-checklist.md` gates; record pass/fail per entry.
      All entries pass (2026-08-04).
- [x] Update `docs/capstone-traceability.md` and `.specify/memory/decisions.md` with the
      finalized decisions once signed off.

## Phase B: Engine Contracts

- [ ] Add `ConsumableDef`/`ConsumableInstance` types to `src/engine/types.ts`.
- [ ] Add `RunState.consumables: ConsumableInstance[]`, wired to `[]` in
      `createInitialRunState` (`src/engine/state.ts`).
- [ ] Implement `createStarterConsumablePool()` in `src/engine/cards.ts`.
- [ ] Implement `createBossRelicPool()` and `createStandardRelicPool(heroId)` in
      `src/engine/cards.ts`.
- [ ] Implement `useConsumable(state, consumableId)` in `src/engine/turn.ts` (dispatch on
      `effectType`, splice instance out of `state.consumables`).

## Phase C: App/Store Integration

- [ ] `progressionStore.ts`: add `consumables` field + sync in `syncDeckFromEncounter`.
- [ ] `progressionStore.ts`: `rollRelicReward` chance check on non-boss victory reward
      build; `bossRelicOptions`/`chooseBossRelic`; `standardRelicOptions`/
      `chooseStandardRelic(relicId, side)`.
- [ ] Shop: add `'consumable'` offer kind + pricing; `ShopModal.tsx` UI for buying one.
- [ ] Events: extend `EventChoice` with `grantConsumableId`, wire into
      `chooseEventOption`.
- [ ] `contracts.ts`/`runSave.ts`: extend `ProgressionSnapshot` with the new fields.

## Phase D: UI

- [ ] `RewardModal.tsx`: relic-choice sub-step (boss: 2 single-sided options, mandatory
      pick; standard: 1-of-2 with double-sided follow-up side pick).
- [ ] `CombatHud.tsx`: new Consumables action row (distinct styling from Items row,
      no energy gate, no per-turn lock).
- [ ] Verify in-browser: boss kill -> Boss Relic choice -> Character Development
      continues; non-boss victory occasionally offers a Relic; Consumable usable from
      HUD row and disappears after use; action log records the effect.

## Phase E: Persistence and Save/Resume

- [ ] Confirm `consumables`/relic-choice-in-progress state round-trips through save/
      resume (spec 005 envelope) without breaking schema versioning.
- [ ] Add/extend save-resume tests for the new fields (`tests/app/run-save.test.ts`).

## Phase F: Tests and Spec Sync

- [ ] Engine unit tests: `useConsumable` effect dispatch + removal-after-use, boss/
      standard relic pool draw-without-replacement determinism.
- [ ] Store tests: reward-roll determinism (fixed seed -> fixed outcome), Shop
      Consumable purchase, event `grantConsumableId` application.
- [ ] Update `specs/009-board-game-rules-fidelity/spec.md` "Known Gaps"/Implementation
      Status section to mark the Boss Relic + acquisition-flow gap closed, cross-
      referencing spec 011.
- [ ] Update `/memories/repo/rules-fidelity.md` with an implementation-pass entry once
      shipped (matching the existing pass-log convention in that file).
- [ ] Run `npm run test`, `npm run lint`, `npm run typecheck` — all green before calling
      this spec done.
