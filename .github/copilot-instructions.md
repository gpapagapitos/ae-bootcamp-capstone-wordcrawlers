# Wordcrawlers Guidelines

## SpecKit Memory
The `.specify/memory/` directory holds context files maintained during spec-driven
development. Read them before generating specs, plans, or implementation:

- [constitution.md](../.specify/memory/constitution.md) — governing principles and working-file index
- [architecture.md](../.specify/memory/architecture.md) — module boundaries, state flow, invariants
- [patterns.md](../.specify/memory/patterns.md) — coding conventions established during implementation
- [decisions.md](../.specify/memory/decisions.md) — design decisions recorded during spec sessions

## Architecture
- `src/engine/**` is pure game logic (no React/DOM); `src/app/**` (stores, components) is
  the UI/state layer that wraps it. Keep that boundary — engine functions take/return
  plain state objects, never touch stores or components directly.
- Specs in `specs/NNN-*/spec.md` are the source of truth for behavior. When code and a
  spec disagree, treat it as a bug in one of them — don't silently pick one.
- **`specs/009-board-game-rules-fidelity/spec.md` governs all combat/card/enemy rules.**
  It supersedes conflicting rules in specs 001-003 (see its "Amendments to Existing
  Specs" section) and is synthesized from `docs/Paperback_Adventures_rulebook.pdf`, the
  real published board game this project adapts. Enemy vulnerabilities, splay/fatigue,
  hex/boon, penalty cards, and shop rules all live there.

## Build and Test
- `npm run test` (vitest), `npm run lint` (eslint), `npm run typecheck` (tsc --noEmit).
  Run all three before considering engine/app changes done.

## Conventions
- **Balance-affecting changes need explicit user sign-off before implementing** — e.g.
  hero HP/energy baselines, damage numbers, enemy stats. Flag the gap and ask; don't
  "fix" a stat mismatch against the rulebook on your own initiative.
- When adapting a new rulebook mechanic, update `specs/009-board-game-rules-fidelity/spec.md`
  (add/amend a rule + acceptance criteria) before or alongside the engine change, and
  cross-check specs 001-008 for now-contradicted requirements instead of leaving stale text.
- Repo memory at `/memories/repo/rules-fidelity.md` tracks the fidelity decision history,
  known gaps, and past implementation passes — check it before starting rules work.
