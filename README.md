# Wordcrawlers

A single-player word-building roguelite where you spell words to fight enemies, build your
deck, and climb a branching dungeon. Inspired by Paperback Adventures and Slay the Spire.

Built as an AI engineering bootcamp capstone demonstrating spec-driven development,
context-first AI workflows, agentic TDD loops, and CI/CD quality gating.

## Play It

```bash
npm install
npm run dev        # http://localhost:5173
```

## What's Built

- **Branching dungeon map** — Slay the Spire-style node selection (Battle, Elite, Event,
  Treasure, Shop, Rest, Boss) with seeded deterministic generation
- **Word combat** — spell words from your hand to deal damage, trigger abilities, and
  manage fatigue; splay direction (left/right) selects top card and edge values
- **Deck building** — reward picks, shop buy/remove, rarity tiers, hex/boon economy
- **Two hero archetypes** — Duelist and Arcanist (identity contracts in spec 008)
- **Save / resume** — schema-versioned local save with checksum and automatic backup slot
- **Tutorial mode** — guided first-run overlay
- **Dark pulp visual language** — Cinzel headings, sepia palette, ink textures

## Stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Engine   | TypeScript (pure, no DOM)                              |
| Frontend | React 19 + Vite                                        |
| State    | Zustand                                                |
| Effects  | PixiJS                                                 |
| Tests    | Vitest — 74 tests across 11 suites                     |
| CI       | GitHub Actions (board check → lint → typecheck → test) |

## How It Was Built

This project followed the full bootcamp session stack end-to-end:

| Session | Practice                    | Evidence in this repo                                                                      |
| ------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| 1       | Agentic multi-file delivery | Engine, specs, and UI scaffolded in coordinated agent sessions                             |
| 2       | Context-first development   | `.github/copilot-instructions.md`, `.specify/memory/` read by Copilot before every session |
| 3       | Discovery and design rigor  | PRD, 10 feature specs with acceptance criteria, clarifications, and plans                  |
| 5       | Agentic TDD loops           | Engine-first implementation; tests written alongside each module                           |
| 6       | Spec-driven development     | Constitution → decisions → specs → plans → tasks → implementation                          |
| 7       | CI/CD and platform posture  | GitHub Actions pipeline; board integrity enforced in CI                                    |

## Project Structure

```
.specify/memory/      SpecKit context files (constitution, architecture, patterns, decisions)
specs/NNN-*/          Feature specs: spec → clarifications → plan → tasks
docs/                 PRD, stack decision, rules adaptation, board, handoff, bible
src/engine/           Pure game logic — no React, no stores
src/app/              Zustand stores, React components, persistence adapters
tests/                Unit and integration tests mirroring src/ structure
scripts/              Board CLI (board.mjs) and handoff snapshot (handoff.mjs)
.github/workflows/    CI pipeline
```

## Dev Commands

```bash
npm test                          # run all tests
npm run lint                      # eslint
npm run typecheck                 # tsc --noEmit
npm run build                     # production build

npm run board:add -- --title "..."   # add a board item
npm run board:move -- --id WC-001 --status in-progress
npm run board:done -- --id WC-001
npm run board:render              # regenerate docs/board.md from docs/board.json
npm run board:check               # verify board.md matches board.json (runs in CI)
npm run handoff:snapshot          # append session snapshot to docs/handoff.md
```

## Continuing From Here

1. Read `docs/handoff.md` for the latest session snapshot
2. Read `docs/board.md` for open work items
3. Read `.specify/memory/constitution.md` → `decisions.md` → `architecture.md` for context
