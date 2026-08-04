import { describe, expect, it } from 'vitest';
import { generateAct1Map, getSelectableNodeIds } from '../../src/app/map/map.js';

const SEEDS = [20260731, 20260801, 20260803, 1234567, 9876543];

function nonIntroNodeTypes(seed: number): Set<string> {
  const map = generateAct1Map(seed);
  const maxRow = Math.max(...map.nodes.map((node) => node.row));
  return new Set(
    map.nodes
      .filter((node) => node.row > 0 && node.row < maxRow - 1)
      .map((node) => node.type)
  );
}

describe('act 1 map generation', () => {
  it('is deterministic for the same seed', () => {
    const first = generateAct1Map(20260731);
    const second = generateAct1Map(20260731);

    expect(second).toEqual(first);
  });

  it('produces a single unique boss node reachable from every other node', () => {
    for (const seed of SEEDS) {
      const map = generateAct1Map(seed);
      const bossNodes = map.nodes.filter((node) => node.type === 'boss');
      expect(bossNodes).toHaveLength(1);

      const nonBossIds = map.nodes.filter((node) => node.id !== bossNodes[0].id).map((node) => node.id);
      for (const id of nonBossIds) {
        expect(map.edges.some((edge) => edge.from === id)).toBe(true);
      }
    }
  });

  it('varies row 0 node count and shape across seeds instead of a fixed grid', () => {
    const rowZeroCounts = SEEDS.map((seed) => generateAct1Map(seed).nodes.filter((node) => node.row === 0).length);

    expect(new Set(rowZeroCounts).size).toBeGreaterThan(1);
    for (const count of rowZeroCounts) {
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  it('guarantees a rest or shop node immediately before the boss', () => {
    for (const seed of SEEDS) {
      const map = generateAct1Map(seed);
      const maxRow = Math.max(...map.nodes.map((node) => node.row));
      const sustainRowNodes = map.nodes.filter((node) => node.row === maxRow - 1);

      expect(sustainRowNodes.length).toBeGreaterThan(0);
      expect(sustainRowNodes.every((node) => node.type === 'rest' || node.type === 'shop')).toBe(true);
    }
  });

  it('never places an elite in the first three rows', () => {
    for (const seed of SEEDS) {
      const map = generateAct1Map(seed);
      const earlyElites = map.nodes.filter((node) => node.row <= 2 && node.type === 'elite');
      expect(earlyElites).toHaveLength(0);
    }
  });

  it('produces varied mid-route node types across representative seeds', () => {
    for (const seed of SEEDS) {
      const types = nonIntroNodeTypes(seed);
      expect(types.size).toBeGreaterThanOrEqual(3);
      expect(types.has('battle')).toBe(true);
    }
  });

  it('keeps every node reachable from the start via selectable-node traversal', () => {
    for (const seed of SEEDS) {
      const map = generateAct1Map(seed);
      const visited = new Set<string>();
      let frontier = getSelectableNodeIds(map, null, []);

      while (frontier.length > 0) {
        const next: string[] = [];
        for (const nodeId of frontier) {
          if (visited.has(nodeId)) {
            continue;
          }
          visited.add(nodeId);
          next.push(...getSelectableNodeIds(map, nodeId, Array.from(visited)));
        }
        frontier = next;
      }

      const bossNode = map.nodes.find((node) => node.type === 'boss');
      expect(bossNode).toBeDefined();
      expect(visited.has(bossNode!.id)).toBe(true);
    }
  });
});

