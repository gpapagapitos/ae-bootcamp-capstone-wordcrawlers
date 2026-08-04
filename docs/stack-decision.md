# Stack Decision: Wordcrawlers MVP

## Decision Summary

Use a web-first TypeScript stack:

- Engine: TypeScript domain engine (already in place)
- Client app: React + Vite
- Rendering and effects: PixiJS (2D GPU rendering)
- State management: Zustand
- Testing: Vitest for engine, React Testing Library for UI, Playwright for one smoke path

Do not use Godot or Three.js for MVP.

## Why this is the best fit

1. The game is system-heavy, not camera-heavy.

- Word composition, card interactions, intent clarity, and map choices matter more than 3D world traversal.

2. We already invested in TypeScript engine tests.

- Keeping frontend in TypeScript preserves one language and fast iteration.

3. Slay the Spire-style map is a graph UI problem.

- It is best implemented as 2D nodes and edges with strong UX clarity, not 3D scene tooling.

4. PixiJS gives enough visual punch.

- Smooth animations, shader-capable effects, and strong performance for cards, particles, and transitions.

## Why not Three.js for MVP

- Great for 3D scenes, but overkill for card battler UX.
- Adds complexity to camera/scene lifecycle without improving core gameplay readability.
- Slower design iteration for menus, map overlays, and dense card text UI.

## Why not Godot for MVP

- Excellent engine, but introduces a parallel toolchain and language split.
- Harder to reuse TypeScript testing and CI patterns already in place.
- More friction for rapid spec-driven iteration and capstone traceability.

## UX Direction for the Map

Use a node graph map inspired by Slay the Spire:

- Node types: Battle, Elite, Event, Treasure, Shop, Rest, Boss
- Rules: choose one connected next node only
- Visibility: show 2 layers ahead to balance planning and uncertainty
- Encounter metadata: node icon, danger tint, tooltip summary, and expected rewards

## MVP Technical Boundaries

- 2D only
- Single run mode (Act 1 plus boss)
- Two heroes
- Strict dictionary validation
- Local save only

## Re-evaluation Trigger

Revisit this decision only if one of these becomes true:

1. We require fully 3D exploration scenes.
2. We require advanced authored cutscenes that exceed web stack comfort.
3. Performance budgets cannot be met with PixiJS on target devices.
