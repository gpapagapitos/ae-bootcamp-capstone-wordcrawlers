# Spec 011: Relic Rewards and Consumable Items

## Status

Implemented — see `tasks.md` for phase-by-phase status; in-browser verification (Phase D)
deferred to a follow-up pass.

## Source of Truth

- `specs/009-board-game-rules-fidelity/spec.md` R8 (Character Development Sequence) and
  R9 (Items, Relics/McGuffins, Core Cards) define the literal board-game rules this spec
  builds on: Relics are double-sided (side chosen once at acquisition), Boss Relics are
  single-sided and rarer, and R8 point 7 calls for a Boss Relic grant during Character
  Development after a boss kill. Both are currently **not implemented** — every hero's
  single Relic is fixed at run start instead (see spec 009 "Known Gaps").
- `docs/bible.md` (Relic cards, Effect Vocabulary, Rarity Tiers, Enemy Naming Pattern) and
  `docs/content-canon-checklist.md` govern naming/tone/mechanical-role for any new named
  content introduced here.
- `.specify/memory/architecture.md` (engine/app boundary) and `patterns.md` govern where
  the new code lives.

## Goal

Close two related gaps flagged in spec 009's "Known Gaps": (1) give players a real
acquisition flow for Relics instead of a fixed run-start grant, culminating in a rarer
**Boss Relic** on boss kill; and (2) introduce **Consumables** — a new, digital-only,
one-shot resource tier (no rulebook equivalent, same category of invention as Energy)
that gives players a short-horizon tactical tool distinct from Items (repeatable,
energy-gated) and Relics (passive, auto-triggered).

## Scope

- Boss Relic reward: on defeating a boss (Stage 2 HP reaches 0), Character Development
  grants a **choice of 1 of 2** Boss Relics, in addition to the existing card reward.
- Standard Relic reward: non-boss battle/elite victories have a chance to offer a
  Relic choice (alongside the existing card reward), drawn from a per-hero Relic pool
  (mirrors the R13 Library-pool pattern already used for card rewards).
- Consumables: a new `ConsumableDef`/`ConsumableInstance` engine type, a small starter
  pool (2-3 defs), acquired via reward/shop/event, used from a dedicated HUD row during
  Prep, single-use (removed from inventory after resolution), no energy cost.
- Out of band: this spec does not change starting Relic grant at run start (each hero
  keeps their existing Core Relic); it only adds _additional_ acquisition on top.

## Requirements

### RC1 Boss Relic Choice

- On boss defeat, Character Development shall present a choice of exactly 2 Boss Relics
  (drawn without replacement from a shared Boss Relic pool) alongside the existing card
  reward, matching the "choose N to keep, return leftovers to pool" pattern already used
  for card rewards (spec 009 R8 point 6 / FAQ pass).
- Boss Relics shall be single-sided (spec 009 R9) — no side-choice UI is needed for them,
  unlike standard Relics.
- Declining is not an option: the player shall pick exactly one of the two offered Boss
  Relics (matching the existing mandatory-reward pattern for card rewards).

### RC2 Standard Relic Reward (non-boss)

