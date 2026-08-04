# Spec 007 Technical Plan

## Architecture (MVP)

- Pure deterministic map generator driven by seed + validated config.
- Constraint pass pipeline: shape generation -> node assignment -> fairness validation.
- Separate map config object for testability and tunable distributions.

## Modules

1. src/app/map/generator.ts
- Main map generation entrypoint returning graph structure.

2. src/app/map/config.ts
- Node distribution bounds and fairness thresholds.

3. src/app/map/constraints.ts
- Route analysis and fairness validation helpers.

4. src/app/map/types.ts
- Map node, edge, layer, and generation result types.

5. src/app/components/MapScreen.tsx
- Lookahead rendering and node metadata previews.

## Data Contracts

- MapGenerationInput: seed, configVersion, distributionConfig.
- MapGraph: nodes, edges, startNodeId, bossNodeId.
- ValidationError: code, message, details.

## Non-Functional Goals

- Generation runtime under 20ms per map on standard dev machine.
- Impossible configs fail with explicit error payloads.
- Same seed and config version always yield identical graph output.
