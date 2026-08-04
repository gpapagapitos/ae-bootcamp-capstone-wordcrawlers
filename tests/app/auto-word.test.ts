import { describe, expect, it } from "vitest";
import { findBestPlayableWord } from "../../src/app/combat/auto-word.js";
import type { Card } from "../../src/engine/types.js";

function card(letter: string, value = 1, index = 0): Card {
  return {
    id: `c-${letter}-${index}`,
    letter,
    value,
    rarity: 1,
    tags: [],
  };
}

describe("findBestPlayableWord", () => {
  it("returns null when no strict dictionary word can be formed", () => {
    const hand = [card("z", 2, 1), card("q", 2, 2), card("x", 2, 3)];
    expect(findBestPlayableWord(hand)).toBeNull();
  });

  it("prefers higher score words available in hand", () => {
    const hand = [
      card("s", 2, 1),
      card("w", 2, 2),
      card("o", 1, 3),
      card("r", 2, 4),
      card("d", 2, 5),
      card("a", 1, 6),
      card("r", 2, 7),
      card("c", 2, 8),
    ];

    expect(findBestPlayableWord(hand)).toBe("sword");
  });

  it("breaks score and length ties lexicographically", () => {
    const hand = [
      card("h", 1),
      card("e", 1),
      card("x", 1),
      card("i", 1),
      card("n", 1),
      card("k", 1),
    ];

    expect(findBestPlayableWord(hand)).toBe("hex");
  });
});
