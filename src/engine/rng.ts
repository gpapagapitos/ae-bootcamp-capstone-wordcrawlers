export interface Rng {
  next: () => number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    next: () => {
      // xorshift32
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 0xffffffff;
    },
  };
}

export function shuffleInPlace<T>(arr: T[], rng: Rng): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.next() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}
