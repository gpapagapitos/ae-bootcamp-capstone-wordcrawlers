# Spec 006: Meta Progression and Unlock Economy

## Status

Approved — spec and tasks complete; implementation in backlog (WC-011, WC-012)

## Goal

Define a minimal, fair meta progression loop that rewards replay while preserving core run skill expression.

## Scope

MVP unlock economy including at least one cosmetic unlock and one gameplay unlock.

## Requirements

### M1 Meta Currency and Sources

- System shall award a single MVP meta currency at run end.
- Currency reward shall be derived from run outcomes (win/loss), progress depth, and optional challenge modifiers.
- Currency gain shall be deterministic for identical seed + outcome in test mode.

### M2 Unlock Categories

- MVP shall include at least:
  1. one cosmetic unlock track,
  2. one gameplay unlock track.
- Cosmetic unlocks shall not affect combat outcomes.
- Gameplay unlocks shall expand options (e.g., card pool/relic pool) without mandatory power creep.

### M3 Unlock Store/Tree UX

- System shall provide an unlock screen between runs.
- Each unlock shall show cost, category, and effect summary.
- Locked items shall show clear prerequisites.

### M4 Pacing and Fairness

- First unlock shall be achievable within a small number of runs under average internal playtest performance.
- Losses shall still grant non-zero progression to avoid hard frustration loops.
- Economy shall avoid forcing one dominant unlock path for consistent early success.

### M5 Balance Guardrails

- Newly unlocked gameplay content shall integrate with existing pools via rarity/weight rules.
- Unlocks shall not invalidate baseline decks or hero identities.
- Meta progression shall be optional for deterministic balance tests (toggle/fixture mode).

### M6 Data and Reset Behavior

- Meta profile shall persist locally independent of active run save.
- System shall support profile reset from settings with confirmation.
- Profile schema shall be versioned for future migration.

## Acceptance Criteria

1. Given a completed run, when returning to meta screen, then currency gain is displayed and persisted.
2. Given enough currency, when player buys an unlock, then unlock state persists across app restart.
3. Given a fresh profile, when player completes early runs, then first unlock occurs within defined pacing target.
4. Given profile reset confirmation, when reset completes, then all unlock states return to default baseline.
5. Given deterministic test mode, when two identical outcomes are processed, then awarded currency matches exactly.

## Out of Scope

- Seasonal ladders.
- Cloud profile sync.
- Social/shared progression.

## Open Questions

1. Should gameplay unlocks gate by hero, global profile, or both?
2. Should cosmetic unlocks include alternate card frames in MVP or only hero/map presentation?
3. Do we want a soft cap to reduce late-run currency inflation?
