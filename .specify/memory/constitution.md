# Wordcrawlers Constitution

## Purpose

Build a fun, replayable, word-based roguelite with strategic deckbuilding, clear combat readability, and strong run-to-run variety.

## Principles

1. Spec before code
- No gameplay mechanic is implemented without a written requirement and acceptance criteria.
- Ambiguous rules must be resolved in a Clarifications section before coding.

2. Fun over perfect simulation
- Inspired mechanics may be adapted for digital pacing and readability.
- The game should feel fair, fast, and expressive in short sessions.

3. Deterministic core combat
- Combat resolution order must be deterministic and visible in UI.
- Randomness is allowed in draws, loot, and encounter generation only.

4. Player agency first
- Every turn must present meaningful choices: spell now, pass, spend resources, or set up future turns.
- Avoid no-win turns caused by hidden rules.

5. Preserve deckbuilder identity
- Deck composition, card fatigue/exhaustion, and reward choices must be central to progression.
- Loot and upgrades should alter strategy, not just increase numbers.

6. Testability
- Mechanics must be expressible as pure-state transitions where possible.
- Core logic requires unit tests and simulation tests before UI polish.

7. Capstone completeness
- Include product docs, architecture notes, test strategy, and CI checks.
- Show explicit traceability from requirements to implementation and tests.
