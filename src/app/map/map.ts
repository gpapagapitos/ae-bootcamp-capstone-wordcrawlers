import { createRng } from '../../engine/rng.js';
import type { ActMap, MapNode, MapNodeType } from './types.js';

/**
 * StS-style branching map: several independent random walks across a wide column band,
 * deduped into a shared node/edge graph, instead of a fixed grid. Produces a variable
 * number of nodes per row and diagonal/crossing paths for a coherent but organic route.
 */
const ROWS = 10;
const COLS = 6;
const PATH_COUNT = 5;
const BOSS_ROW = ROWS - 1;
const SUSTAIN_ROW = ROWS - 2;
const BOSS_COL = Math.floor(COLS / 2);
const FIRST_THIRD_ROW = Math.floor(ROWS / 3);
const MAX_EVENTS_IN_FIRST_THIRD = 1;

const NODE_POOL: MapNodeType[] = ['battle', 'battle', 'battle', 'event', 'treasure', 'shop', 'rest', 'elite'];

function nodeId(row: number, lane: number): string {
  return `r${row}-l${lane}`;
}

function clampCol(col: number): number {
  return Math.max(0, Math.min(COLS - 1, col));
}

interface WalkGraph {
  nodeIds: Set<string>;
  edgeKeys: Set<string>;
  parentIds: Map<string, string[]>;
}

/** Runs several independent random walks from row 0 to the boss, deduping shared nodes/edges. */
function buildWalkGraph(rng: { next: () => number }): WalkGraph {
  const nodeIds = new Set<string>();
  const edgeKeys = new Set<string>();
  const parentIds = new Map<string, string[]>();

  const addEdge = (fromId: string, toId: string) => {
    const key = `${fromId}->${toId}`;
    if (edgeKeys.has(key)) {
      return;
    }
    edgeKeys.add(key);
    const parents = parentIds.get(toId) ?? [];
    parents.push(fromId);
    parentIds.set(toId, parents);
  };

  for (let path = 0; path < PATH_COUNT; path += 1) {
    const spread = Math.floor((path + 0.5) * (COLS / PATH_COUNT));
    const wobbleRoll = rng.next();
    const startCol = clampCol(spread + (wobbleRoll < 0.34 ? -1 : wobbleRoll < 0.68 ? 1 : 0));

    let col = startCol;
    let previousId = nodeId(0, col);
    nodeIds.add(previousId);

    for (let row = 1; row <= SUSTAIN_ROW; row += 1) {
      const stepRoll = rng.next();
      const step = stepRoll < 0.33 ? -1 : stepRoll < 0.66 ? 0 : 1;
      col = clampCol(col + step);

      const currentId = nodeId(row, col);
      nodeIds.add(currentId);
      addEdge(previousId, currentId);
      previousId = currentId;
    }

    const bossId = nodeId(BOSS_ROW, BOSS_COL);
    nodeIds.add(bossId);
    addEdge(previousId, bossId);
  }

  return { nodeIds, edgeKeys, parentIds };
}

function parseNodeId(id: string): { row: number; lane: number } {
  const [rowPart, lanePart] = id.slice(1).split('-l');
  return { row: Number(rowPart), lane: Number(lanePart) };
}

/** Picks a node type honoring: boss/start-row/sustain-row overrides, no early or back-to-back elites, capped early events. */
function pickNodeType(
  row: number,
  lane: number,
  rng: { next: () => number },
  parentTypes: MapNodeType[],
  eventsInFirstThird: { count: number }
): MapNodeType {
  if (row === BOSS_ROW) {
    return 'boss';
  }
  if (row === 0) {
    return lane % 2 === 0 ? 'battle' : 'event';
  }
  if (row === SUSTAIN_ROW) {
    return lane % 2 === 0 ? 'rest' : 'shop';
  }

  const parentHasElite = parentTypes.includes('elite');
  const inFirstThird = row < FIRST_THIRD_ROW;

  for (let attempt = 0; attempt < NODE_POOL.length; attempt += 1) {
    const index = Math.floor(rng.next() * NODE_POOL.length);
    const candidate = NODE_POOL[index];

    if (candidate === 'elite' && (row <= 2 || parentHasElite)) {
      continue;
    }
    if (candidate === 'event' && inFirstThird && eventsInFirstThird.count >= MAX_EVENTS_IN_FIRST_THIRD) {
      continue;
    }

    if (candidate === 'event' && inFirstThird) {
      eventsInFirstThird.count += 1;
    }
    return candidate;
  }

  return 'battle';
}

export function generateAct1Map(seed: number): ActMap {
  const rng = createRng(seed);
  const { nodeIds, edgeKeys, parentIds } = buildWalkGraph(rng);

  const ordered = Array.from(nodeIds)
    .map((id) => ({ id, ...parseNodeId(id) }))
    .sort((a, b) => (a.row - b.row) || (a.lane - b.lane));

  const typesById = new Map<string, MapNodeType>();
  const eventsInFirstThird = { count: 0 };

  for (const entry of ordered) {
    const parentTypes = (parentIds.get(entry.id) ?? [])
      .map((parentId) => typesById.get(parentId))
      .filter((type): type is MapNodeType => Boolean(type));

    typesById.set(entry.id, pickNodeType(entry.row, entry.lane, rng, parentTypes, eventsInFirstThird));
  }

  const nodes: MapNode[] = ordered.map((entry) => ({
    id: entry.id,
    row: entry.row,
    lane: entry.lane,
    type: typesById.get(entry.id) ?? 'battle'
  }));

  const edges = Array.from(edgeKeys).map((key) => {
    const [from, to] = key.split('->');
    return { from, to };
  });

  return { nodes, edges };
}


export function getSelectableNodeIds(
  map: ActMap,
  currentNodeId: string | null,
  visitedNodeIds: string[]
): string[] {
  if (!currentNodeId) {
    return map.nodes.filter((n) => n.row === 0).map((n) => n.id);
  }

  const selectable = map.edges
    .filter((e) => e.from === currentNodeId)
    .map((e) => e.to)
    .filter((id) => !visitedNodeIds.includes(id));

  return selectable;
}

export function resolveNodeLabel(type: MapNodeType): string {
  switch (type) {
    case 'battle':
      return 'Battle';
    case 'elite':
      return 'Elite';
    case 'event':
      return 'Event';
    case 'treasure':
      return 'Treasure';
    case 'shop':
      return 'Shop';
    case 'rest':
      return 'Rest';
    case 'boss':
      return 'Boss';
    default:
      return 'Unknown';
  }
}
