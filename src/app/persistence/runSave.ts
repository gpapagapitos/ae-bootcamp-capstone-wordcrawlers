import type {
  LocalStorageLike,
  LoadResult,
  RunSavePayload,
  SaveResult,
  SaveSlot,
} from "./contracts.js";
import { RUN_SAVE_KEYS } from "./contracts.js";
import {
  createEnvelope,
  toLoadFailure,
  toLoadSuccess,
  validateEnvelope,
} from "./validate.js";

function resolveStorage(storage?: LocalStorageLike): LocalStorageLike | null {
  if (storage) {
    return storage;
  }

  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
}

function readSlot(storage: LocalStorageLike, slot: SaveSlot): LoadResult {
  const key =
    slot === "current" ? RUN_SAVE_KEYS.current : RUN_SAVE_KEYS.previous;
  const raw = storage.getItem(key);
  if (!raw) {
    return toLoadFailure("not-found");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return toLoadFailure("invalid-json");
  }

  const validated = validateEnvelope(parsed);
  if (!validated.ok) {
    return toLoadFailure(validated.reason);
  }

  return toLoadSuccess(validated.envelope, slot);
}

export function saveRunSnapshot(
  payload: RunSavePayload,
  storage?: LocalStorageLike,
): SaveResult {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return { ok: false, reason: "storage-unavailable" };
  }

  const envelope = createEnvelope(payload);
  const serialized = JSON.stringify(envelope);

  try {
    targetStorage.setItem(RUN_SAVE_KEYS.temp, serialized);

    const current = targetStorage.getItem(RUN_SAVE_KEYS.current);
    if (current) {
      targetStorage.setItem(RUN_SAVE_KEYS.previous, current);
    }

    targetStorage.setItem(RUN_SAVE_KEYS.current, serialized);
    targetStorage.removeItem(RUN_SAVE_KEYS.temp);

    return { ok: true };
  } catch {
    return { ok: false, reason: "write-failed" };
  }
}

export function loadRunSnapshot(storage?: LocalStorageLike): LoadResult {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return toLoadFailure("storage-unavailable");
  }

  const current = readSlot(targetStorage, "current");
  if (current.ok) {
    return current;
  }

  const previous = readSlot(targetStorage, "previous");
  if (previous.ok) {
    return previous;
  }

  return toLoadFailure(
    current.reason !== "not-found" ? current.reason : previous.reason,
  );
}

export function clearRunSnapshot(storage?: LocalStorageLike): SaveResult {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return { ok: false, reason: "storage-unavailable" };
  }

  try {
    targetStorage.removeItem(RUN_SAVE_KEYS.temp);
    targetStorage.removeItem(RUN_SAVE_KEYS.current);
    targetStorage.removeItem(RUN_SAVE_KEYS.previous);
    return { ok: true };
  } catch {
    return { ok: false, reason: "write-failed" };
  }
}
