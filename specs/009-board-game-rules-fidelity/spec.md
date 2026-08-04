# Spec 009: Board Game Rules Fidelity Contract

## Status

Approved — supersedes conflicting rules in specs 001–003; splay, hex/boon, top-card fatigue, and Enemy Vowel implemented in src/engine/

## Source of Truth

`docs/Paperback_Adventures_rulebook.pdf` (24 pages, full rules + errata). This spec is the
authoritative synthesis of that rulebook into Wordcrawlers terms. Where this spec and any
earlier spec (001-008) conflict on core combat mechanics, this spec wins; earlier specs are
amended (see "Amendments to Existing Specs" below).

## Goal

Reconcile the adapted roguelite design (specs 001-003) with the literal card-game mechanics
of Paperback Adventures, per the "Hybrid" fidelity decision: keep the roguelite run
structure (branching map, meta-progression, hero kits, save/resume) but replace the
core combat/economy rules with the literal board game systems wherever one exists.

## Decision Record

1. Fidelity level: **Hybrid**. Roguelite framing (specs 005-008) stays. Core combat,
   card anatomy, resource economy, and Character Development loop are replaced with the
   literal rulebook systems described below.
2. Repeat-word penalty (specs 001 R-decisions, 003 item 4): **Dropped**. The rulebook has
   no penalty for repeating a word. Words may be repeated freely; only the fatigue rule
   (top card of the word is removed from play) limits reuse of specific letters.
3. Spec organization: this is a **new consolidated spec** rather than edits scattered
   across 001-008. Existing specs are amended with pointers, not duplicated.

## Retained From Existing Specs (Unchanged)

