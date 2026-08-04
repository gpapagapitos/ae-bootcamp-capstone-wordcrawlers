import { STRICT_WORDS } from '../data/words.js';

export interface WordValidationResult {
  valid: boolean;
  reason?: string;
  normalized: string;
}

export function validateWordStrict(word: string): WordValidationResult {
  const normalized = word.trim().toLowerCase();

  if (normalized.length < 2) {
    return { valid: false, reason: 'Word must be at least 2 letters.', normalized };
  }

  if (!/^[a-z]+$/.test(normalized)) {
    return { valid: false, reason: 'Word must contain letters only.', normalized };
  }

  if (!STRICT_WORDS.has(normalized)) {
    return { valid: false, reason: 'Word is not in the strict dictionary.', normalized };
  }

  return { valid: true, normalized };
}
