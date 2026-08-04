# Architecture

> Established during spec 001 (core run) and refined through specs 005–009.
> The engine/app boundary emerged from the spec 001 testability principle (constitution §6)
> and the save/resume determinism requirement in spec 005.

## Module Boundaries

`src/engine/` is the pure game logic layer — no React, no DOM, no stores. Functions take
and return plain state objects. This boundary is enforced by convention and must not be
crossed (importing Zustand or React into engine files is a bug).

`src/app/` is the UI/state layer that wraps the engine:
- `store/` — Zustand stores that own React-visible state and call engine functions
- `components/` — React components that read stores and render UI
- `combat/` — UI-layer combat helpers (selectors, auto-word suggestions) that depend on
  store shape, not engine internals
- `map/` — map generation and node selection logic (graph operations, no engine state)
- `persistence/` — save/resume adapters (serialize RunState to/from localStorage)
- `content/` — authored data (events, enemies, cards) with no logic

`src/data/` contains static reference data (dictionary word set).

`tests/` mirrors the `src/` structure: `tests/engine/` for engine unit tests,
`tests/app/` for store/selector/persistence tests.

## State Flow

```
User action (React event)
  → combatStore / mapStore / progressionStore (Zustand)
      → engine function (src/engine/turn.ts, combat.ts, state.ts)
          → mutates RunState (plain TS object)
      → store updates derived React state
  → React re-renders from store slice
```

`RunState` is the canonical run snapshot. It travels through:
1. Engine functions (mutated in place)
2. combatStore (holds the live reference)
3. persistence/runSave.ts (serialises to save envelope for localStorage)

## Key Invariants

- `RunState` is never created or mutated in components — only in stores and engine.
- Stores never import from each other; cross-store reads use Zustand `getState()`.
- Map generation is pure: same seed → same ActMap, every time.
- Save envelopes are schema-versioned with a CRC32 checksum to catch corruption.

## File Naming

- Engine types: `src/engine/types.ts` (single source of truth for all shared types)
- Engine entry: `src/engine/index.ts` (re-exports only; no logic)
- Stores: `src/app/store/[domain]Store.ts`
- Components: `src/app/components/[ScreenOrWidget].tsx`
