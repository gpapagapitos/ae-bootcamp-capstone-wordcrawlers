---
name: rules-fidelity
description: 'Use when the user pastes new rulebook pages/excerpts from Paperback Adventures (docs/Paperback_Adventures_rulebook.pdf), asks to reconcile game code/specs with the source board game rules, questions enemy vulnerabilities/actions/mechanics fidelity, or asks to audit specs 001-009 for consistency with the rulebook. Synthesizes rulebook text into spec 009, cross-checks other specs for contradictions, and flags balance-affecting gaps for user sign-off instead of silently changing them.'
---

# Rules Fidelity

Keeps `specs/009-board-game-rules-fidelity/spec.md` as an accurate, non-contradictory
synthesis of the real Paperback Adventures rulebook, and keeps specs 001-008 from
drifting out of sync with it.

## When to Use
- User pastes rulebook text (credits, setup, component lists, card text, enemy rules).
- User asks whether an enemy/mechanic/action matches "the rules" or the rulebook.
- User asks to write or update specs for rules, enemy vulnerabilities, or actions.
- Before implementing any new combat/enemy/economy mechanic in the engine.

## Procedure

1. **Read existing state first.** Check `/memories/repo/rules-fidelity.md` (repo memory)
   for prior decisions/gaps, then read `specs/009-board-game-rules-fidelity/spec.md` in
   full — it's the authoritative synthesis, organized as numbered rules (R1, R2, ...).
2. **Extract new mechanics** from the pasted rulebook text: name each distinct
   rule/mechanic, and check whether it's already covered by an existing R-number in
   spec 009.
   - Already covered: verify the existing rule text is accurate/complete against the new
     source text; tighten wording if the rulebook is more specific than what's written.
   - Not covered: add a new `### RN` section following the existing format (rule bullets
     + at least one acceptance criterion), and add it to the "Amendments to Existing
     Specs" section if it changes/contradicts specs 001-008.
3. **Cross-check specs 001-008** for now-contradicted requirements (e.g. a stacking
   penalty, a stat baseline, a structural assumption). Do not leave stale contradictory
   text — either amend it in place with a pointer to the superseding spec 009 rule, or
   add an acceptance criterion that makes the non-contradiction explicit. This has
   surfaced real bugs before (see repo memory: spec 002 required "boss punishes repeat
   words" which contradicted R11's no-repeat-penalty rule).
4. **Flag balance-affecting gaps instead of fixing them.** If the rulebook specifies a
   concrete number (HP, damage, energy, card counts) that conflicts with current
   engine/app values, record it as a known gap in spec 009 and repo memory — do NOT
   change the engine values without explicit user confirmation, since these affect
   win-rate/difficulty tuning (spec 008 H6).
5. **Only touch engine/app code when asked to implement**, not just to spec. When you do
   implement, work rule-by-rule (one RN at a time), run `npm run test`, `npm run lint`,
   `npm run typecheck`, and update the "Implementation Status" section of spec 009 plus
   repo memory with what was done and what remains.
6. **Update repo memory** (`/memories/repo/rules-fidelity.md`) at the end of every pass:
   what was added/changed, what's still a gap, any gotchas hit.

## Anti-patterns
- Duplicating rulebook prose into multiple specs instead of pointing at spec 009.
- Silently "fixing" a stat mismatch (e.g. hero HP) to match the rulebook without asking.
- Adding a new mechanic to spec 009 without checking specs 001-008 for contradictions.
