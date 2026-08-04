# Spec 007: Map Generation and Node Distribution Contract

## Status
Draft

## Goal
Guarantee fair, replayable, and deterministic map generation for one-act MVP runs.

## Scope
Act 1 map graph generation, node distribution, and route constraints.

## Requirements

### G1 Deterministic Generation
- Map generation shall be seed-driven and deterministic.
- Given same seed and same generation version, graph topology and node types shall match exactly.

### G2 Graph Structure
- Map shall be a directed acyclic graph flowing from Start to Boss.
- Map shall provide multiple branching paths at key layers.
- All non-terminal nodes shall have at least one valid outbound connection.

### G3 Node Type Distribution
- MVP node types: Combat, Elite, Shop, Rest, Event, Boss.
- Generation shall enforce min/max counts per node type per act.
- Boss shall be unique and fixed at act end.

### G4 Route Fairness Constraints
- At least one valid route shall include a Rest or Shop before Boss.
- Elite encounters shall not be mandatory on all routes.
- Early layers shall avoid back-to-back high-risk nodes beyond configured threshold.

### G5 Visibility and Planning
- UI shall reveal current layer plus configured lookahead depth.
- Node previews shall expose type and basic risk/reward metadata.

### G6 Data Contract and Versioning
- Map generation inputs shall include seed, act config, distribution config, and generation version.
- Generation outputs shall include node IDs, layer index, type, and edges.
- Config validation shall fail fast on impossible constraints.

## Acceptance Criteria

1. Given a fixed seed, when map is generated twice, then output graph and node assignment are identical.
2. Given default config, when generating large seed samples, then node counts stay within min/max bounds.
3. Given generated maps, when route analysis runs, then every map has at least one viable Start-to-Boss path.
4. Given fairness checks, when evaluating routes, then at least one route includes pre-boss sustain option (Rest or Shop).
5. Given impossible config values, when generator runs, then it returns explicit validation errors instead of malformed maps.

## Out of Scope
- Multi-act map carryover.
- Dynamic mid-run map regeneration.
- Secret routes/hidden nodes.

## Open Questions

1. What exact min/max node counts should MVP lock for each type?
2. Should Event nodes be capped in the first third of the map?
3. Should lookahead depth differ by difficulty in future tiers?
