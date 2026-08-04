# Spec 006 Tasks

## Phase A: Meta Data and Contracts

- [ ] Define `MetaProfile` schema and version constant.
- [ ] Create unlock catalog data model and initial unlock entries.
- [ ] Define run-end reward breakdown contract.

## Phase B: Economy and State Management

- [ ] Implement deterministic currency award service.
- [ ] Implement meta profile persistence store.
- [ ] Implement unlock purchase transaction with prerequisite checks.
- [ ] Implement profile reset flow with confirmation path.

## Phase C: Runtime Integration

- [ ] Integrate run-end reward application into existing run flow.
- [ ] Integrate gameplay unlock flags into reward/content pools.
- [ ] Integrate cosmetic unlock selections into MVP UI surfaces.

## Phase D: UI Vertical Slice

- [ ] Build meta progression screen with currency, unlock list, and filters.
- [ ] Add unlock detail panel showing costs and prerequisites.
- [ ] Add purchase feedback and insufficient-currency states.

## Phase E: Quality and Balance Checks

- [ ] Add tests for deterministic reward outputs.
- [ ] Add tests for unlock persistence and restart behavior.
- [ ] Add tests for reset isolation from active run save.
- [ ] Add economy tuning notes and baseline pricing table in docs.
