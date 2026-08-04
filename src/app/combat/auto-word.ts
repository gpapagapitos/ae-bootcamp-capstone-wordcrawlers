import { AUTO_WORD_SUGGESTIONS } from "../../data/words.js";
import type { Card } from "../../engine/types.js";

interface WordCandidate {
  word: string;
  score: number;
}

function buildLetterCounts(cards: Card[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const card of cards) {
    const letter = card.letter.toLowerCase();
    counts.set(letter, (counts.get(letter) ?? 0) + 1);
  }

  return counts;
}

function canBuildWord(word: string, counts: Map<string, number>): boolean {
  const temp = new Map(counts);

  for (const letter of word) {
    const remaining = temp.get(letter) ?? 0;
    if (remaining <= 0) {
      return false;
    }
    temp.set(letter, remaining - 1);
  }

  return true;
}

function scoreWord(word: string, cards: Card[]): number {
  const hand = [...cards];
  let score = 0;

  for (const letter of word) {
    const index = hand.findIndex((c) => c.letter.toLowerCase() === letter);
    if (index === -1) {
      return 0;
    }

    const [card] = hand.splice(index, 1);
    score += card.value;
  }

  return score;
}

export function findBestPlayableWord(cards: Card[]): string | null {
  const counts = buildLetterCounts(cards);
  const candidates: WordCandidate[] = [];

  for (const word of AUTO_WORD_SUGGESTIONS) {
    if (!canBuildWord(word, counts)) {
      continue;
    }

    candidates.push({
      word,
      score: scoreWord(word, cards),
    });
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.word.length !== a.word.length) {
      return b.word.length - a.word.length;
    }
    return a.word.localeCompare(b.word);
  });

  return candidates[0].word;
}
