# Spec 007 Clarifications

## Decisions

1. Node count bounds (Act 1)

- Decision:
  - Combat: 6-8
  - Elite: 1-2
  - Shop: 1-2
  - Rest: 1-2
  - Event: 1-3
  - Boss: 1

2. Route safety guarantee

- Decision: At least one Start-to-Boss route must avoid Elite nodes.

3. Early danger cap

- Decision: First third of map cannot contain two high-risk nodes back-to-back on the same route.

4. Event placement

- Decision: Event nodes are capped to max 1 in first third of map.

5. Lookahead depth

- Decision: Fixed 2-layer lookahead for MVP.

6. Branching minimum

- Decision: At least two branch choice layers per map.

7. Config strictness

- Decision: Impossible constraints fail generation with explicit validation error payload.

## Remaining Risks

- Tight bounds may reduce perceived variety over many runs.
- Seed distribution may produce repeated route silhouettes without additional shape controls.
- Balance coupling between map generation and reward economy may require iterative retuning.
