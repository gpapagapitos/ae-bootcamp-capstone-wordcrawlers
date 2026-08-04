# UI/UX Direction

## Status (2026-08-03)

Superseded: the dark "Vault Reclaimed" theme below was implemented, then replaced after playtest
feedback with a flat parchment/tabletop-card theme (cream/ink/antique-gold/burgundy, no gradients),
informed by physical card game component language (Paperback Adventures rulebook: letter cards with
corner indices, name-banner tray cards, tactile counters). See `src/styles.css` `:root` for the
current palette. The sections below are kept as historical context for the original direction.

## Experience Goal

A tactile, reclaimed-earth fantasy roguelite where emerging from a buried vault and spelling a word feels like restoring old magic to a changed world.

## What "Vault Reclaimed" Means

Vault reclaimed is a grounded fantasy survival tone: weathered stone, moss, root systems, sun-faded parchment, salvaged brass, and the feeling that civilization is being rebuilt on top of something older.

- Palette: bark browns, moss greens, river clay, bark-gray stone, warm parchment, tarnished brass.
- Shapes: carved stone frames, leaf and vine motifs, rounded relic badges, softened edge wear.
- Tone: hopeful but dangerous, rooted in nature, memory, and survival.

## Palette Candidates

1. Verdant Vault
- Moss green, root brown, stone gray, parchment, brass.
- Best for: natural overgrowth, ruin exploration, and calmer readability.

2. Ember Canopy
- Deep fern, ember clay, charcoal bark, faded bone paper, warm gold.
- Best for: a more dramatic, sunset-wilderness feel with stronger contrast.

3. Reed and Resin
- Wet earth, lichen green, river slate, cedar, oxidized bronze.
- Best for: a more grounded, expeditionary look.

Recommended direction: Verdant Vault.

## Visual Pillars

1. Earth recovered
- Layered stone, bark, moss, and parchment textures.
- Overgrowth, roots, and weathered relics should be part of the frame language.

2. Combat readability first
- Enemy intent, pending damage, and card effects are always visible.

3. Satisfying word payoff
- On submit, letters snap into a spell ribbon; damage pulses with clear numbers.

4. Original card identity
- Vault-born mood, but original composition, symbols, and frame language.
- Readability and a11y rules override decorative details when conflicts appear.

## Core Screens

- Run map screen with clear branching and risk indicators.
- Combat screen with hand tray, word builder rail, and enemy intent stack framed as a battlefield in a reclaimed ruin.
- Reward/shop modals with comparison preview and deck impact hints.
- Deck screen showing curve, vowels/consonants ratio, and fatigue susceptibility.

## UX Rules

- Never hide the reason for damage or blocked damage.
- Every action has immediate feedback in action log.
- Pass turn is explicit and always visible.
- Undo allowed during word composition before submit.
- Keep turn flow fast: submit-to-resolution should feel immediate, with concise but legible combat feedback.

## Accessibility

- Dyslexia-friendly font option.
- High contrast mode.
- Adjustable animation speed.
- Optional assisted dictionary suggestions.

## Audio/Feel

- Typewriter-inspired letter placement sounds.
- Bass hit on high-damage words.
- Distinct boss warning stinger on phase transitions.
