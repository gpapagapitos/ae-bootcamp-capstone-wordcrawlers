import type { LocalStorageLike } from "./contracts.js";

export const TUTORIAL_SEEN_KEY = "wordcrawlers.tutorial.seen.v1";

function resolveStorage(storage?: LocalStorageLike): LocalStorageLike | null {
  if (storage) {
    return storage;
  }

  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
}

/** Defaults to "not seen" whenever storage is unavailable or throws, per spec 010 T3. */
export function isTutorialSeen(storage?: LocalStorageLike): boolean {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return false;
  }

  try {
    return targetStorage.getItem(TUTORIAL_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

export function markTutorialSeen(storage?: LocalStorageLike): void {
  const targetStorage = resolveStorage(storage);
  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.setItem(TUTORIAL_SEEN_KEY, "true");
  } catch {
    // Non-fatal: persistence failure should not affect the current tutorial run.
  }
}
