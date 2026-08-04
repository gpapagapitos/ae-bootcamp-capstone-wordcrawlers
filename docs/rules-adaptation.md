# Rules Adaptation Notes

## Status

Superseded for core combat/economy mechanics by
[specs/009-board-game-rules-fidelity/spec.md](../specs/009-board-game-rules-fidelity/spec.md),
which is now the authoritative synthesis of `docs/Paperback_Adventures_rulebook.pdf`.
This file remains for historical context on the original "inspired by, not a clone"
framing; the Hybrid decision recorded in spec 009 replaces most of the guardrails below
with literal rulebook mechanics while keeping the roguelite run/map/meta layer.

## Source Context

This design is inspired by Paperback Adventures and digital deckbuilding roguelites. It is not a direct clone. Mechanics are adapted for digital play and capstone scope.

## Confirmed Rule Signals Incorporated

These official FAQ/errata signals are carried forward:

- You may choose to skip spelling a word on a turn.
- Some cards can place hex counters on enemies; hexes are spent from enemy counters for effects.
- Stun prevents enemy action for a turn.
- Enemy action indicators typically advance each turn; stage transitions may reset action sequencing.
- Fatigue matters: decks can run out of playable cards over time.
- Wild and letter-of-choice style cards have special interactions and can bypass normal constraints.
- Replacement decisions after rewards/shops are meaningful deck-shaping actions.

## Digital Adaptation Decisions

1. Encounter format
- Run = Act 1, Act 2, Act 3 + final boss.
- Each act has: 3 normal fights, 1 elite, 1 rest/shop branch, then boss.

2. Turn structure
- Prep: draw hand, trigger start-of-turn effects.
- Spell: create one word from hand (or pass).
- Clash: resolve damage, block, on-hit, and status effects in strict order.
- Cleanup: fatigue rule, discard, enemy intent advance.

3. Word legality
- Base dictionary with profanity filter and minimum length 2.
- Optional accessibility mode: allow near-words with score penalty.

4. Fatigue model
- One card from used word becomes fatigued each turn based on card tags.
- Fatigued cards are unavailable until encounter end unless an effect revives them.

5. Resource model
- HP, Block, Energy, Hex, Boons.
- Hex is applied to enemy; some items consume enemy hex to trigger effects.

6. Deckbuilding loop
- Rewards after fights: choose one of three letter cards or utility cards.
- Optional replace/trash constraints to maintain deck pressure.
- Shops offer card buys, removals, and relic-like items.

7. Character fantasy
- Three launch heroes with asymmetry:
  - Duelist (aggressive, chain words)
  - Arcanist (hex/control)
  - Corsair (risk/reward draw and discard)

## Guardrails

- Keep first playable build focused on one hero and one act.
- Do not require network services to validate words in MVP.
- Avoid overproducing art systems before combat readability is proven.
