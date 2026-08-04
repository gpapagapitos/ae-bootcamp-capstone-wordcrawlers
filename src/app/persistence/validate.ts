import type {
  LoadResult,
  RunSaveEnvelope,
  RunSavePayload,
  SaveErrorReason,
  SaveSlot
} from './contracts.js';
import { RUN_SAVE_SCHEMA_VERSION } from './contracts.js';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });

  const formatted = entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);
  return `{${formatted.join(',')}}`;
}

export function computeChecksum(payload: RunSavePayload): string {
  // FNV-1a 32-bit checksum for quick corruption detection.
  let hash = 0x811c9dc5;
  const input = stableStringify(payload);

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function createEnvelope(payload: RunSavePayload, savedAt = Date.now()): RunSaveEnvelope {
  return {
    schemaVersion: RUN_SAVE_SCHEMA_VERSION,
    savedAt,
    checksum: computeChecksum(payload),
    payload
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasRequiredRootFields(raw: unknown): raw is RunSaveEnvelope {
  if (!isRecord(raw)) {
    return false;
  }

  return (
    typeof raw.schemaVersion === 'number' &&
    typeof raw.savedAt === 'number' &&
    typeof raw.checksum === 'string' &&
    isRecord(raw.payload)
  );
}

function hasRequiredPayloadFields(payload: unknown): payload is RunSavePayload {
  if (!isRecord(payload)) {
    return false;
  }

  return isRecord(payload.combat) && isRecord(payload.map) && isRecord(payload.progression);
}

export function validateEnvelope(raw: unknown): {
  ok: true;
  envelope: RunSaveEnvelope;
} | {
  ok: false;
  reason: SaveErrorReason;
} {
  if (!hasRequiredRootFields(raw)) {
    return { ok: false, reason: 'missing-field' };
  }

  if (raw.schemaVersion !== RUN_SAVE_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-schema' };
  }

  if (!hasRequiredPayloadFields(raw.payload)) {
    return { ok: false, reason: 'corrupt-payload' };
  }

  const expected = computeChecksum(raw.payload);
  if (expected !== raw.checksum) {
    return { ok: false, reason: 'invalid-checksum' };
  }

  return { ok: true, envelope: raw };
}

export function toLoadFailure(reason: SaveErrorReason): LoadResult {
  return { ok: false, reason };
}

export function toLoadSuccess(
  envelope: RunSaveEnvelope,
  slot: SaveSlot
): LoadResult {
  return {
    ok: true,
    payload: envelope.payload,
    savedAt: envelope.savedAt,
    slot
  };
}
