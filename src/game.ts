import { decayTime, gameHalfLife, ISOTOPES, multiplier, pDead, rollTier, streakBonus, MAX_HALF_LIVES, type Isotope, type Tier } from "./physics";
import { pickOutcome, type Outcome } from "./outcomes";
import { cryptoRandom, newSeedCode, pick, rngFromSeed } from "./rng";
import type { LensId } from "./state";

export type Mode = "run" | "daily" | "challenge" | "1935";

export interface Round {
  mode: Mode;
  seed: string;
  lens: LensId;
  iso: Isotope;
  /** Half-life in seconds of game time. */
  T: number;
  /** The atom decays at this time. Opening at or after it collapses to Dead. */
  decayAt: number;
  u: number[];
  /** Objective Collapse: the box measures itself at this time (seconds), if ever. */
  collapseAt: number | null;
  /** QBism credence that the cat is Alive, 0..1. */
  credence: number;
}

export interface Draw {
  side: "alive" | "dead";
  tier: Tier;
  card: Outcome;
}

export interface Result {
  t: number;
  x: number;
  p: number;
  mult: number;
  main: Draw;
  other: Draw | null;
  points: number;
  calibration: number | null;
  auto: "cap" | "collapse" | null;
}

const ISO_1935: Isotope = {
  id: "1935",
  name: "Schrödinger's Sample",
  symbol: "1935",
  realHalfLife: "one hour, by design",
  realSeconds: 3600,
  fact: "In the 1935 setup, within one hour an atom might decay, or with equal probability might not.",
};

export function dailySeed(day: string): string {
  return "daily-" + day;
}

/** Daily Box number, counted from launch day (#1 = 2026-10-26). */
export function dailyNumber(day: string): number {
  const ms = Date.parse(day + "T00:00:00Z") - Date.parse("2026-10-26T00:00:00Z");
  return Math.floor(ms / 86400000) + 1;
}

export function createRound(mode: Mode, lens: LensId, seed = newSeedCode()): Round {
  const rng = rngFromSeed(seed);
  const iso = mode === "1935" ? ISO_1935 : pick(ISOTOPES, rng());
  const T = mode === "1935" ? 3600 : gameHalfLife(iso);
  const u = Array.from({ length: 7 }, () => rng());
  const decayAt = decayTime(u[0], T);
  // Seeded boxes stay reproducible, so lens twists that add randomness apply to free runs only.
  const effectiveLens: LensId = mode === "run" ? lens : "copenhagen";
  let collapseAt: number | null = null;
  if (effectiveLens === "objective") {
    const lambda = -Math.log(0.6) / (2 * T); // 40% chance to self-collapse before 2 half-lives
    collapseAt = -Math.log(1 - cryptoRandom()) / lambda;
  }
  return { mode, seed, lens: effectiveLens, iso, T, decayAt, u, collapseAt, credence: 0.5 };
}

function draw(side: "alive" | "dead", x: number, u1: number, u2: number, u3: number): Draw {
  const tier = rollTier(x, u1, u2);
  return { side, tier, card: pickOutcome(side, tier, u3) };
}

export function resolve(r: Round, t: number, streak: number, auto: Result["auto"] = null): Result {
  const tc = Math.min(t, r.T * MAX_HALF_LIVES);
  const x = tc / r.T;
  const side: "alive" | "dead" = tc >= r.decayAt ? "dead" : "alive";
  const main = draw(side, x, r.u[1], r.u[2], r.u[3]);
  const other = r.lens === "manyworlds" ? draw(side === "alive" ? "dead" : "alive", x, r.u[4], r.u[5], r.u[6]) : null;
  const mult = multiplier(tc, r.T);
  const lensMult = r.lens === "objective" ? 1.5 : 1;
  let points = side === "alive" ? Math.round(100 * mult * streakBonus(streak) * lensMult) : 0;
  let calibration: number | null = null;
  if (r.lens === "qbism") {
    const o = side === "alive" ? 1 : 0;
    // Affine Brier score: a proper scoring rule, so honest credence maximizes the expected bonus.
    calibration = Math.round(100 * (1 - (o - r.credence) ** 2)) - 50;
    points = Math.max(0, points + calibration);
  }
  return { t: tc, x, p: pDead(tc, r.T), mult, main, other, points, calibration, auto };
}

/** Pilot Wave peek: a fuzzy band around the true decay time, about one half-life wide. */
export function peekBand(r: Round): { from: number; to: number } {
  const jitter = (cryptoRandom() - 0.5) * 0.6;
  const centre = Math.min(MAX_HALF_LIVES - 0.3, r.decayAt / r.T + jitter);
  return { from: Math.max(0, centre - 0.5), to: Math.min(MAX_HALF_LIVES, centre + 0.5) };
}

export function challengeHash(seed: string, res: Result): string {
  return `#seed=${seed}&w=${res.x.toFixed(2)}&o=${res.main.side[0]}`;
}

export function parseChallenge(hash: string): { seed: string; w: number | null; o: "alive" | "dead" | null } | null {
  const q = new URLSearchParams(hash.replace(/^#/, ""));
  const seed = q.get("seed");
  if (!seed || !/^[a-z0-9-]{3,24}$/.test(seed)) return null;
  const w = q.get("w") ? Number(q.get("w")) : null;
  const o = q.get("o") === "a" ? "alive" : q.get("o") === "d" ? "dead" : null;
  return { seed, w: w !== null && Number.isFinite(w) ? w : null, o };
}

