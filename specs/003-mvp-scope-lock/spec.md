# Spec 003: MVP Scope Lock

## Status

Approved — all decisions locked; see .specify/memory/decisions.md for full record

## Purpose

Freeze MVP boundaries so implementation can begin without design drift.

## Locked Decisions

1. Dictionary mode

- Strict dictionary only for MVP.

2. Run structure

- One act plus one boss.

3. Heroes

- Two heroes in MVP.

4. Repeated words

- Allowed with **no penalty**, matching the source board game rules (see spec 009).

5. Combat pacing

- Snappy tactical: fast resolution with meaningful sequencing.

6. Art direction

- Dark pulp visual language.

## Design Rationale

- Strict dictionary preserves the game's word-skill identity.
- One act keeps build scope manageable while still delivering a complete run.
- Two heroes create replayability and capstone depth without requiring full multi-act content.
- Dropping the repeat-word penalty aligns with the source board game rules; fatigue (spec 009 R2) is the sole natural brake on reusing letters.
- Snappy tactical pacing aligns with deckbuilder expectations from games like Slay the Spire while preserving readability.
- Dark pulp gives a distinct visual identity and strong thematic cohesion.

## MVP Exit Criteria

1. Player can complete a full run (Act 1 and boss) with either hero.
2. At least one successful run archetype exists per hero.
3. Combat logs clearly explain all damage/block/status outcomes.
4. Core loop is stable under fixed seeds and passes deterministic engine tests.
5. UI supports dark pulp theme while maintaining accessibility requirements.

## Change Control

Any change to locked decisions requires:

- updated spec delta note,
- explicit acceptance-criteria change,
- and test impact summary.
