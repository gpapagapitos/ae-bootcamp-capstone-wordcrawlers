import { create } from 'zustand';
import { generateAct1Map, getSelectableNodeIds, resolveNodeLabel } from '../map/map.js';
import type { ActMap } from '../map/types.js';

interface EncounterRecord {
  nodeId: string;
  label: string;
}

interface MapState {
  map: ActMap;
  currentNodeId: string | null;
  visitedNodeIds: string[];
  encounterHistory: EncounterRecord[];
  selectNode: (nodeId: string) => boolean;
  resetMap: (seed?: number) => void;
}

const DEFAULT_SEED = 20260731;

function buildInitialState(seed: number): Omit<MapState, 'selectNode' | 'resetMap'> {
  return {
    map: generateAct1Map(seed),
    currentNodeId: null,
    visitedNodeIds: [],
    encounterHistory: []
  };
}

export const useMapStore = create<MapState>((set, get) => ({
  ...buildInitialState(DEFAULT_SEED),

  selectNode: (nodeId: string) => {
    const state = get();
    const selectable = getSelectableNodeIds(state.map, state.currentNodeId, state.visitedNodeIds);
    if (!selectable.includes(nodeId)) {
      return false;
    }

    const node = state.map.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return false;
    }

    set({
      currentNodeId: nodeId,
      visitedNodeIds: [...state.visitedNodeIds, nodeId],
      encounterHistory: [
        ...state.encounterHistory,
        {
          nodeId,
          label: resolveNodeLabel(node.type)
        }
      ]
    });

    return true;
  },

  resetMap: (seed = DEFAULT_SEED) => {
    set(buildInitialState(seed));
  }
}));