- Non-boss battle/elite victories shall have a configurable chance to include a Relic
  choice (1 of 2, drawn from the hero's Relic pool) alongside the existing card reward.
- Standard Relics offered this way shall be double-sided: the player picks a side once,
  permanently, at acquisition time (spec 009 R9), surfaced as a 2-option sub-choice after
  selecting the Relic.
- This reward type shall not replace the existing card reward; it is additive per victory
  when it rolls, matching R9's existing item/relic pool language ("adds it to the hero's
  collection").

### RC3 Consumable Type and Effect Vocabulary

- A `ConsumableDef` shall declare: `id`, `name`, `rarity`, `effectType`, `magnitude`, and
  flavor text — reusing the existing `ItemEffectType` vocabulary
  (`gainHits` | `gainBlocks` | `gainEnergy` | `applyHex`) so no new resolution logic is
  needed in `combat.ts`/`turn.ts` beyond dispatch.
- Consumables shall cost no Energy (distinct from Items) and shall not be reusable: using
  one removes it from `RunState.consumables` immediately, win or lose.
- Starter Consumable pool (2-3 defs) shall follow the bible's naming/tone conventions and
  pass the `content-canon-checklist.md` gates (theme, mechanical role, readability,
  taxonomy, consistency, playtest hypothesis) before being added to `content/`.

### RC4 Consumable Acquisition

- Consumables shall be obtainable from: Shop (new offer slot type, priced in boons),
  Rest/Event choices (reusing the existing `cardEffect`-style choice pattern in
  `app/content/events.ts`), and battle/elite rewards (alongside the existing card/Relic
  reward, low roll chance).
- Consumable inventory shall have a cap (see Open Questions) enforced at acquisition time;
  exceeding the cap shall block the acquisition with a clear reason, not silently drop it.

### RC5 Consumable Use (Combat UI)

- The combat HUD shall render a Consumables row distinct from the existing Items row
  (energy-gated) — Consumables show a use button gated only by "available this
  encounter" state, no energy cost, no `usedThisTurn` per-turn lock (Items already have
  that lock; Consumables are single-use for the whole run instead).
- Using a Consumable shall log its effect the same way Item/Relic effects are logged
  today (combat action log), so cause/effect stays unambiguous per constitution
  principle 3 (deterministic, visible resolution).

### RC6 Persistence

- Both the Relic collection and Consumable inventory shall persist across encounters via
  the existing `progressionStore` sync pattern (mirrors how `items`/`relics` and
  `heroHp`/`boon` already round-trip through `syncDeckFromEncounter` and the save
  envelope in `src/app/persistence/runSave.ts`).

## Acceptance Criteria

1. Given a boss is defeated, when Character Development resolves, then the player is
   shown exactly 2 Boss Relic options and must pick exactly 1 before continuing.
2. Given a non-boss battle/elite victory rolls a Relic reward, when the reward screen
   opens, then a Relic choice (1 of 2) is shown alongside the card reward, and picking a
   double-sided Relic prompts a one-time, permanent side choice.
3. Given a Consumable is used in combat, when its effect resolves, then the corresponding
   `gainHits`/`gainBlocks`/`gainEnergy`/`applyHex` effect applies exactly once, the
   Consumable is removed from inventory, and the action log records the effect.
4. Given the Consumable inventory is at cap, when the player is offered a new Consumable
   (Shop/Rest/Event/reward), then the offer is blocked or clearly marked unavailable
   instead of silently discarding or exceeding the cap.
5. Given a run is saved mid-encounter with unused Relics/Consumables, when the run is
   resumed, then both collections restore exactly as they were.
6. Given the `content-canon-checklist.md` gates, when a new Consumable or Boss Relic is
   proposed, then it documents theme/mechanical-role/readability/taxonomy/consistency/
   playtest-hypothesis before being added to `content/`.

## Out of Scope

- Changing the existing run-start Core Relic grant (each hero keeps exactly 1 at start).
- Crafting, combining, or upgrading Consumables/Relics.
- More than 2-option choice UI for Boss Relics or Relic rewards (matches existing reward
  UX pattern; no N-of-M generalization in this pass).
- New `ItemEffectType` values — this spec reuses the existing four; new effect types are
  a separate, future content pass.

## Open Questions

See `clarifications.md` for resolution status; the following need explicit sign-off
before implementation begins (balance/economy-affecting, per repo convention):

1. Non-boss Relic reward roll chance (e.g., 25%? every Nth encounter?).
2. Consumable inventory cap (e.g., 2? 3? unlimited?).
3. Consumable magnitudes relative to Items/Relics (should a one-shot be stronger than a
   reusable Item's per-activation effect, to justify its single use?).
4. Shop pricing for Consumables in boons, relative to existing card/remove prices
   (4/7/11 rarity, 5 remove — see `progressionStore.ts`).
5. Exact starter Consumable + Boss Relic content list (names/flavor/effect/magnitude) —
   draft proposals belong in `clarifications.md`, final content needs canon-checklist
   sign-off before it lands in `content/`.
