// Fair randomness comes from crypto; reproducible boxes (daily, challenge) from mulberry32.

export function cryptoRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a: turns any seed string (a date, a challenge code) into a 32-bit int. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Short, unambiguous seed code such as "k3f9wq". */
export function newSeedCode(len = 6): string {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

export function isSeedCode(s: string): boolean {
  return /^[a-z0-9]{3,16}$/.test(s);
}

export function rngFromSeed(seed: string): () => number {
  return mulberry32(hashString(seed));
}

export function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.min(arr.length - 1, Math.floor(r * arr.length))];
}
