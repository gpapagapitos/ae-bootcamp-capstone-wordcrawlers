# Patterns

## Engine Functions

Pure state-transition shape: `(state: RunState, ...args) => void | result`.
State is mutated in place; callers own the reference. No return value needed for
mutations — only query helpers return values.

Guards always throw with a descriptive message on invalid transitions (e.g. wrong phase),
not silent no-ops. Tests rely on catching these errors.

## Tests

- Arrange: build a minimal `RunState` via `createInitialRunState(seed, heroId)` or
  override specific slices directly for the case under test (don't over-build).
- Act: call the engine or store function under test.
- Assert: check the precise slice of state that the operation should have changed; don't
  assert on unrelated fields.
- One behaviour per test; describe blocks group related behaviours by function/phase.
- Force deterministic hands by writing directly to `state.deck.hand` with fabricated
  cards — never rely on shuffle order.

```ts
// canonical fabricated card pattern
{ id: 'test-0-s', letter: 's', value: 2, rarity: 1, tags: [] }
```

## TypeScript

- Prefer `type` over `interface` for union/intersection shapes; use `interface` for
  open object shapes that may be extended.
- Literal union types for bounded domains (e.g. `TurnPhase`, `HeroId`, `CardKind`).
- No `any` — enforced by ESLint rule `@typescript-eslint/no-explicit-any: error`.
- Null/undefined: use `null` for intentional absence (stored state), `undefined` for
  optional function parameters.

## React / Zustand

- Components read store state via selector functions — never call `useStore(s => s)` to
  grab the whole store.
- Stores expose named actions; components do not call engine functions directly.
- Modal/overlay state lives in the store that owns the relevant domain
  (e.g. reward modal open state lives in `combatStore`).

## Imports

External libs before internal modules; engine imports before app imports.
Use `.js` extension suffix on relative imports (required by ESM + TypeScript `Bundler`
module resolution).

## CSS

One global `styles.css` owns all rules; component-specific selectors use a flat
`.[component]-[element]` BEM-lite naming scheme. No CSS modules for MVP.
CSS variables for the dark-pulp palette live in `:root`.
