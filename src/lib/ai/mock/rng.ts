/** Bộ sinh số ngẫu nhiên có seed (mulberry32) để nội dung mock ổn định & tái lập được. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    pickN: <T>(arr: readonly T[], n: number): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, Math.min(n, copy.length));
    },
    shuffle: <T>(arr: readonly T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    chance: (p: number) => next() < p,
  };
}

export type Rng = ReturnType<typeof createRng>;

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Làm tròn giá về bội số đẹp (VND). */
export function roundPrice(n: number): number {
  if (n >= 10_000_000) return Math.round(n / 500_000) * 500_000;
  if (n >= 1_000_000) return Math.round(n / 100_000) * 100_000;
  if (n >= 100_000) return Math.round(n / 10_000) * 10_000;
  return Math.round(n / 1_000) * 1_000;
}
