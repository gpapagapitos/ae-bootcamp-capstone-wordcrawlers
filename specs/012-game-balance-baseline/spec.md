# Spec 012: Game Balance Baseline

## Status

Approved — current values are v0.1 baselines, tunable via playtesting. All changes to
numbers in this spec require explicit sign-off before implementation (see
`.github/copilot-instructions.md`).

## Goal

Document the intended combat feel and the specific numeric baselines that produce it, so
that future tuning changes are intentional and traceable rather than accidental.

## Intended Feel

| Scenario                     | Target feel                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Starter hand vs normal enemy | 2–3 words should defeat a normal enemy; no single word should one-shot                       |
| Mid-run deck vs elite        | Combat takes 4–6 turns; a wrong splay on a key turn is punishing but not fatal               |
| Full run vs Act 1 boss       | Stage 1 should take 5–7 turns; Stage 2 harder, demanding splay discipline                    |
| Penalty card in hand         | Manageable if played; 1 HP drain per unplayed card creates tension without instant death     |
| Energy economy               | Most turns generate 1–2 energy from splay choices; items feel like multipliers, not crutches |

---

## Baseline Values (v0.1)

### Hero

| Stat               | Value | Source     | Rationale                                                                               |
| ------------------ | ----- | ---------- | --------------------------------------------------------------------------------------- |
| Starting HP        | 20    | `state.ts` | Low enough that 3–4 unblocked hits are dangerous; high enough to survive early mistakes |
| Starting energy    | 3     | `state.ts` | Covers one mid-tier item activation per encounter start                                 |
| MAX_ENERGY         | 6     | `state.ts` | Prevents energy snowball in long fights; see inline comment in `state.ts`               |
| Starting hand size | 7     | `state.ts` | Enough letters to spell 2–3 short words per turn pool; matches board-game starting hand |
| Starter deck size  | 10    | `state.ts` | All starters used in first hand if splay is efficient; light fatigue pressure by turn 2 |

### Letter Card Edge Values

Vowels give **reach** (energy on right splay); consonants give **weight** (blocks on left splay).

| Card type | Left edge                    | Right edge                   | Base value |
| --------- | ---------------------------- | ---------------------------- | ---------- |
| Vowel     | `hits=V, blocks=0, energy=0` | `hits=V, blocks=0, energy=1` | V = 1      |
| Consonant | `hits=V, blocks=1, energy=0` | `hits=V, blocks=0, energy=0` | V = 2      |

`V` = the card's `.value` field. Common starters use V=1 (vowel) or V=2 (consonant).
Higher-rarity rewards will introduce V=3–5.

**Why this split:**

- Vowel-heavy words (right splay) generate energy for items; consonant-heavy words
  (left splay) accumulate block. This makes splay direction a real tactical choice.
- A 4-letter word with 2 vowels + 2 consonants deals 6 hits on either splay — predictable,
  readable floor for the player.

### Rarity Tiers and Reward Pricing

| Rarity   | `.rarity` value | Typical hit value | Reward pool weight |
| -------- | --------------- | ----------------- | ------------------ |
| Common   | 1               | 1–2               | 60%                |
| Uncommon | 2               | 2–3               | 30%                |
| Rare     | 3               | 3–5               | 10%                |

Fatigue targets the lowest-rarity eligible card in the word. This means commons leave the
pool fastest, creating natural deck thinning pressure toward higher-value cards over a run.

### Enemy Stat Guidelines

| Enemy tier   | HP range | Attack intent range | Notes                                                              |
| ------------ | -------- | ------------------- | ------------------------------------------------------------------ |
| Normal       | 10–18    | 2–4                 | Defeated in 2–3 words from a fresh deck                            |
| Elite        | 20–30    | 3–6                 | Requires at least one splay optimization to stay healthy           |
| Boss Stage 1 | 25–35    | 3–6                 | Needs sustained engagement; one bad turn recoverable               |
| Boss Stage 2 | 15–25    | 4–8                 | Shorter HP pool but higher pressure; stage flip should feel urgent |

**Act 1 Boss (The Ink Warden) — current values:**

|                 | Stage 1                            | Stage 2                            |
| --------------- | ---------------------------------- | ---------------------------------- |
| HP              | 28                                 | 18                                 |
| Intent rotation | attack 3, block 2, hex 1, charge 5 | attack 5, hex 1, attack 2, block 3 |
| Weak vowel      | `i`                                | —                                  |

Charge (value 5) is Stage 1's hardest hit. Stage 2 leads with attack 5 — punishing a
player who enters Stage 2 with no block built up.

### Penalty Card

| Property                     | Value                      | Rationale                                                                     |
| ---------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| HP cost per unplayed penalty | 1                          | Noticeable but not spiral-inducing at low counts; painful at 3+ unplayed      |
| Pool size                    | 7 (one per penalty letter) | Limited supply prevents indefinite penalty spam from enemy effects            |
| Penalty letters              | q z x j v w k              | Hardest to incorporate in English words; adds real word-construction pressure |

---

## Acceptance Criteria

These are playtest targets, not automated tests. A balance pass is complete when a
majority of test runs against each criterion succeed.

1. A starter deck can reach boss Stage 2 in a fresh run without items or relics.
2. A boss Stage 2 loss should feel like a player decision failure, not RNG.
3. No normal enemy requires more than 5 turns to defeat with a stock starter deck.
4. A 4-letter word should deal at least 6 hits before block on most starters.
5. Energy reaches MAX (6) in fewer than 10% of turns in a typical run — energy is a
   scarce resource, not a floor.
6. Penalty card accumulation of 3+ cards in hand creates visible HP drain but does not
   immediately lose a fight from full health.

---

## Tuning Guidance

- **To increase difficulty**: raise enemy HP or attack intent values, not hero starting HP.
  Lowering hero HP risks making early enemy attacks unrecoverable.
- **To improve flow**: reduce normal enemy HP (faster fights) rather than reducing their
  attack intent (that removes tension).
- **To adjust splay incentives**: tune the `energy` value on vowel right-edge or the
  `blocks` value on consonant left-edge independently. These are the primary levers.
- **To widen deck building expression**: increase rarity 3 card hit values (V=4–5) —
  this makes rare rewards feel meaningfully better without breaking normal-enemy pacing.

## Change Control

Any change to a numeric baseline in this spec must update this file alongside the code
change in the same commit. Balance changes without a spec update are rejected in review.
