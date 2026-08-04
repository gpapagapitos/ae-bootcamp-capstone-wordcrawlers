# Spec 004: Card Visual Language + A11y Contract

## Status
Implemented — card visual hierarchy, rarity borders, and ability text conventions applied in CardPreview.tsx and styles.css

## User Story
As a player, I want cards that look dramatic and memorable while staying instantly readable, so I can make fast decisions without visual strain.

## Scope
This spec defines the visual structure, readability contract, and accessibility thresholds for all playable cards in the MVP UI.

## Inspiration Boundaries
- Visual direction may be inspired by modern pulp tabletop presentation (including the mood and framing energy seen in Paperback Adventures references).
- Team shall not copy protected artwork, icon sets, typography lockups, or exact card layouts from any external product.
- Team shall produce original frames, icon shapes, texture treatment, and hierarchy for Wordcrawlers.

## Requirements

### R1 Core Card Anatomy
- Every card shall include these fixed zones in this order:
  1. Letter anchor (largest visual token)
  2. Cost/value chip
  3. Title + role tag
  4. Timing label (On Submit / On Clash / On Cleanup)
  5. Primary effect sentence
  6. Optional reminder text
- Card width/height ratio shall remain consistent across hand, preview, and reward states.

### R2 Distinctive Visual Style
- Card frames shall use an original dark-pulp treatment: worn paper base, ink texture accents, and metallic danger highlights.
- Rarity shall be encoded by frame treatment and one secondary cue (icon or pattern), not color alone.
- Role type (attack/control/utility) shall have a unique icon and border accent with at least one non-color differentiator.

### R3 Readability Contract
- Letter anchor shall be readable at a glance in hand view at minimum supported viewport width.
- Primary effect text shall target 14px minimum equivalent in default mode.
- Body text line length shall stay within approximately 28-42 characters per line in card-detail contexts.
- Key numeric values (damage, block, stacks) shall be visually isolated from prose.

### R4 Accessibility Thresholds
- Text/background contrast shall meet WCAG 2.2 AA at minimum:
  - Normal text: 4.5:1
  - Large text (18px regular or 14px bold equivalent): 3:1
- Interactive focus states shall be visible with a focus indicator contrast ratio of at least 3:1 against adjacent colors.
- Color-only communication is disallowed for rarity, role, status, or timing.
- Dyslexia-friendly font mode shall be supported for card body text.

### R5 Motion and Feedback
- Hover/select animation shall emphasize selection and readability, not obscure text.
- Motion duration for card transitions shall default to 120-220ms with a reduced-motion mode that minimizes movement.
- Damage/resolve feedback shall preserve card legibility while effects play.

### R6 Responsive Behavior
- Card layout shall preserve hierarchy on desktop and mobile.
- At narrow widths, secondary flavor/reminder content may collapse, but letter, timing, and primary effect must remain visible without extra interaction.
- In compact mode, cards shall keep tappable hit targets of at least 44x44 CSS pixels for interactive elements.

## Acceptance Criteria

1. Given any standard card in hand view, when viewed on the minimum supported viewport, then letter anchor, timing label, and primary effect are all legible without zoom.
2. Given a contrast audit, when tested against card text and controls, then all required AA ratios pass.
3. Given color-vision simulation checks, when role/rarity/status are reviewed, then each remains distinguishable without relying on hue alone.
4. Given reduced-motion is enabled, when cards are hovered/selected/resolved, then motion is reduced and no gameplay information is lost.
5. Given inspiration references are reviewed, when final frames/icons are compared, then assets are original and not a direct copy of external products.

## Deliverables
- Card component variants: default, hover, selected, disabled, reward preview, upgraded.
- Token set: role icons, rarity indicators, timing chips.
- Theme tokens: colors, typography scale, spacing, border treatments, texture overlays.
- A11y QA checklist with pass/fail fields.

## Resolved Decisions

1. Rarity indicators use diegetic sigils with a consistent utility fallback shape, so they feel thematic while staying scannable.
2. Timing labels use text plus icon; text remains mandatory and icon acts as a secondary scan aid.
3. MVP includes a global high-contrast toggle that is independent from dyslexia-friendly font mode.
