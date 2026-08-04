# Spec 008: Hero Kit and Identity Contract

## Status

Approved — hero identity contract defined; Duelist/Arcanist implementation in backlog (WC-009, WC-010)

## Goal

Lock the MVP identity, starting loadout, and balance envelope for the two playable heroes.

## Scope

Hero-specific rules for starter decks, unique mechanics, and archetype intent in one-act MVP.

## Requirements

### H1 Hero Count and Availability

- MVP shall ship with exactly two playable heroes.
- Both heroes shall be selectable at run start with equal baseline completion viability.

### H2 Identity and Fantasy

- Each hero shall have a distinct combat identity expressed through:
  1. core mechanic,
  2. starter deck composition,
  3. preferred reward synergies.
- Hero identities shall be mechanically distinguishable by turn 3 in typical encounters.

### H3 Starter Deck Contract

- Each hero shall define a fixed starter deck list with explicit card counts and tags.
- Starter decks shall respect global rules (dictionary, fatigue, turn flow) without custom exceptions unless explicitly documented.
- Starter deck power should fit common baseline encounter tuning.

### H4 Unique Mechanics

- Each hero may include one signature mechanic with clear trigger and resolution order.
- Signature mechanics shall integrate into deterministic engine order and action log readability.
- Signature mechanics shall not require UI interactions that bypass standard turn phases.

### H5 Reward/Pool Integration

- Hero-specific cards shall enter rewards via weighted pool rules.
- Neutral rewards shall remain available to all heroes.
- Unlock system integration shall not break hero identity clarity.

### H6 Balance Envelope

- Internal seed suite shall show both heroes capable of full MVP clear under intended skill assumptions.
- Neither hero shall exceed acceptable win-rate variance bounds across test seeds.
- If imbalance exceeds threshold, tuning changes shall update this spec and related tests.

## Acceptance Criteria

1. Given run start, when hero is selected, then correct starter deck and hero metadata load.
2. Given first three combat turns, when comparing heroes, then play patterns are observably distinct.
3. Given deterministic test seed set, when both heroes are simulated or playtested, then each can clear MVP within target bounds.
4. Given combat log inspection, when signature mechanic triggers, then trigger source and result are unambiguous.
5. Given reward generation, when hero-specific weighting applies, then neutral + hero pools are both represented per design constraints.

## Out of Scope

- Third hero.
- Hero-specific acts.
- Deep narrative questlines.

## Open Questions

1. Which exact two heroes are locked for MVP naming and art direction?
2. Do hero signature mechanics consume shared resources (e.g., energy/hex) or unique hero gauges?
3. What win-rate variance bounds should define acceptable balance drift in internal testing?
