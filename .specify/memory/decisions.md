# Decisions

Running log of decisions recorded during spec and implementation sessions. New entries go
at the top. Each entry notes what was decided, what was rejected, and which spec captures
the requirement — so that future sessions can trace _why_ the code is the way it is.

---

## Session: Spec 011 scoping — Boss Relics + Consumables

**Feature scope: Boss Relic reward flow + new Consumable item tier.**
Chosen over the other candidates discussed (Ascension/difficulty modifiers, Act 2
content) as the first post-MVP feature to run through the full spec-driven flow, because
it closes an existing, already-documented gap (spec 009 R9 Known Gaps: Relics are only
granted at run start, no acquisition flow, no Boss Relics) rather than opening new scope.

Process followed for the demo: read constitution -> decisions -> architecture ->
docs/bible.md -> docs/content-canon-checklist.md, cross-checked spec 009 for the exact
gap being closed, then produced spec.md (requirements + acceptance criteria) ->
clarifications.md (balance-affecting defaults proposed but explicitly marked
"needs user sign-off", per constitution principle 1 and the repo's balance-change
convention) -> plan.md (module-level design reusing existing engine/app boundary,
no new architecture) -> tasks.md (phased checklist with Phase A as an explicit sign-off
gate before any code is written).

Rejected for this pass: implementing directly without the sign-off gate (rejected —
violates the repo's standing "balance-affecting changes need explicit user sign-off"
convention, same as the HP-rescale and energy-cap passes recorded in
`/memories/repo/rules-fidelity.md`).

---

## Session: Spec 011 sign-off — Phase A cleared

**All 4 balance-affecting defaults in spec 011's clarifications.md approved as proposed.**
Non-boss Relic reward roll (30%), Consumable inventory cap (3), Consumable magnitude
(1.5-2x a single Item activation), and Shop Consumable pricing (4-7 boons, common/
uncommon tier) are now locked decisions, not proposals. The draft Boss Relic/Standard
Relic/Consumable content list also passed a full `docs/content-canon-checklist.md` gate
pass (theme/mechanical-role/readability/taxonomy/consistency/playtest-hypothesis),
recorded in `specs/011-relics-and-consumables/clarifications.md`. Phase A of
`specs/011-relics-and-consumables/tasks.md` is complete; Phase B (engine contracts) is
unblocked.

---

## Session: Rules fidelity pass → spec 009

**Fidelity level: Hybrid.**
After reviewing the Paperback Adventures rulebook against specs 001–003, we chose Hybrid:
keep the roguelite run structure (map, meta-progression, heroes, save/resume) and replace
core combat/economy with literal board-game systems wherever one exists.

Rejected: Full simulation (too much scope drift from roguelite framing). Pure adaptation
(would lose the distinctive Paperback feel that motivated the project).

Immediate spec implications recorded in spec 009:

- Splay direction (left/right) required for every word — top card determines ability and fatigue target.
- Top-card-only fatigue replaces the earlier "fatigue lowest-rarity card" rule from spec 001.
- Hex + Boon dual resource replaces single-resource model.
- Enemy Vowel pseudo-card is now a formal mechanic.
- Repeat-word penalty removed — the board game has no such rule (see next entry).

---

## Session: Spec 001 clarifications → repeat-word penalty

**Repeat-word penalty dropped.**
Earlier clarification added −10% per repeat capped at −40%. After studying the rulebook,
the top-card fatigue rule already creates natural word-reuse pressure (the top letter
fatigues, so the same word costs you a different card each time). Adding a numeric penalty
on top was both non-canonical and redundant. Removed in spec 001 Resolved Decisions.

---

## Session: Spec 003 scope lock

**MVP scope locked.**
One act + boss, two heroes (Duelist + Arcanist), strict dictionary, snappy tactical pacing,
dark pulp visual language. See spec 003 for full exit criteria and change control process.

Considered alternatives:

- Two acts: ruled out — content authoring effort before core loop is validated.
- Three heroes: ruled out — same reason.
- Fuzzy dictionary: ruled out for default mode; may return as accessibility opt-in post-MVP.

---

## Session: Spec 001 clarifications → dictionary and Y

**Strict local word set only for MVP.**
Core skill expression is vocabulary and deckbuilding, not approximate spelling. Strict mode
preserves that. Y is auto-classified by dictionary validity (aligns with the board game FAQ
"whichever is friendliest to the player" guidance).

---

## Session: Stack decision → docs/stack-decision.md

**Frontend stack: React + Vite + Zustand + PixiJS.**
Rejected Godot (parallel toolchain splits TypeScript test investment) and Three.js
(overkill for 2D card-battler UX; slower iteration on dense text UI). PixiJS gives GPU
effects while keeping one language. Full rationale in `docs/stack-decision.md`.

---

## Session: Spec 005 clarifications → save envelope

**Schema-versioned JSON with CRC32 checksum, localStorage, atomic write.**
Two save slots: `current` + `previous` (auto-backup before each write). Interrupted writes
must never leave partially valid state — temp-file-then-rename pattern adapted for the
browser storage API. Cloud save out of scope for MVP.

---

## Session: Spec 007 clarifications → map generation

**Deterministic map generation from run seed.**
Same seed must produce the same ActMap every time — required for save/resume determinism
(spec 005). Map generation is pure: `generateAct1Map(seed): ActMap`. Route-fairness
constraints (at least one rest before boss, shop reachable from any start) recorded in
spec 007 tasks.
