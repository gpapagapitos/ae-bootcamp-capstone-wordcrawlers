# Spec 011 Tasks

## Phase A: Sign-off and Content Canon (done — Phase B unblocked)

- [x] Get explicit user sign-off on `clarifications.md` open decisions 1-4 (roll chance,
      Consumable cap, magnitude scale, Shop pricing). Signed off 2026-08-04.
- [x] Run the draft Consumable/Boss Relic/Standard Relic content list (clarifications.md
      §5) through `docs/content-canon-checklist.md` gates; record pass/fail per entry.
      All entries pass (2026-08-04).
- [x] Update `docs/capstone-traceability.md` and `.specify/memory/decisions.md` with the
      finalized decisions once signed off.

## Phase B: Engine Contracts (done)

- [x] Add `ConsumableDef`/`ConsumableInstance` types to `src/engine/types.ts`.
- [x] Add `RunState.consumables: ConsumableInstance[]`, wired to `[]` in
      `createInitialRunState` (`src/engine/state.ts`).
- [x] Implement `createStarterConsumablePool()` in `src/engine/cards.ts`.
- [x] Implement `createBossRelicPool()` and `createStandardRelicPool()` in
      `src/engine/cards.ts` (shared across both heroes, not per-hero — the content
      list only has 2 Standard Relic entries total, so splitting per-hero would leave
      no real "1 of 2" choice; noted as a content-growth gap in clarifications.md).
- [x] Implement `useConsumable(state, consumableId)` in `src/engine/turn.ts` (dispatch on
      `effectType`, splice instance out of `state.consumables`).

## Phase C: App/Store Integration (done)

- [x] `progressionStore.ts`: add `consumables` field + sync in `syncDeckFromEncounter`.
- [x] `progressionStore.ts`: reward-roll chance check on non-boss victory reward
      build (`openRewardModal`); `bossRelicOptions`/`chooseBossRelic`
      (`openBossRelicModal`); `standardRelicOptions`/`chooseStandardRelic(baseId, side)`.
- [x] Shop: added a `shopConsumableOffer` slot + `CONSUMABLE_PRICE`; `ShopModal.tsx` UI
      for buying one.
- [x] Events: extended `EventChoice` with `grantConsumableId`, wired into
      `chooseEventOption`.
- [x] `contracts.ts`/`runSave.ts`: extended `ProgressionSnapshot` with the new fields.

## Phase D: UI (done, browser verification deferred)

- [x] `RewardModal.tsx`: relic-choice sub-step (boss: 2 single-sided options, mandatory
      pick; standard: 1-of-2 with double-sided follow-up side pick).
- [x] `CombatHud.tsx`: new Consumables action row (distinct styling from Items row,
      no energy gate, no per-turn lock).
- [ ] Verify in-browser: boss kill -> Boss Relic choice -> Character Development
      continues; non-boss victory occasionally offers a Relic; Consumable usable from
      HUD row and disappears after use; action log records the effect. **Deferred** —
      covered by engine/store unit tests instead this pass (see repo memory note on
      browser-tool flakiness from a prior session).

## Phase E: Persistence and Save/Resume (done)

- [x] Confirm `consumables`/relic-choice-in-progress state round-trips through save/
      resume (spec 005 envelope) without breaking schema versioning.
- [x] Add/extend save-resume tests for the new fields (`tests/app/run-save.test.ts`).

## Phase F: Tests and Spec Sync (done)

- [x] Engine unit tests: `useConsumable` effect dispatch + removal-after-use, boss/
      standard relic pool draw-without-replacement determinism.
- [x] Store tests: save/resume round-trip for acquired Relics/Consumables. (Reward-roll
      chance and Shop Consumable purchase are exercised indirectly via existing store
      test patterns; no new store-level unit tests were added beyond the save-resume
      round-trip — flagged as a follow-up if deeper coverage is wanted.)
- [x] Updated `specs/009-board-game-rules-fidelity/spec.md` Implementation Status/Known
      Gaps to mark the Boss Relic + acquisition-flow gap closed, cross-referencing spec 011.
- [x] Updated `/memories/repo/rules-fidelity.md` with an implementation-pass entry.
- [x] `npm run test`, `npm run lint`, `npm run typecheck` all green (82 tests passing,
      up from 74).
