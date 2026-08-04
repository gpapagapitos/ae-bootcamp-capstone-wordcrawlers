import { describe, expect, it } from 'vitest';
import { validateWordStrict } from '../../src/engine/word-validation.js';

describe('validateWordStrict', () => {
  it('accepts valid dictionary words', () => {
    const result = validateWordStrict('spell');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('spell');
  });

  it('accepts common short words included for MVP playtests', () => {
    const result = validateWordStrict('car');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('car');
  });

  it('accepts dictionary words not explicitly listed in curated gameplay words', () => {
    const result = validateWordStrict('stone');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('stone');
  });

  it('rejects non-alpha words', () => {
    const result = validateWordStrict('sp3ll');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('letters only');
  });

  it('rejects words not in dictionary', () => {
    const result = validateWordStrict('blorptastic');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('strict dictionary');
  });

  it('rejects proper nouns in strict dictionary mode', () => {
    const result = validateWordStrict('London');
    expect(result.valid).toBe(false);
    expect(result.normalized).toBe('london');
    expect(result.reason).toContain('strict dictionary');
  });

  it('handles Y context through dictionary validity (no player toggle)', () => {
    const validYWord = validateWordStrict('glyph');
    const invalidYWord = validateWordStrict('yyzzqq');

    expect(validYWord.valid).toBe(true);
    expect(validYWord.normalized).toBe('glyph');
    expect(invalidYWord.valid).toBe(false);
    expect(invalidYWord.reason).toContain('strict dictionary');
  });
});
