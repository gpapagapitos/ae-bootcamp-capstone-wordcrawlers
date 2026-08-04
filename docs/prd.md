# Product Requirements Document

## 1. Vision

Create a highly replayable single-player word roguelite where players build words to attack, defend, and trigger card abilities while progressing through a dungeon run with bosses, loot, and deck evolution.

## 2. Target Experience

- Session length: 25-45 minutes per run.
- Moment-to-moment feel: tactical, readable, and rewarding.
- Combat cadence: "snappy tactical" (quick turn flow with meaningful planning).
- Skill expression: vocabulary, sequencing, risk management, and deckbuilding.

## 3. MVP Scope

- Two playable characters with distinct archetypes.
- One act plus boss.
- Core combat loop with word construction.
- Deck, draw, discard, fatigue, and reward flow.
- Loot/relic system with at least 10 relic effects.
- Slay the Spire-style node map with branching between battle, event, treasure, rest, and shop.
- Save run state locally.
- Strict local dictionary validation (no fuzzy matches in default mode).

## 3.1 Technology Stack (Locked for MVP)

- Engine: TypeScript deterministic game engine
- Frontend: React + Vite
- Rendering/effects: PixiJS
- State management: Zustand
- Testing: Vitest + React Testing Library + Playwright smoke test

## 4. Out of Scope for MVP

- Multiplayer/co-op.
- Full narrative campaign.
- Procedural art generation.
- Cloud save/accounts.
- Additional acts beyond Act 1.
- Additional boss beyond the Act 1 boss.

## 5. Functional Requirements

1. Player can form a valid word from hand cards each turn.
2. Player can choose to pass turn without playing a word.
3. Word resolves into damage/block/effects based on card text and modifiers.
4. Enemy has visible intent and acts in deterministic order.
5. Fatigue removes cards from rotation during encounters.
6. After victory, player receives at least one deckbuilding choice.
7. Player can visit shop/rest nodes and make strategic decisions.
8. Run ends on boss victory or player defeat.
9. Meta progression tracks unlocks for future runs (at least cosmetic + one gameplay unlock).
10. Word validation must use a strict dictionary in default mode.
11. Two heroes must support different build identities (e.g., aggressive chaining vs. hex control).

## 6. Success Metrics

- 80%+ of internal playtests complete a full run without rules confusion blockers.
- Average turn resolution under 8 seconds after word submit.
- At least 3 clearly distinct winning deck archetypes in MVP.

## 7. Capstone Evidence

- Spec traceability: requirement -> implementation -> tests.
- Test suite: unit + integration + light E2E.
- CI checks for lint/test/build.
- Architecture and gameplay decisions documented.
