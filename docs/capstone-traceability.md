# Capstone Traceability Map

## Objective

Show explicit coverage of AI bootcamp outcomes through the Wordcrawlers capstone.

## Session Coverage

1. Session 1 (Agentic multi-file delivery)
- Evidence: multi-doc spec generation and coordinated updates across requirements, clarifications, and scope lock.
- Repo artifacts: specs and docs folders.

2. Session 2 (Context-first development)
- Evidence: PRD, rules adaptation notes, UI/UX direction, and constitution created before implementation.
- Repo artifacts: docs/prd.md, docs/rules-adaptation.md, docs/ui-ux-direction.md.

3. Session 3 (Discovery/design rigor)
- Evidence: feature specs with acceptance criteria, clarified decisions, and progression design.
- Repo artifacts: specs/001-core-run, specs/002-content-and-bosses.

4. Session 4 (Python/alternative backend patterns)
- Planned evidence: optional simulation/balancing service and test harness design in later specs.
- Repo artifacts: specs/006-meta-progression-and-unlocks, specs/008-hero-kit-identity-contract.

5. Session 5 (Agentic test/fix loops)
- Planned evidence: RED-GREEN-REFACTOR loops for engine transitions and combat edge cases.
- Repo artifacts: specs/005-save-resume-recovery, specs/007-map-generation-contract, future tests and CI logs.

6. Session 6 (Spec-driven development)
- Evidence: constitution + specs + clarifications + plan + tasks + scope lock.
- Repo artifacts: .specify/memory/constitution.md and specs/*.

7. Session 7 (CI/CD and platform posture)
- Planned evidence: lint/test/build pipeline, optional deployment workflow, and evidence-based PR docs.
- Repo artifacts: future .github/workflows and release notes.

## Newly Added Spec Scaffolds

- Spec 005: run save/resume/recovery contract plus clarifications, plan, and tasks.
- Spec 006: meta progression and unlock economy contract plus clarifications, plan, and tasks.
- Spec 007: deterministic map generation contract plus clarifications, plan, and tasks.
- Spec 008: two-hero identity/balance contract plus clarifications, plan, and tasks.
- Spec 009: board game rules fidelity contract, reconciling the adapted design with the
  literal Paperback Adventures rulebook (splay, hex/boon economy, top-card fatigue,
  enemy stage flip, Character Development loop). Supersedes conflicting decisions in
  specs 001 and 003 (repeat-word penalty removed).

## Requirement-to-Evidence Method

For each implemented feature:
- link spec requirement ID,
- link code module,
- link test case,
- link PR evidence.

This map will be expanded during implementation to support capstone review.
