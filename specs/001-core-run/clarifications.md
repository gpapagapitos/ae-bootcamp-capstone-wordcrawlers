# Spec 001 Clarifications

## Decisions

1. Repeated words
- Decision: Allowed in MVP with **no penalty** (supersedes prior -10%/-40% stacking penalty; see spec 009 R11).

2. Proper nouns
- Decision: Disallowed in MVP for dictionary simplicity.

3. Y classification
- Decision: Player may toggle Y as vowel or consonant per word during Spell phase.

4. Opening hand size
- Decision: 7 cards.

5. Base letter scoring
- Decision: Scrabble-like values for MVP.

6. Fatigue target priority
- Decision: Superseded by spec 009 R2 — the fatigued card is always the top card of the played word (determined by splay direction), not a lowest-rarity/tiebreak selection.

7. Dictionary strictness
- Decision: Strict dictionary validation in MVP (no fuzzy/near-word acceptance).

8. Run size
- Decision: MVP run includes one act and one boss.

9. Hero count
- Decision: MVP includes two heroes with distinct playstyles.

10. Combat pacing
- Decision: "Snappy tactical" pacing. Most turns should resolve quickly, but with visible strategic consequences.

## Remaining Risks

- Dictionary disagreements may create player frustration.
- Engine refactor to splay-based top-card fatigue (spec 009) is not yet implemented in code.
