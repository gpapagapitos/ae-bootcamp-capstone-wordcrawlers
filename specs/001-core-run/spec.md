# Spec 001: Core Run (Word Combat + Deckbuilding)

## Status

Implemented — phases A–D complete; phase E (integration tests, CI traceability) in progress

## User Story

As a player, I want to complete a dungeon run by forming words from my deck so that I can defeat enemies, build a stronger deck, and beat a boss.

## Scope

This spec defines the first playable vertical slice.

## Requirements

### R1 Combat Turn

- System shall execute turns in order: Prep -> Spell -> Clash -> Cleanup.
- System shall show enemy intent before player submits or passes.

### R2 Word Submission

- Player shall be able to submit one word using cards in hand.
- System shall validate word against local dictionary.
- Player shall be able to pass turn without submitting a word.

### R3 Resolution

- Submitted word shall produce base attack from letter values plus modifiers.
- Block and status effects shall resolve in deterministic order.
- Stun shall cancel the next enemy action.

### R4 Deck State

- Used cards shall move to discard unless fatigued or otherwise redirected.
- One eligible card from the word shall be fatigued during Cleanup.
- If draw sources are exhausted, player may continue until no legal actions remain.

### R5 Rewards and Progress

- Non-boss victory shall grant reward choice (3 options, choose 1).
- Shop node shall allow card buy and optional card removal.
- Boss victory shall end run as win.

### R6 UX Clarity

- UI shall display HP, block, deck count, discard count, fatigue count, energy, and enemy intent.
- System shall include an action log for the last turn.

## Acceptance Criteria

1. Given a valid hand, when player submits a valid word, then damage is applied and turn resolves without ambiguity.
2. Given player passes, when turn ends, then enemy still acts unless stunned.
3. Given fatigue triggers and eligible targets exist, one card is moved to fatigue.
4. Given enemy HP reaches 0, reward screen appears.
5. Given boss HP reaches 0, run victory screen appears.

## Resolved Decisions

1. Repeated words are allowed with **no penalty**, matching the source board game rules.
   (Supersedes the earlier -10%/repeat, -40% cap decision — see spec 009.)
2. Proper nouns are not legal in MVP strict dictionary mode.
3. Y is auto-classified contextually by dictionary validity; there is no player toggle in MVP.
4. Opening hand size for MVP is 7 cards.

## Superseded By

Core combat mechanics (splay direction, top-card ability/fatigue, hex/boon economy,
wild cards, enemy stage flip) are now formally defined in
[specs/009-board-game-rules-fidelity/spec.md](../009-board-game-rules-fidelity/spec.md).
Where this spec's R3/R4 conflict with spec 009, spec 009 governs.
