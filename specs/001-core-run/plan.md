# Spec 001 Technical Plan

## Architecture (MVP)

- Frontend: React + TypeScript for UI and interaction.
- Engine: Pure TypeScript gameplay engine module (state machine).
- Storage: Local persistence with IndexedDB or localStorage fallback.
- Testing: Vitest/Jest for engine; RTL for UI; Playwright smoke path.

## Modules

1. engine/state.ts
- Canonical run state and typed entities.

2. engine/turn.ts
- Turn transition functions: prepTurn, submitWord, passTurn, resolveClash, cleanupTurn.

3. engine/word-validation.ts
- Dictionary load and validation rules.

4. engine/combat.ts
- Damage/block/status calculation.

5. engine/rewards.ts
- Reward generation and deck mutation.

6. ui/*
- Combat screen, hand panel, enemy intent panel, map/reward/shop screens.

## Data Contracts

- Card: id, letter, value, tags, rarity, effects[]
- EnemyIntent: type, value, statusPayload
- RunState: player, deckZones, currentEncounter, mapState, rngSeed

## Non-Functional Goals

- Deterministic replays from seed.
- 60fps target for UI interactions.
- Turn resolution <100ms for engine logic.
