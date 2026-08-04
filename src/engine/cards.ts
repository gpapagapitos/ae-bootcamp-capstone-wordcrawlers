import type { Card, CardEdge, HeroId, ItemDef } from "./types.js";

/** Derives left/right edge values for a simple letter card (spec 009 R1). */
export function deriveEdges(
  letter: string,
  value: number,
): { left: CardEdge; right: CardEdge } {
  const isVowel = "aeiou".includes(letter.toLowerCase());

  return {
    left: { hits: value, blocks: isVowel ? 0 : 1, energy: 0 },
    right: { hits: value, blocks: 0, energy: isVowel ? 1 : 0 },
  };
}

export function createLetterCard(
  id: string,
  letter: string,
  value: number,
  rarity: 1 | 2 | 3,
): Card {
  return {
    id,
    letter,
    value,
    rarity,
    tags: [],
    kind: "letter",
    ...deriveEdges(letter, value),
  };
}

const ZERO_EDGE: CardEdge = { hits: 0, blocks: 0, energy: 0 };

/** Wild card: always available, never in hand/deck, no ability, no edge values (spec 009 R3). */
export function createWildCard(heroId: HeroId): Card {
  return {
    id: `wild-${heroId}`,
    letter: "*",
    value: 0,
    rarity: 1,
    tags: [],
    kind: "wild",
    left: ZERO_EDGE,
    right: ZERO_EDGE,
  };
}

const PENALTY_LETTERS = ["q", "z", "x", "j", "v", "w", "k"];

/** Penalty card: no edge values, no ability, negative effect if left unplayed (spec 009 R6). */
export function createPenaltyCard(index: number): Card {
  const letter = PENALTY_LETTERS[index % PENALTY_LETTERS.length];
  return {
    id: `penalty-${index}`,
    letter,
    value: 0,
    rarity: 1,
    tags: [],
    kind: "penalty",
    left: ZERO_EDGE,
    right: ZERO_EDGE,
  };
}

export function createPenaltyPool(): Card[] {
  return PENALTY_LETTERS.map((_, index) => createPenaltyCard(index));
}

/** Enemy Vowel pseudo-card: available while its enemy is active, fatigues after use (spec 009 R5). */
export function createEnemyVowelCard(letter: string): Card {
  return {
    id: `enemy-vowel-${letter}`,
    letter,
    value: 1,
    rarity: 1,
    tags: [],
    kind: "enemyVowel",
    ability: "Advances the enemy's intent to its next action.",
    ...deriveEdges(letter, 1),
  };
}

/** Returns the edge values for a card, falling back to `value` as hits when edges are undefined. */
export function getEdge(card: Card, side: "left" | "right"): CardEdge {
  const edge = side === "left" ? card.left : card.right;
  return edge ?? { hits: card.value, blocks: 0, energy: 0 };
}

/** Rest-node Character Development: bumps a letter card's value/hits by 1 (one-time, Slay-the-Spire-style). */
export function upgradeCard(card: Card): Card {
  if (card.tags.includes("upgraded")) {
    return card;
  }

  return {
    ...card,
    value: card.value + 1,
    tags: [...card.tags, "upgraded"],
    left: { ...getEdge(card, "left"), hits: getEdge(card, "left").hits + 1 },
    right: { ...getEdge(card, "right"), hits: getEdge(card, "right").hits + 1 },
  };
}

/** Each hero's 2 Core Cards (spec 009 R9): one boon-keyed, one hex-keyed item. */
export function createCoreItems(heroId: HeroId): ItemDef[] {
  if (heroId === "duelist") {
    return [
      {
        id: "duelist-core-ironresolve",
        name: "Iron Resolve",
        energyCost: 1,
        isRelic: false,
        singleUse: false,
        effectType: "gainBlocks",
        effectValue: 1,
        description: "Spend 1 energy: gain 1 block this turn.",
      },
      {
        id: "duelist-core-warcry",
        name: "War Cry",
        energyCost: 1,
        isRelic: false,
        singleUse: false,
        effectType: "gainHits",
        effectValue: 1,
        description: "Spend 1 energy: gain 1 hit this turn.",
      },
    ];
  }

  return [
    {
      id: "arcanist-core-hexneedle",
      name: "Hex Needle",
      energyCost: 1,
      isRelic: false,
      singleUse: false,
      effectType: "applyHex",
      effectValue: 1,
      description: "Spend 1 energy: give 1 hex to the enemy.",
    },
    {
      id: "arcanist-core-wardsigil",
      name: "Ward Sigil",
      energyCost: 1,
      isRelic: false,
      singleUse: false,
      effectType: "gainBlocks",
      effectValue: 1,
      description: "Spend 1 energy: gain 1 block this turn.",
    },
  ];
}

/**
 * Each hero's Relic (spec 009 R9 McGuffin-equivalent): no energy cost, auto-fires on a
 * stated trigger instead of manual activation. Magnitudes kept at 1 to match Core Item
 * scale (see spec 009 balance audit note) so a passive Relic isn't strictly stronger than
 * an actively-spent Core Item.
 */
export function createHeroRelics(heroId: HeroId): ItemDef[] {
  if (heroId === "duelist") {
    return [
      {
        id: "duelist-relic-whetstone",
        name: "Whetstone Charm",
        energyCost: 0,
        isRelic: true,
        singleUse: false,
        effectType: "gainBlocks",
        effectValue: 1,
        trigger: "onWordWithoutWild",
        description:
          "Passive: gain 1 block whenever you play a word without the Wild card.",
      },
    ];
  }

  return [
    {
      id: "arcanist-relic-wardingrune",
      name: "Warding Rune",
      energyCost: 0,
      isRelic: true,
      singleUse: false,
      effectType: "applyHex",
      effectValue: 1,
      trigger: "onStageFlip",
      description:
        "Passive: apply 1 hex to the enemy the moment it flips to Stage 2.",
    },
  ];
}
