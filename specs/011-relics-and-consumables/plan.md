# Spec 011 Technical Plan

## Architecture (fits existing engine/app boundary, no new layers)

- Engine layer (`src/engine/`) owns data shape + pure resolution: new `ConsumableDef`/
  `ConsumableInstance` types, `RunState.consumables`, `createStarterConsumablePool()`,
  and a `useConsumable(state, consumableId)` function mirroring the existing
  `useItem(state, itemId)` in `turn.ts` but removing the instance afterward instead of
  setting a `usedThisTurn` flag.
- Engine layer also gets `createBossRelicPool()` / `createStandardRelicPool(heroId)` in
  `cards.ts` (siblings to the existing `createHeroRelics`), returning `ItemDef[]` drawn
  without replacement — same shape already consumed by `applyRelicEffect`.
- App layer (`progressionStore.ts`) owns the reward-roll decision (RC2's chance check),
  the Boss Relic choice screen state, Consumable Shop/Rest/Event offers, and persistence
  sync — following the same pattern as the existing `boon`/`heroHp`/`items` sync in
  `syncDeckFromEncounter`.
- UI layer: extend `RewardModal.tsx` with an optional Relic-choice step (after/alongside
  the card choice), a new `ConsumableRow` in `CombatHud.tsx` (sibling to the existing
  Items row), and a Boss-Relic variant of the reward flow triggered specifically on boss
  victory (reuses `RewardModal.tsx` with a `bossRelicOptions` prop rather than a new
  component).

## Modules

1. `src/engine/types.ts`
   - `ConsumableDef`, `ConsumableInstance` (mirrors `ItemDef`/`ItemInstance` minus
     `energyCost`/`usedThisTurn`, plus nothing extra).
   - `RunState.consumables: ConsumableInstance[]`.

2. `src/engine/cards.ts`
   - `createStarterConsumablePool(): ConsumableDef[]`.
   - `createBossRelicPool(): ItemDef[]`.
   - `createStandardRelicPool(heroId): ItemDef[]` (per-hero, parallels `LIBRARY_POOLS`
     shape already established for cards in `progressionStore.ts`, but for relics).

3. `src/engine/turn.ts`
   - `useConsumable(state, consumableId)`: dispatches on `effectType` via the same small
     switch `useItem` already has, then splices the instance out of
     `state.consumables` (no `usedThisTurn` bookkeeping needed).

4. `src/engine/state.ts`
   - `createInitialRunState` wires `consumables: []` (empty at run start; acquired only
     via reward/shop/event, per RC4).

5. `src/app/store/progressionStore.ts`
   - `consumables: ConsumableInstance[]` field + sync in `syncDeckFromEncounter`
     (mirrors existing `items`/`relics` sync).
   - `rollRelicReward(seed)` — pure chance check (RC2's %, from clarifications.md once
     approved) used when building reward options after a non-boss victory.
   - `bossRelicOptions` + `chooseBossRelic(relicId)` — boss-victory-only reward step.
   - `standardRelicOptions` + `chooseStandardRelic(relicId, side)` — non-boss relic
     reward step with the double-sided side pick.
   - Shop: new offer kind `'consumable'` alongside existing card offers, priced per
     clarifications.md RC pricing once approved.
   - Event: extend `EventChoice` (already has `cardEffect`) with an optional
     `grantConsumableId` field, reusing the existing choice-application code path.

6. `src/app/components/RewardModal.tsx`
   - Optional relic-choice sub-step (props: `relicOptions`, `onChooseRelic`, and for
     double-sided standard relics, a follow-up side picker).

7. `src/app/components/CombatHud.tsx`
   - New Consumables action row, visually distinct from the Items row (per RC5), reusing
     the existing action-row button styling (`.item-button` family per
     `ui-ux-direction.md` conventions) — no new visual language needed.

8. `src/app/persistence/contracts.ts` / `runSave.ts`
   - `ProgressionSnapshot` gains `consumables`, `bossRelicOptions`, `standardRelicOptions`
     fields (loose `isRecord` validation already covers new fields, per existing pattern
     noted in repo memory for spec 007/008 passes).

## Data Contracts

- `ConsumableDef`: `{ id, name, rarity, effectType: ItemEffectType, magnitude, flavor }`.
- `ConsumableInstance`: `{ def: ConsumableDef }` (no per-turn/per-encounter mutable
  state, unlike `ItemInstance.usedThisTurn`).
- Boss Relic pool entries and Standard Relic pool entries are plain `ItemDef[]` — no new
  type needed, reusing `RelicTrigger`/`ItemEffectType` already defined in `types.ts`.

## Non-Functional Goals

- No new visual/asset requirements — Consumable row reuses existing button/icon
  conventions (flat game-UI language, no illustration assets), consistent with current
  no-art-pipeline constraint.
- Reward roll and pool draws must stay deterministic per existing seeded-RNG conventions
  (`engine/rng.ts`) — no `Math.random()` introduced, matching constitution principle 3.
- All new engine functions are pure state-in/state-out, matching constitution principle 6
  (testability) and the existing `engine/turn.ts` function shapes.
