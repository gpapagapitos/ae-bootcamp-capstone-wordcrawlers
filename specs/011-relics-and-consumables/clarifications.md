# Spec 011 Clarifications

## Decisions

1. Non-boss Relic reward roll chance

- Decision: 30% chance on battle/elite victory (elite gets the same rate, not boosted —
  elites already give better card rewards elsewhere). Rationale: rare enough to feel like
  a real find, frequent enough that a full Act 1 run (6-8 battles) sees 2-3 on average.
- Status: **Approved (2026-08-04)**.

2. Consumable inventory cap

- Decision: cap at 3 held at once, matching the "small kit" feel of Items (each hero has
  2 Core Items) without requiring inventory-management UI complexity.
- Status: **Approved (2026-08-04)**.

3. Consumable magnitude vs. Items/Relics

- Decision: Consumables use the same magnitude scale as Core Items (see
  `rules-fidelity.md` repo memory: Core Item magnitudes were rescaled to 1, matching
  Relics) but are allowed exactly one effect application at roughly 1.5-2x a single
  Item activation's magnitude, since they cannot be reused turn-to-turn. E.g. if a Core
  Item grants `gainBlocks: 1`, a comparable Consumable grants `gainBlocks: 2`.
- Status: **Approved (2026-08-04)**.

4. Shop pricing for Consumables

- Decision: price Consumables like a common/uncommon card (4-7 boons), cheaper than a
  Relic slot (proposed at rare-card price, 11 boons) since Consumables are single-use.
- Status: **Approved (2026-08-04)**.

5. Starter content list (draft, pending canon-checklist pass)

- Boss Relics (single-sided, rarer):
  - "Vault Warden's Seal" — `applyHex`, magnitude 2, flavor: a boss's broken sigil that
    still bites at whoever wears it next.
  - "Vault Warden's Marrow" — `gainBlocks`, magnitude 2, flavor: armor plating salvaged
    from a fallen guardian.
- Standard Relics (double-sided, per-hero pool — extends existing `createHeroRelics`
  pattern rather than replacing it):
  - Duelist-leaning: "Splinter Charm" (side A: `gainHits` on word-without-Wild; side B:
    `gainEnergy` on stage flip).
  - Arcanist-leaning: "Rootbound Coil" (side A: `applyHex` on stage flip; side B:
    `gainBlocks` on word-without-Wild).
- Consumables (both heroes draw from the same shared pool, no hero-lock):
  - "Cinder Draught" — `gainBlocks`, magnitude 2. Flavor: a bracing tonic brewed from
    reclaimed embers.
  - "Quickroot Vial" — `gainEnergy`, magnitude 2. Flavor: distilled sap that quickens the
    hand.
  - "Bitter Needle" — `applyHex`, magnitude 2. Flavor: a splinter of enemy language,
    turned back on its source.
- Status: **Approved (2026-08-04)** — canon-checklist pass below; content may now be
  added to `src/app/content/`/`src/engine/cards.ts` in Phase B.

## Content Canon Checklist Pass (2026-08-04)

All entries pass the six gates in `docs/content-canon-checklist.md`:

- **Theme**: all six names/flavors use reclaimed-earth/vault language (sigil, marrow,
  charm, coil, draught, vial, needle) — no neon/sci-fi/pulp-noir terms.
- **Mechanical role**: each declares one effect (`applyHex`/`gainBlocks`/`gainHits`/
  `gainEnergy`), a clear timing window (Relics: passive on stated `RelicTrigger`;
  Consumables: on manual use during Prep), and a balancing limit (Relics: fixed at
  acquisition, one trigger condition; Consumables: single-use, inventory-capped).
- **Readability**: each is a single effect + single magnitude, readable in well under 8
  seconds; no compound/conditional text.
- **Taxonomy**: Boss Relics tagged `class: relic, rarity: boss-legendary`; Standard
  Relics `class: relic, rarity: rare` (double-sided, matches existing Core Relic
  rarity); Consumables `class: item, rarity: uncommon`. Letter family: n/a (none are
  letter-cards).
- **Consistency**: no name/effect duplicates an existing Core Item, Core Relic, or
  Letter card; Standard Relic hero-leaning matches each hero's existing hex/boon
  identity split (Duelist = hits/energy, Arcanist = hex/block).
- **Playtest hypothesis** (one per entry, required before shipping):
  - Vault Warden's Seal: should make post-boss runs slightly more hex-aggressive early
    in Act 2; rollback if average enemy hex-application turn drops implausibly (<2).
  - Vault Warden's Marrow: should reduce early-encounter damage taken after a boss
    kill; rollback if it measurably trivializes the encounter immediately after a boss.
  - Splinter Charm / Rootbound Coil: should reinforce each hero's existing identity
    rather than blur it; rollback if playtests show either hero picking the other's
    Standard Relic more often than their own.
  - Cinder Draught / Quickroot Vial / Bitter Needle: should give a one-time "clutch"
    swing in a single tough turn; rollback if any one Consumable is used in >60% of
    encounters (signals it's a default pick, not a situational tool).

## Remaining Risks

- Additive Relic rewards on top of existing card rewards could make reward screens feel
  cluttered/slow if the roll lands often; watch reward-modal UX once RC2 ships.
- A 3-item Consumable cap with no crafting/refill-only-in-Shop economy may feel stingy in
  longer test runs — flagged as a tuning risk to revisit once seed playtests exist,
  consistent with how spec 009's balance passes were done (measure, then adjust with
  sign-off, not guess upfront).
- Boss Relic pool needs at least as many entries as there are bosses planned (currently 1
  boss, Ink Warden) to avoid "choose 1 of 2" degenerating into "always the same 2" — more
  content is needed before Act 2 ships more bosses.
