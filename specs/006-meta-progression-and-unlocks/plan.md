# Spec 006 Technical Plan

## Architecture (MVP)

- Meta profile store: separate persisted state from active run save.
- Unlock catalog: data-driven unlock definitions with category and prerequisite metadata.
- Economy service: deterministic currency award computation from run outcomes.
- UI flow: post-run summary -> meta screen -> unlock purchase path.

## Modules

1. src/app/meta/profileStore.ts
- Persistent meta profile state, reset behavior, and migration version.

2. src/data/unlocks.ts
- Unlock catalog entries (cosmetic and gameplay).

3. src/engine/meta-economy.ts
- Currency award calculation and deterministic test-mode behavior.

4. src/app/components/MetaScreen.tsx
- Unlock presentation, costs, prerequisites, and purchase actions.

5. src/app/store/mapStore.ts
- Run-end hook to apply and persist meta rewards.

## Data Contracts

- MetaProfile: version, currencyBalance, unlockedIds, cosmeticSelections.
- UnlockDefinition: id, category, cost, prerequisites, effectDescriptor.
- RunMetaReward: awardedCurrency, breakdownReasons.

## Non-Functional Goals

- Unlock transactions are idempotent and crash-safe.
- Profile read/write stays independent from run-save corruption cases.
- Deterministic test fixtures produce identical reward outcomes.
