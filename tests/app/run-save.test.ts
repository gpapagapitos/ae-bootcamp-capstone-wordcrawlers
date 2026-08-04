import { describe, expect, it } from 'vitest';
import { generateAct1Map } from '../../src/app/map/map.js';
import {
  RUN_SAVE_KEYS,
  RUN_SAVE_SCHEMA_VERSION,
  type LocalStorageLike,
  type RunSavePayload
} from '../../src/app/persistence/contracts.js';
import {
  clearRunSnapshot,
  loadRunSnapshot,
  saveRunSnapshot
} from '../../src/app/persistence/runSave.js';
import { createEnvelope } from '../../src/app/persistence/validate.js';
import { createInitialRunState } from '../../src/engine/state.js';

class MemoryStorage implements LocalStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function createPayload(seed: number): RunSavePayload {
  return {
    combat: {
      encounterNodeId: 'r0-l0',
      run: createInitialRunState(seed, 'duelist'),
      heroId: 'duelist',
      composedCardIds: [],
      lastError: null
    },
    map: {
      map: generateAct1Map(seed),
      currentNodeId: 'r0-l0',
      visitedNodeIds: ['r0-l0'],
      encounterHistory: [{ nodeId: 'r0-l0', label: 'Battle' }]
    },
    progression: {
      heroId: 'duelist',
      boon: 12,
      heroHp: 50,
      heroMaxHp: 50,
      runDeck: createInitialRunState(seed, 'duelist').deck.draw,
      activeModal: null,
      rewardOptions: [],
      shopOffers: [],
      restCardOptions: [],
      eventDef: null,
      eventResult: null,
      eventResultEffects: null,
      pendingBuff: null,
      initialized: true
    }
  };
}

describe('run save persistence', () => {
  it('saves and restores current payload', () => {
    const storage = new MemoryStorage();
    const payload = createPayload(101);

    const save = saveRunSnapshot(payload, storage);
    expect(save.ok).toBe(true);

    const load = loadRunSnapshot(storage);
    expect(load.ok).toBe(true);
    if (!load.ok) {
      throw new Error('expected successful load');
    }

    expect(load.slot).toBe('current');
    expect(load.payload).toEqual(payload);
  });

  it('falls back to previous slot when current is corrupted', () => {
    const storage = new MemoryStorage();
    const first = createPayload(201);
    const second = createPayload(202);

    saveRunSnapshot(first, storage);
    saveRunSnapshot(second, storage);

    storage.setItem(RUN_SAVE_KEYS.current, '{broken-json');

    const load = loadRunSnapshot(storage);
    expect(load.ok).toBe(true);
    if (!load.ok) {
      throw new Error('expected fallback load');
    }

    expect(load.slot).toBe('previous');
    expect(load.payload).toEqual(first);
  });

  it('returns unsupported schema when version does not match', () => {
    const storage = new MemoryStorage();
    const payload = createPayload(303);
    const envelope = createEnvelope(payload, 123);

    storage.setItem(
      RUN_SAVE_KEYS.current,
      JSON.stringify({
        ...envelope,
        schemaVersion: RUN_SAVE_SCHEMA_VERSION + 1
      })
    );

    const load = loadRunSnapshot(storage);
    expect(load.ok).toBe(false);
    if (load.ok) {
      throw new Error('expected schema failure');
    }

    expect(load.reason).toBe('unsupported-schema');
  });

  it('detects checksum mismatch as corruption', () => {
    const storage = new MemoryStorage();
    const payload = createPayload(404);
    const envelope = createEnvelope(payload, 321);

    storage.setItem(
      RUN_SAVE_KEYS.current,
      JSON.stringify({
        ...envelope,
        checksum: 'deadbeef'
      })
    );

    const load = loadRunSnapshot(storage);
    expect(load.ok).toBe(false);
    if (load.ok) {
      throw new Error('expected checksum failure');
    }

    expect(load.reason).toBe('invalid-checksum');
  });

  it('clears all slots', () => {
    const storage = new MemoryStorage();
    const payload = createPayload(505);

    saveRunSnapshot(payload, storage);
    const cleared = clearRunSnapshot(storage);

    expect(cleared.ok).toBe(true);
    expect(storage.getItem(RUN_SAVE_KEYS.current)).toBeNull();
    expect(storage.getItem(RUN_SAVE_KEYS.previous)).toBeNull();
    expect(storage.getItem(RUN_SAVE_KEYS.temp)).toBeNull();
  });
});
