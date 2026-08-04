# Spec 008 Technical Plan

## Architecture (MVP)

- Hero definitions are data-driven with explicit starter deck/relic and signature tags.
- Combat engine resolves signature mechanics through existing phase pipeline.
- Reward generation reads hero identity weights from content config.

## Modules

1. src/data/heroes.ts

- Hero definitions, identity metadata, starter deck IDs, starter relic IDs.

2. src/data/cards.ts

- Hero-tagged card pools and neutral pool references.

3. src/engine/combat.ts

- Signature trigger insertion points and deterministic resolution hooks.

4. src/engine/rewards.ts

- Hero-aware reward weighting and pool composition.

5. src/app/components/HeroSelect.tsx

- Hero selection UI and run-start initialization binding.

## Data Contracts

- HeroDefinition: id, name, identity, starterDeck, starterRelic, signatureRules.
- SignatureRule: triggerPhase, condition, effectRef, priority.
- RewardPoolWeights: neutralWeight, heroSpecificWeight.

## Non-Functional Goals

- Signature mechanics are fully represented in action logs.
- Hero selection to run start is deterministic under fixed seed.
- Internal balance suite can compare hero outcomes across shared seed sets.
