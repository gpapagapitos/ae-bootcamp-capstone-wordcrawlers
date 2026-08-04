import { describe, expect, it } from "vitest";
import {
  createBossRelicPool,
  createStandardRelicPool,
  createStarterConsumablePool,
} from "../../src/engine/cards.js";
import { createInitialRunState } from "../../src/engine/state.js";

describe("initial run state", () => {
  it("draws 7 cards for duelist opening hand", () => {
    const state = createInitialRunState(101, "duelist");

    expect(state.deck.hand.length).toBe(7);
  });

  it("draws 7 cards for arcanist opening hand", () => {
    const state = createInitialRunState(101, "arcanist");

    expect(state.deck.hand.length).toBe(7);
  });

  it("starts with an empty consumable inventory", () => {
    const state = createInitialRunState(101, "duelist");

    expect(state.consumables).toEqual([]);
  });

  it("layers acquired Relics on top of the hero's base Relic (spec 011 RC1/RC2)", () => {
    const [bossRelic] = createBossRelicPool();
    const state = createInitialRunState(101, "duelist", 0, [bossRelic]);

    expect(state.relics).toHaveLength(2);
    expect(state.relics.map((r) => r.def.id)).toContain(bossRelic.id);
  });

  it("carries acquired Consumables into a fresh encounter (spec 011 RC6)", () => {
    const [cinderDraught] = createStarterConsumablePool();
    const state = createInitialRunState(101, "duelist", 0, [], [
      { def: cinderDraught },
    ]);

    expect(state.consumables).toHaveLength(1);
    expect(state.consumables[0].def.id).toBe(cinderDraught.id);
  });
});

describe("spec 011 content pools", () => {
  it("Boss Relic pool has exactly 2 single-sided entries", () => {
    const pool = createBossRelicPool();

    expect(pool).toHaveLength(2);
    expect(pool.every((def) => def.isRelic)).toBe(true);
  });

  it("Standard Relic pool has exactly 2 double-sided entries", () => {
    const pool = createStandardRelicPool();

    expect(pool).toHaveLength(2);
    for (const option of pool) {
      expect(option.sideA.id).not.toBe(option.sideB.id);
    }
  });

  it("starter Consumable pool has 3 entries reusing the existing effect vocabulary", () => {
    const pool = createStarterConsumablePool();

    expect(pool).toHaveLength(3);
    expect(
      pool.every((def) =>
        ["gainHits", "gainBlocks", "gainEnergy", "applyHex"].includes(
          def.effectType,
        ),
      ),
    ).toBe(true);
  });
});
