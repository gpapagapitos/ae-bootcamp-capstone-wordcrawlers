import { describe, expect, it } from "vitest";
import { resolveClash, resolveTopCard } from "../../src/engine/combat.js";
import { createInitialRunState } from "../../src/engine/state.js";
import type { Card } from "../../src/engine/types.js";

function makeCard(id: string, letter: string, hits: number): Card {
  return {
    id,
    letter,
    value: hits,
    rarity: 1,
    tags: [],
    kind: "letter",
    left: { hits, blocks: 0, energy: 0 },
    right: { hits, blocks: 0, energy: 0 },
  };
}

describe("resolveTopCard", () => {
  it("picks the first card for splay right", () => {
    const cards = [
      makeCard("a", "a", 1),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];
    expect(resolveTopCard(cards, "right")?.id).toBe("a");
  });

  it("picks the last card for splay left", () => {
    const cards = [
      makeCard("a", "a", 1),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];
    expect(resolveTopCard(cards, "left")?.id).toBe("c");
  });

  it("skips wild cards when finding the top card", () => {
    const wild: Card = {
      id: "w",
      letter: "*",
      value: 0,
      rarity: 1,
      tags: [],
      kind: "wild",
    };
    expect(resolveTopCard([wild, makeCard("c", "c", 2)], "right")?.id).toBe(
      "c",
    );
  });
});

describe("resolveClash", () => {
  it("applies no repeat-word penalty (spec 009 R11)", () => {
    const state = createInitialRunState(42, "duelist");
    state.pendingWord = "spell";
    state.pendingWordCards = [makeCard("s", "s", 3), makeCard("p", "p", 3)];

    const first = resolveClash(state, "right");
    state.enemy.hp = state.enemy.maxHp;
    state.pendingWordCards = [makeCard("s2", "s", 3), makeCard("p2", "p", 3)];
    const second = resolveClash(state, "right");

    expect(second.hits).toBe(first.hits);
  });

  it("fatigues only the top card, not the whole word", () => {
    const state = createInitialRunState(42, "duelist");
    state.pendingWord = "arc";
    state.pendingWordCards = [
      makeCard("a", "a", 1),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    const result = resolveClash(state, "right");
    expect(result.topCardId).toBe("a");
  });

  it("grants +1 energy when the word does not use the Wild card (spec 009 R3)", () => {
    const state = createInitialRunState(42, "duelist");
    state.pendingWord = "arc";
    state.pendingWordCards = [
      makeCard("a", "a", 1),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    const result = resolveClash(state, "right");
    expect(result.energyGenerated).toBe(1);
  });

  it("grants no bonus energy when the word uses the Wild card", () => {
    const state = createInitialRunState(42, "duelist");
    const wild: Card = {
      id: "wild-duelist",
      letter: "a",
      value: 0,
      rarity: 1,
      tags: [],
      kind: "wild",
    };
    state.pendingWord = "arc";
    state.pendingWordCards = [
      wild,
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    const result = resolveClash(state, "right");
    expect(result.energyGenerated).toBe(0);
  });

  it("advances the enemy intent and fatigues the Enemy Vowel card when it is top (spec 009 R5)", () => {
    const state = createInitialRunState(42, "duelist");
    const enemyVowel: Card = {
      id: "enemy-vowel-i",
      letter: "i",
      value: 1,
      rarity: 1,
      tags: [],
      kind: "enemyVowel",
      ability: "advance intent",
    };
    const startingIndex = state.enemy.intentIndex;
    state.pendingWord = "in";
    state.pendingWordCards = [enemyVowel, makeCard("n", "n", 2)];

    resolveClash(state, "right");

    expect(state.enemy.intentIndex).toBe(
      (startingIndex + 1) % state.enemy.intents.length,
    );
    expect(state.enemyVowelAvailable).toBe(false);
  });

  it("flips the enemy to Stage 2 with overflow damage and grants a Penalty card", () => {
    const state = createInitialRunState(42, "duelist");
    state.enemy.hp = 3;
    const penaltyPoolSizeBefore = state.penaltyPool.length;
    state.pendingWord = "arc";
    state.pendingWordCards = [
      makeCard("a", "a", 5),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    const result = resolveClash(state, "right");

    expect(result.enemyStageFlipped).toBe(true);
    expect(state.enemy.stage).toBe(2);
    expect(state.penaltyPool.length).toBe(penaltyPoolSizeBefore - 1);
    expect(state.deck.discard.some((card) => card.kind === "penalty")).toBe(
      true,
    );
  });

  it("applies 1 hex from the onStageFlip Relic when the arcanist flips an enemy to Stage 2 (spec 009 R9)", () => {
    const state = createInitialRunState(42, "arcanist");
    state.enemy.hp = 3;
    const hexBefore = state.enemy.hex;
    state.pendingWord = "arc";
    state.pendingWordCards = [
      makeCard("a", "a", 5),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    resolveClash(state, "right");

    expect(state.enemy.hex).toBe(hexBefore + 1);
  });

  it("applies 1 block from the onWordWithoutWild Relic for the duelist (spec 009 R9)", () => {
    const state = createInitialRunState(42, "duelist");
    state.enemy.intents = [{ type: "block", value: 1 }];
    state.enemy.intentIndex = 0;
    state.pendingWord = "arc";
    state.pendingWordCards = [
      makeCard("a", "a", 1),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    resolveClash(state, "right");

    expect(state.hero.block).toBe(1);
  });

  it("adds a Penalty card to the deck on an enemy debuff intent (spec 009 R6)", () => {
    const state = createInitialRunState(42, "duelist");
    state.enemy.intents = [{ type: "debuff", value: 0 }];
    state.enemy.intentIndex = 0;
    const penaltyPoolSizeBefore = state.penaltyPool.length;
    state.pendingWord = "arc";
    state.pendingWordCards = [
      makeCard("a", "a", 1),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    resolveClash(state, "right");

    expect(state.penaltyPool.length).toBe(penaltyPoolSizeBefore - 1);
    expect(state.deck.discard.some((card) => card.kind === "penalty")).toBe(
      true,
    );
  });

  it("caps hero energy at MAX_ENERGY instead of growing unbounded (spec 009 R9 balance pass)", () => {
    const state = createInitialRunState(42, "duelist");
    state.enemy.intents = [{ type: "block", value: 1 }];
    state.enemy.intentIndex = 0;
    state.hero.energy = 6;
    state.pendingWord = "arc";
    state.pendingWordCards = [
      makeCard("a", "a", 1),
      makeCard("r", "r", 2),
      makeCard("c", "c", 2),
    ];

    resolveClash(state, "right");

    expect(state.hero.energy).toBe(6);
  });
});
