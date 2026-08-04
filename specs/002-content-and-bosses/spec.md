# Spec 002: Content, Bosses, and Loot Identity

## Status

Approved — content requirements locked; enemy/boss authoring deferred to post-MVP backlog

## Goal

Define the minimum content set that makes runs feel like a roguelite, not a prototype.

## Requirements

### C1 Enemy Variety

- At least 8 normal enemies and 3 elites for MVP.
- Enemy intents include at least: Attack, Block, Hex, Debuff, Charge.

### C2 Boss Design

- One boss in MVP with multi-stage behavior.
- Boss stage transition shall include an immediate behavior shift and telegraphed next intent.
- Superseded by spec 009 R7 (Enemy Two-Stage Design) and R11 (Word Repetition): per the
  literal rulebook, repeating a word carries no penalty, so no boss may punish repeat
  words. Bosses must instead differentiate stages via intent set, hex/boon pressure
  (R4), or Enemy Vowel timing (R5) — not word-repetition detection.

### C2.1 Post-MVP Boss Expansion

- Add a second boss after MVP to increase run variety without changing core combat rules.

### C3 Loot and Relics

- At least 20 card rewards and 10 relics.
- Relics must support 3 archetypes: Aggro Words, Hex Control, Draw/Combo.
- Reward screen shall present meaningful tradeoffs, not strict upgrades.

### C4 Dungeon Progression

- Node types: Combat, Elite, Shop, Rest, Event, Boss.
- Act completion grants a major reward choice.

### C5 Difficulty and Fairness

- Enemy scaling shall depend on act and run seed, not player streak.
- MVP includes Ascension 0 only, but architecture supports future difficulty tiers.

## Acceptance Criteria

1. Playtests can identify distinct enemy behaviors by turn 3.
2. No enemy, boss or otherwise, tracks or penalizes repeated words (spec 009 R11).
3. Bosses require strategy changes between phase 1 and phase 2.
4. At least 3 deck archetypes can defeat a full MVP run.
5. Shop and reward choices produce non-trivial decisions in most encounters.
