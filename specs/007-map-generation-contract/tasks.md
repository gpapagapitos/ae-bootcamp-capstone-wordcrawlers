# Spec 007 Tasks

## Phase A: Generator Contracts

- [ ] Define map generation input/output types.
- [ ] Define validated config schema for node bounds and fairness thresholds.
- [ ] Add generation version identifier to input contract.

## Phase B: Core Generation Logic

- [ ] Implement DAG shape generator from seed.
- [ ] Implement deterministic node-type assignment by configured bounds.
- [ ] Ensure Start and Boss placement and guaranteed connectivity.

## Phase C: Constraint and Fairness Validation

- [ ] Implement route enumeration/analysis utility.
- [ ] Enforce non-elite viable route guarantee.
- [ ] Enforce pre-boss sustain route requirement (Rest or Shop).
- [ ] Enforce early high-risk adjacency constraints.

## Phase D: UI Integration

- [ ] Integrate generated maps into map store with seed trace metadata.
- [ ] Render configured lookahead depth in map screen.
- [ ] Add node metadata previews for route planning.

## Phase E: Quality and Distribution Tests

- [ ] Add determinism tests for same seed/config parity.
- [ ] Add config-failure tests for impossible constraints.
- [ ] Add statistical test harness for distribution bounds across seed samples.