- Run structure: branching node map (Combat, Elite, Shop, Rest, Event, Boss) per spec 007.
- Meta-progression currency and unlock tracks per spec 006.
- Two-hero MVP roster and identity contract per spec 008 (Core-card hex/boon split below
  becomes each hero's signature mechanic substrate).
- Save/resume/recovery contract per spec 005.
- Card visual/a11y contract per spec 004, extended with new zones (see R2).
- Strict-dictionary word validation, minimum length 2, profanity filter (spec 003).

## Adopted Literal Core Mechanics

### R1 Card Anatomy (Dual-Edge + Splay)

- Every Letter card shall define a left-edge value set and a right-edge value set, each
  composed of `hits`, `blocks`, and `energy` counts.
- When forming a word, the player shall choose a splay direction: **left** or **right**.
  - Splay left: the **last** letter in the word becomes the top card; only left-edge
    values count from every card in the word.
  - Splay right: the **first** letter in the word becomes the top card; only right-edge
    values count from every card in the word.
- The top card's ability text (if any) activates once during the Clash phase.
- Engine shall reject word submission without an explicit splay direction.

### R2 Top-Card Ability and Fatigue

- Only the top card of the played word activates its ability text.
- During Cleanup, the top card (and only the top card) moves to the fatigue pile, unusable
  for the remainder of the encounter (not shuffled back at draw-exhaustion).
- The rest of the played word and unused hand cards move to discard.
- If the top card is a Wild card, Letter-of-Choice card, or Penalty card (see R4, R6),
  the card directly beneath it becomes the effective top card for both ability and
  fatigue purposes, recursing downward if that card is also one of those types.
- **FAQ clarification (fatigue-revival)**: if an effect returns a card from the fatigue
  pile to the hero's hand/deck/discard, and that card is normally exempt from one of
  those zones (e.g. an Enemy Vowel pseudo-card, R5), it returns to its own zone of play
  instead (never fabricating a hand/deck/discard entry for a zone-exempt card kind).
- **FAQ clarification (choosing what to fatigue)**: any effect that lets the player
  choose a card to fatigue may never choose a Wild card or Letter-of-Choice card (R3); if
  an effect would unconditionally fatigue one of those, ignore that part of the effect
  instead (they are not zone-tracked, so there is nothing to move).

### R3 Wild Cards and Letter-of-Choice Cards

- Each hero has access to a Wild card that is always available to help spell a word, is
  never in hand, never enters deck/discard/fatigue, and contributes no hits/blocks/energy.
- Playing a word **without** using the Wild card grants +1 energy at end of turn.
- Letter-of-Choice cards (granted by specific item/relic effects) behave identically to
  Wild cards for word legality but do not grant the no-Wild energy bonus; they are
  returned to a shared pool after use.

### R4 Hex and Boon Dual Resource

- Hero state shall track `hex` and `boon` counters in addition to `hp`, `block`, `energy`.
- Enemy state shall track `hex` and `boon` counters in addition to `hp`, `block`.
- Hex negatively affects its holder; some enemy actions apply hex to the hero, some hero
  effects apply hex to the enemy.
- Boon positively affects its holder and persists across encounters within a run (unlike
  hex, which resets to zero at Character Development).
- Boons are the currency spent at Shop nodes (see R9).
- **FAQ clarification (spend-hexes wording)**: when an item/Core Card effect says to
  "spend hexes," it means the hexes the hero has applied to the _enemy_ (i.e. remove them
  from the enemy's hex counter), not any hex on the hero. A hex-keyed Core Card (R9)
  should read as: convert N hex currently on the enemy into an effect (e.g. HP loss equal
  to hex spent), gated by an energy-tier cost table, and the player never gets to choose a
  partial amount to spend below what the full effect requires — the effect either
  triggers at its full, hex-count-driven magnitude or not at all if the energy tier isn't met.

### R5 Enemy Weak-Vowel Mechanic

- Each enemy (unless its special rules say otherwise) exposes one weak-spot vowel drawn
  from its name.
- While that enemy is active, the hero has access to an extra "Enemy Vowel" pseudo-card
  usable in any word, contributing standard edge values, with one special ability: if it
  is the top card, it advances the enemy's intent index to the next action immediately.
- The Enemy Vowel pseudo-card fatigues after use and is unavailable for the rest of the
  encounter; it resets/returns at the start of the next encounter.

### R6 Penalty Cards

- Certain rewards/enemy effects add a Penalty card to the hero's deck or discard pile.
- Penalty cards provide no hits/blocks/energy and have no ability (pass-through per R2).
- If a Penalty card remains in hand unplayed at Cleanup, its negative effect triggers
  before it moves to discard.
- Most Penalty cards return to a shared Penalty pool after being played (from the bottom);
  a Penalty card cannot be selected as the card removed/replaced during rewards or Shop.
- **FAQ clarification (pool exhaustion)**: if an effect would add a Penalty card but the
  shared Penalty pool is empty, ignore that part of the effect instead of erroring or
  fabricating a card.
- **FAQ clarification (vowel/consonant classification)**: for any card-text distinction
  between "vowels" and "consonants," Wild cards, Letter-of-Choice cards, Penalty cards,
  and Enemy Vowel pseudo-cards all count as whichever category their assigned/represented
  letter falls into (a Wild card assigned letter 'e' counts as a vowel, etc.); Penalty
  cards with no letter identity count as neither and never satisfy a vowel/consonant
  requirement. `Y` is classified as whichever of vowel/consonant is more favorable to the
  player for the specific card being resolved (matches the rulebook FAQ's ruling to avoid
  linguistic edge-case disputes).

### R7 Enemy Two-Stage Design

- Each enemy (Lackey or Boss) defines Stage 1 and Stage 2 data: HP, intents, and special
  rules, which may differ between stages.
- When Stage 1 HP reaches 0, the enemy flips to Stage 2: HP resets to the Stage 2 value
  plus any overflow damage carried over, the enemy is stunned for the current turn (takes
  no action), and its intent index resets to the first Stage 2 intent for next turn.
- When Stage 2 HP reaches 0, the enemy is defeated and Character Development begins (R8).
- Special-rule changes tied to the stage flip apply immediately, before any further damage
  or effects resolve.
- **FAQ clarification (intent index vs. stun, implemented)**: a stun, by itself, has no
  inherent effect on the enemy intent index. The intent index advances every turn
  _unless_ the enemy was stage-flipped that same turn (the flip's own reset to the first
  Stage 2 intent, above, is the only thing that suppresses the normal advance). A stun
  caused by any other unique card ability still lets the index advance normally at
  Cleanup, even though the enemy takes no action that turn.
- **FAQ clarification (block vs. stun timing)**: enemy Block is generated as part of
  resolving its action/intent, so a stun that lands _before_ that action resolves (e.g. a
  Prep-phase item effect) prevents the Block from being granted at all. A stun applied
  _after_ the action already resolved (e.g. from combined Clash-phase hits reducing the
  enemy to a stun-triggering condition) does not retroactively remove Block already
  granted that turn — only a future turn's action is skipped.

### R8 Character Development Sequence

On defeating any enemy (Lackey or Boss), in order:

1. Reset hero `hex` and `energy` to 0. Hero `hp` and `boon` carry over unchanged.
2. Clear the enemy from the encounter slot; reset all enemy counters.
3. Return any Enemy Vowel / Letter-of-Choice pseudo-cards to their shared pools.
4. Revert any single-use (flipped) or rotated (ongoing) item cards to their default state.
5. If a Penalty card was in the final word, return it to the Penalty pool.
6. Reshuffle every hero Letter card (deck, hand, word-in-progress, discard, fatigue) into
   a single deck.
7. Grant the reward: Lackey rewards **replace** a card in the deck; Boss rewards **add** a
   card to the deck and may grant a Boss Relic (McGuffin-equivalent). Card
   replacement/addition from a reward or Shop purchase is mandatory once a reward card or
   purchase is chosen — the player cannot decline to apply the swap/addition after
   selecting it. When a reward offers "choose N to keep" from a larger revealed set, the
   cards not kept return to the bottom of the pool they were drawn from (or the top, if
   drawn from a McGuffin/Relic pool).

- **FAQ clarification (retain effects)**: if a card/effect says to "retain" a card, that
  card stays in the hero's hand into the next turn (it is not discarded/fatigued at
  Cleanup) and the hero still draws their normal full hand size on top of it.
- **FAQ clarification (net draw modifiers)**: when multiple draw-modifying effects are
  active in the same turn, sum all of them (positive and negative) against the base draw
  amount first; if the total is negative, the hero simply draws zero cards rather than a
  negative amount.
- **FAQ clarification (deck exhaustion)**: because of R2's fatigue mechanic, a hero's
  effective deck (draw pile + discard pile) shrinks over an encounter. If the discard pile
  is empty and the draw pile has fewer cards than the hand size, draw only as many cards
  as are available (a short hand), never an error. If zero cards are available to draw,
  the hero may still act using Items/Relics or an empty word/pass, but if no path to
  victory remains, conceding the encounter (a run loss) is a valid and expected outcome —
  the engine must not soft-lock in this state.

### R9 Items, Relics (McGuffins), and Core Cards

- **Items**: cost energy (paid from the persistent energy counter, not from the current
  word's icons), usable once per turn during Prep. Some items are single-use per
  encounter (disabled after use, reset at Character Development); others are "rotated"
  for an ongoing effect lasting the rest of the encounter.
- **Relics** (McGuffin-equivalent): no energy cost, trigger on stated conditions. Standard
  relics are double-sided; the side is chosen once, permanently, when acquired. Boss
  relics are single-sided and rarer.
- **Core Cards**: each hero starts with exactly 2 Core cards (item or relic type) that
  define how that hero spends boons and applies hex — this is the hero's signature
  mechanic substrate referenced in spec 008 H4. Alternate Core cards may be unlocked
  post-MVP; one of any chosen pair must key off boons and the other off hex.
- **Balance decision (energy cap, user-approved)**: Energy has no rulebook equivalent (R9
  digital-invention note) and previously grew unbounded within an encounter (+1/turn
  minimum from R3, never reset at Cleanup). Capped at `MAX_ENERGY = 6` so a long fight
  cannot snowball into unlimited item usage; the cap only applies to gains mid-encounter,
  not to the Character Development reset-to-0 in R8.
- **Balance decision (item cost symmetry, user-approved)**: the duelist's War Cry
  (gainHits) cost was reduced from 2 energy to 1, matching the arcanist's Core Items
  (both 1 energy), removing an asymmetry where the duelist paid double for a comparable
  effect magnitude.

### R10 Shop Mechanics

- Shop costs are paid in boons.
- Buying a Letter card **replaces** a card in the deck; the empty Shop slot refills from
  the hero's Library pool.
- Buying an item or relic **adds** it to the hero's collection; the empty Shop slot
  refills from the shared item/relic pool.
- Once per Shop visit, the player may discard and reroll a single row or column of Shop
  offerings (not the Shop's fixed cost display).

### R11 Word Repetition

- No penalty applies to repeating a previously played word. Word legality depends only on
  dictionary validity and available letters/splay, matching the rulebook.
- **FAQ clarification (optional word play)**: the hero may choose to submit no word for a
  turn (already modeled as `passTurn`); the enemy still performs its action for that turn
  as normal — passing is not a way to also skip the enemy's turn.

### R12 Difficulty Modes (Training vs Standard)

- The rulebook defines two baseline setups: **Training Mode** (easier, recommended for a
  player's first games) and **Standard Mode** (the default challenge level once a player
  is comfortable with the rules).
- Standard Mode baseline stats, taken literally from the rulebook: hero starts at **20 HP**
  with a **single Wild card**, and uses the full Enemy Vowel card set (no
  training-icon-marked cards excluded).
- Training Mode differs only in setup-time tuning (per rulebook p.2, exact deltas not yet
  itemized beyond HP/Wild-card baseline) — modeled digitally as an easier numeric tier,
  not a rules-branch; Standard Mode is the literal, unmodified rule set.
- Digital adaptation: expose difficulty as a single run-setup choice (Training vs
  Standard) analogous to the rulebook's guidance, distinct from post-MVP Plot Twists
  (which stack additional challenge on top of Standard Mode, not a replacement for it).
- **Resolved**: hero baseline was rescaled (user-approved, see repo memory) to `hp: 20,
maxHp: 20` in `src/engine/state.ts`, matching the literal Standard Mode 20 HP baseline;
  `energy: 3` remains a pure digital invention (R9 note) with no rulebook equivalent to
  reconcile against.

### R13 Library and Archive Content Pools

- Each hero owns a fixed content pool split into two parts at setup: a 10-card starting
  deck (already modeled) and a separate ~50-card Library pool that is not shuffled into
  the deck at the start of a run.
- Library cards are the pool that Shop/Lackey/Boss card rewards draw from and replace
  into (see R10); they are not available to the hero until acquired via a reward or
  purchase, matching the physical Archive/Library-deck setup structure.
- Non-character-specific content (Penalty cards, Items, Enemy Vowel cards, Wild cards) is
  shared across all heroes from a common pool per R3/R5/R6, distinct from each hero's own
  Library.
- Digital adaptation note: this formalizes the source distinction between a hero's
  starting deck and its larger unlock-pool; it does not require literal "5 distinct
  decks" bookkeeping, only that Library-sourced rewards are drawn from hero-specific
  content rather than a single global card pool.

## Explicitly Not Adopted for MVP

- Plot Twist difficulty-modifier cards (post-MVP optional module; track as future spec).
  Publisher errata for one Plot Twist ("Limited Resources") acknowledges it references a
  cut rule and should be ignored/reworked if the module is ever adopted — noted here so a
  future Plot Twist pass doesn't port a broken card as-is.
- Two-Headed Giant and 2v2 co-op modes (out of scope; single-hero solo runs only).
- Physical-component setup steps (sleeving, envelopes) — not applicable to digital play.
- Family-Heirloom-style "only triggers on an actual state change" pattern (e.g. a heal
  effect that no-ops at max HP does not trigger a chained ability) is a general errata
  principle worth applying to any future conditional-trigger relic, not a rule needing
  its own R-number.
- Literal Book/Lackey/Boss linear structure — superseded by the branching map (spec 007),
  which still ends each act at a Boss encounter.

## Updated Data Contracts (Target Shape)

```ts
interface CardEdge {
  hits: number;
  blocks: number;
  energy: number;
}
interface Card {
  id: string;
  letter: string;
  left: CardEdge;
  right: CardEdge;
  ability?: string;
  kind: "letter" | "wild" | "letterOfChoice" | "penalty" | "enemyVowel";
  rarity: 1 | 2 | 3;
  tags: string[];
}

interface HeroState {
  id: HeroId;
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  hex: number;
  boon: number;
}

interface EnemyState {
  id: string;
  name: string;
  stage: 1 | 2;
  hp: number;
  maxHp: number;
  block: number;
  hex: number;
  boon: number;
  stunned: boolean;
  intentIndex: number;
  intents: EnemyIntent[];
  weakVowel?: string;
}
```

## Acceptance Criteria

1. Given a word submission, when the player picks splay left or right, then only the
   correct edge values are summed and the correct card becomes top card.
2. Given a top card with an ability, when Clash resolves, then only that ability fires and
   only that card fatigues; the rest of the word goes to discard.
3. Given a word played without the Wild card, when Cleanup resolves, then the hero gains
   +1 energy; given a word using the Wild card, no bonus energy is granted.
4. Given an enemy at 0 HP in Stage 1, when the flip occurs, then Stage 2 HP is set with
   overflow damage applied and the enemy takes no action that turn.
5. Given an unplayed Penalty card left in hand at Cleanup, when Cleanup resolves, then its
   negative effect triggers before discard.
6. Given an enemy defeated in Stage 2, when Character Development runs, then hex/energy
   reset to 0, hp/boon persist, and all hero Letter-card zones reshuffle into one deck.
7. Given a Shop purchase of a Letter card, when confirmed, then a deck card is replaced
   (not added) and the Shop slot refills from the Library pool.
8. Given a word repeated from an earlier turn, when resolved, then no attack/value penalty
   is applied.
9. Given a new run is started, when the player picks Training or Standard Mode, then the
   chosen mode's baseline hero stats are applied consistently for the whole run.
10. Given a Lackey or Boss reward is granted, when the reward card is chosen, then it is
    drawn from that hero's own Library pool, not a shared or other hero's pool.

## Amendments to Existing Specs

- **Spec 001 (Core Run)**: Resolved Decision 1 ("repeated words allowed with stacking
  penalty") is superseded by R11 above — no penalty. R3/R4 in spec 001 (resolution order,
  fatigue) are superseded by R1/R2/R7 above.
- **Spec 003 (MVP Scope Lock)**: Locked Decision 4 ("repeated words... stacking penalty")
  is superseded by R11 above.
- **Spec 002 (Content and Bosses)**: Boss multi-stage requirement (C2) is now formally
  defined by R7; enemy intents (C1) extend with hex/boon interactions per R4.
- **Spec 004 (Card Visual/A11y)**: Card anatomy (R1) must add left/right edge value
  display and a splay-direction affordance; timing label set extends to cover Prep-phase
  effects (e.g., item activation) alongside On Submit/On Clash/On Cleanup.
- **Spec 008 (Hero Kit)**: H4 "signature mechanic" is formally grounded in R9 Core Cards
  (one hex-keyed, one boon-keyed).
- **Spec 002 (Content and Bosses)**: C2's "boss must punish repetitive word use" bullet is
  removed as contradictory with R11; boss differentiation instead comes from R7/R4/R5.
  C3's reward pool ("20 card rewards, 10 relics") is now understood as populating each
  hero's Library pool per R13, not a single shared pool.
- **Spec 006 (Meta-Progression)**: run-start hero selection should offer the Training vs
  Standard Mode choice from R12 alongside hero pick.

## Appendix: Rulebook Component and Setup Reference

For traceability back to the physical rulebook (pages 1-3), not all of which maps to a
digital rule (sleeving, envelopes, physical trays are intentionally not adopted, see
"Explicitly Not Adopted"):

- **Core box** (shared across all runs): 1 Enemy Tray, 4 Status Counters, 12 Enemy Cards,
  12 Reward Cards, 7 Penalty Cards, 5 Enemy Vowel Cards, 2 Wild Cards, 2 Letter-of-Choice
  Cards, 5 Plot Twist Cards, 23 Item Cards, 22 McGuffin Cards, 12 Boss McGuffin Cards,
  1 Shop Card, 1 Archive Card. These sizes are the source-of-truth upper bound for spec
  002's C3 shared content targets (Items/Relics pools) and R6/R3/R5 shared pools.
- **Character box** (per hero): 1 Character Tray, 4 Status Counters, 1 Character Card, 6
  Enemy Cards, 6 Reward Cards, 10 Character Starting Letter Cards, 50 Character Library
  Letter Cards, 4 Core Cards (2 usable at a time, 2 alternates), 1 Starting Item Card, 4
  Bonus Item Cards, 3 Bonus McGuffin Cards, 1 Bonus Boss McGuffin Card. This is the source
  for the 10-card starting deck (already matched) and the 50-card Library pool (R13).
- Each hero has exactly 6 hero-specific enemies (Enemy Cards in their box) plus access to
  the 12 shared core-box enemies; total enemy variety available to any single hero is 18,
  informing spec 002 C1's "at least 8 normal enemies and 3 elites" floor.
- Archive setup (5 distinct decks around the Archive card: starting deck already-in-play,
  Library deck, Penalty deck, Item deck, plus discard space) is the physical origin of
  R13's Library-vs-shared-pool split; no literal 5-deck UI layout is required digitally.
- **Character box card lists (user-pasted, publisher site)**: confirms the physical game
  ships 3 characters — Damsel, Ex Machina, Plothook — each with 6 hero-specific enemies,
  5 Items, ~4 McGuffins, and 4 Core Cards (Damsel's core-card names include Venom Vial and
  Whirling Blades, both hex-keyed per the FAQ, matching R9's "one hex-keyed, one
  boon-keyed" pairing). Wordcrawlers' hero identities (`HeroId = 'duelist' | 'arcanist'`,
  spec 008) are **original, unrelated names** for a 2-hero MVP subset of this same
  hex/boon Core Card substrate — no literal Damsel/Ex Machina/Plothook naming or exact
  card ports are required or implied; the character-box lists are reference material for
  balancing hex-keyed vs. boon-keyed Core Card design, not a content checklist to match
  1:1.

## Implementation Status

Implemented in engine + app layer:

- R1 splay left/right with dual-edge (`left`/`right`) hits/blocks/energy resolution.
- R2 top-card-only ability logging and top-card-only fatigue (`resolveTopCard`, `fatigueTopCard`).
- R3 Wild Card: always-available pseudo-card (not in hand/deck), player assigns its letter
  via a UI text input, `submitComposedCards` resolves it directly (bypassing hand-matching),
  and words that don't use it grant +1 energy (`resolveClash`).
- R4 hex/boon fields on `HeroState`/`EnemyState`; boon persists across encounters via
  `progressionStore`, and is now the Shop's sole currency (see R10).
- R5 Enemy Vowel pseudo-card: available while `enemy.weakVowel` is unclaimed; as the top
  card it advances the enemy's intent index and then fatigues (`enemyVowelAvailable = false`)
  for the rest of the encounter.
- R6 Penalty cards: shared `penaltyPool`, `addPenaltyCardToDeck` — now wired to **two**
  concrete triggers: the Stage 2 flip, and every enemy `debuff` intent (`resolveEnemyIntent`
  in `combat.ts`) — plus the unplayed-in-hand -1 HP effect at Cleanup, and return-to-pool
  when played instead of discard/fatigue. Shop's Buy-replace and Remove flows both reject
  Penalty cards as a valid target (`progressionStore.ts`).
- R7 enemy Stage 1 -> Stage 2 flip with overflow damage, stun, and intent reset
  (`applyStageFlipIfDefeated`); Cleanup now skips its normal intent-index advance on the
  same turn a flip already reset it to 0, matching the FAQ's "starts on first action"
  rule (`cleanupTurn(state, skipIntentAdvance)` in `turn.ts`, fixed in an earlier pass —
  previously Cleanup always advanced unconditionally, silently skipping Stage 2's first
  intent).
- R9 Items and Core Cards: small effect vocabulary (`gainHits`/`gainBlocks`/`gainEnergy`/
  `applyHex`), energy-gated activation during the Spell/Prep window (`useItem`), each hero
  ships with 2 Core Items (one hex-keyed, one boon-keyed per H4). Energy gains from items,
  words, and Relics are all clamped to `MAX_ENERGY = 6` (balance decision, see R9 above).
- R9 Relics: `createHeroRelics` grants each hero 1 no-cost, auto-triggering Relic
  (`RelicTrigger`: `onStageFlip` / `onWordWithoutWild`), applied via `applyRelicEffect` in
  `combat.ts` at the matching hook (`applyStageFlipIfDefeated`, the no-Wild-bonus branch
  of `resolveClash`). Boss Relics and a reward/shop acquisition flow for Relics are still
  not modeled (see remaining gaps).
- R10 Shop now prices and pays in boons (gold currency removed) and **replaces** a
  player-selected deck card instead of always adding one (`buyShopCard(cardId,
replaceCardId)`, `ShopModal.tsx` replace-target selection UI).
- R11 repeat-word penalty removed from engine, state, and tests.
- R13 Reward/Shop/event card offers are drawn from a per-hero `LIBRARY_POOLS` letter set
  (`progressionStore.ts`), weighted to match each hero's starter-deck vowel/consonant
  ratio, instead of one shared alphabet pool.
- UI: splay left/right toggle, enemy stage badge, hero hex/boon indicators, Wild
  letter input + Add Wild/Add Enemy Vowel toggles, Items action row, Shop replace-target
  selection.

Remaining gaps (tracked for a follow-up pass):

- R8 Character Development is implicit (fresh per-encounter state naturally zeroes
  hex/energy) rather than an explicit function; single-use/rotated Item lifecycle beyond
  per-turn `usedThisTurn` reset is not modeled (no relic-vs-item rotation state yet).
- R9 Boss Relics content, and a reward/shop flow that _grants_ additional Relics
  mid-run, do not exist yet — each hero's single Relic is fixed at run start alongside
  their 2 Core Items, not acquired. **Tracked in `specs/011-relics-and-consumables/spec.md`**,
  which also adds a new digital-only Consumable item tier (no rulebook equivalent, same
  category of invention as Energy) on top of this gap.
- R10/R8: Reward-card pickup (`pickReward`) still always **adds** a card rather than
  distinguishing Lackey-replaces vs. Boss-adds per R8 point 7 — Shop now replaces
  correctly, but the reward flow does not yet track which enemy type granted the reward.
- Boon-earning sources during combat (beyond the starting stipend) are not wired up.

## Balance Audit (this pass, user-approved changes marked)

- Starting deck totals: duelist 17 (3 vowel/7 consonant), arcanist 18 (2 vowel/8
  consonant) — within ~6%, left as-is (minor, consistent with each hero's hex/vowel
  identity split).
- **Changed**: War Cry (duelist Core Item) energy cost 2 -> 1, matching the arcanist's
  uniformly-1-energy Core Items; removed an asymmetry where the duelist paid double energy
  for a comparable single-point effect.
- **Changed**: hero `energy` capped at `MAX_ENERGY = 6` (see R9) — previously unbounded
  within an encounter since nothing decayed or reset it turn-to-turn, only Character
  Development's full reset-to-0 between encounters (R8).
- New Relics (R9) kept at magnitude 1 (same as Core Items) for both heroes so the passive
  addition doesn't outweigh the actively-spent Core Item pair.
- Shop prices (4/7/11 boons by rarity, 5 to remove, 12 starting boon) were not changed;
  still internally consistent with the new per-hero Library pool letter values.
