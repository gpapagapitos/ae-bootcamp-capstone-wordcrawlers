# Session Handoff

## Snapshot

- Date: 2026-08-03
- Build status: passing
- Lint status: passing
- Typecheck status: passing
- Unit tests: passing (49 tests across engine + app)

## Current Playable Surface

- Hero select screen (Duelist / Arcanist) gates run start and reappears after each run ends
- Act 1 route map: connected circular icon nodes (Slay-the-Spire style), fixed line/node alignment
- Node types include battle, elite, event, treasure, shop, rest, boss
- Combat HUD: hero-left/enemy-right battlefield, turn-phase stepper, inline enemy intent chip,
  fanned hand with tabletop-style Wild/Enemy Vowel cards, splay left/right, big-hit damage juice,
  legible victory/defeat overlay
- Parchment/ink tabletop visual theme (flat colors, no gradients) replacing the earlier dark
  dungeon theme, informed by the Paperback Adventures rulebook component language
- Action log and map "Next Options" footer removed (redundant with the visual feedback now in place)

## Confirmed Product Decisions

1. Strict dictionary validation
2. One act plus boss for MVP run length
3. Two heroes in MVP
4. Repeat-word damage penalty retained
5. Snappy tactical combat pacing
6. Parchment/tabletop-card visual language (supersedes the earlier "reclaimed-earth vault" dark theme)

## Implemented Core Systems

- Deterministic engine foundations
- Turn phases and transitions
- Strict word validation
- Combat resolution with repeat penalty
- Fatigue handling
- Map generation and progression store
- Hero select gating run start (WC-015)

## Important Files

- Engine: src/engine/*
- Map UI: src/app/components/MapScreen.tsx
- Map logic: src/app/map/map.ts
- Map store: src/app/store/mapStore.ts
- Combat UI: src/app/components/CombatHud.tsx
- Hero select UI: src/app/components/HeroSelectScreen.tsx
- Theme: src/styles.css
- Specs: specs/001-core-run/*
- Stack decision: docs/stack-decision.md
- UI/UX direction: docs/ui-ux-direction.md

Note: src/app/components/CardPreview.tsx is an unused prototype (not imported by App.tsx). Safe to
delete or repurpose; not part of the live app.

## Palette Direction

Current (implemented): warm parchment/cream background, dark ink-brown text, antique-gold accents,
burgundy for danger/primary actions, flat colors (no gradients). See src/styles.css `:root`.

## Next Implementation Steps

Priority order per docs/board.json backlog:

1. WC-008: Enforce map generation contract and fairness (specs/007-map-generation-contract)
2. WC-010: Hero signature mechanics and logs (specs/008-hero-kit-identity-contract)
3. WC-011 / WC-012: Meta progression profile, unlocks, and UI (specs/006-meta-progression-and-unlocks)
4. WC-013 / WC-014: Deterministic integration tests and CI quality gates

5. Word entry UX

- compose word from hand
- submit and pass actions
- invalid-word feedback messaging

3. Progression mechanics

- encounter resolution hooks (win/lose)
- reward selection flow
- shop flow

4. Test expansion

- integration test for one full encounter loop
- one e2e smoke path for map -> encounter -> result

## Run Commands

- npm install
- npm run dev
- npm run lint
- npm run typecheck
- npm test
- npm run build

## Risks / Watchlist

- Dictionary size and curation may impact player trust.
- Repeat penalty tuning may need balancing playtests.
- Visual density of card text can regress without strict review.
- Dependency audit reports high vulnerabilities in transitive packages; review before release hardening.
