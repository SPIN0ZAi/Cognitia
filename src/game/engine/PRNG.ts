/**
 * Mulberry32 Seeded Pseudo-Random Number Generator
 * Deterministic PRNG ensuring reproducible level generation and replay verification
 */

export class SeededPRNG {
  private seed: number;

  constructor(initialSeed: number = 1337) {
    this.seed = initialSeed >>> 0;
  }

  public setSeed(seed: number): void {
    this.seed = seed >>> 0;
  }

  /**
   * Generates a floating point number in [0, 1)
   */
  public next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates integer in [min, max] inclusive
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Shuffles an array deterministically
   */
  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
