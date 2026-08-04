import words from 'an-array-of-english-words';

const curatedGameplayWords = [
  'arc',
  'blade',
  'boss',
  'card',
  'clash',
  'crawl',
  'dungeon',
  'glyph',
  'hex',
  'ink',
  'loot',
  'quest',
  'rune',
  'spell',
  'sword',
  'turn',
  'word'
];

const strictDictionaryWords = (words as string[]).filter(
  (entry) => /^[a-z]+$/.test(entry) && entry.length >= 2 && entry.length <= 12
);

export const STRICT_WORDS = new Set<string>([
  ...strictDictionaryWords,
  ...curatedGameplayWords
]);

export const AUTO_WORD_SUGGESTIONS = new Set<string>(curatedGameplayWords);

export const MVP_WORDS = STRICT_WORDS;
