# Content Canon Checklist

## Purpose

Use this checklist before adding any monster, boss, item, relic, hero card, or letter card.
If an entry does not pass this checklist, it is not canon-ready.

## Source of Truth

- World and tone canon: docs/bible.md
- Product constraints: docs/prd.md
- Rules and mechanics language: docs/rules-adaptation.md
- UI readability constraints: docs/card-readability-guidelines.md

## 1. Theme Gate (Must Pass)

- Fits Vault Reclaimed tone: reclaimed earth, overgrowth, weathered relics, survival-forward fantasy.
- Avoids neon sci-fi and pulp-noir framing.
- Uses established faction and naming language from docs/bible.md.

## 2. Mechanical Role Gate (Must Pass)

- Declares one primary gameplay role.
- Uses approved effect vocabulary:
  - draw, lock, refine, preserve, echo, root, hex, stun
- States timing window clearly:
  - on compose, on submit, on clash, on cleanup, passive
- Includes at least one balancing limit:
  - cost, cooldown, once per turn, conditional trigger, or opportunity tradeoff

## 3. Readability Gate (Must Pass)

- Effect can be understood in less than 8 seconds.
- Numeric values are explicit and unambiguous.
- Card text is short enough for the current card readability constraints.
- Uses existing terminology consistently (no synonyms for the same mechanic).

## 4. Taxonomy Gate (Must Pass)

Tag each entry with exactly one from each category:

- Class:
  - enemy, boss, item, relic, hero-card, letter-card
- Letter family (only for letter-card):
  - striking, flow, root, wild, relic
- Rarity:
  - common, uncommon, rare, boss-legendary

## 5. Consistency Gate (Must Pass)

- Does not duplicate an existing card or enemy pattern.
- Name follows bible naming conventions.
- Flavor does not contradict existing factions, heroes, or world assumptions.

## 6. Playtest Gate (Must Pass)

- One sentence hypothesis:
  - "This should make X play pattern stronger/weaker."
- One measurable result:
  - win rate impact, average turn count, damage swing, or hand smoothness.
- One rollback condition:
  - exact threshold that triggers revert or retune.

## Canon Entry Template

Use this template for all new content proposals.

### Name

- [content name]

### Classification

- class: [enemy|boss|item|relic|hero-card|letter-card]
- rarity: [common|uncommon|rare|boss-legendary]
- letter family: [striking|flow|root|wild|relic|n/a]

### Flavor Intent

- [1-2 lines aligned with Vault Reclaimed]

### Mechanical Contract

- timing: [compose|submit|clash|cleanup|passive]
- effect: [approved vocabulary + values]
- limits: [cost/cooldown/condition/tradeoff]

### Readability Text (Player-Facing)

- [final short text shown in UI]

### Balance Notes

- hypothesis: [expected behavior]
- metric: [what we will measure]
- rollback trigger: [exact threshold]

## MVP Content Targets

Use this as the minimum initial content budget.

- Enemies: 8 standard + 3 elite
- Bosses: 1 act boss
- Relics/Items: 10 total
- Letter cards: 24 commons, 12 uncommons, 6 rares
- Hero identity cards: 6 per hero

## Next Build Order

1. Lock first enemy roster names and intent loops.
2. Lock first relic/item set using approved vocabulary only.
3. Lock first letter-card pool by family and rarity.
4. Run one balance pass with strict rollback triggers.
5. Promote only passing entries into production data.
