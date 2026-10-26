import type { Mode } from "./game";
import type { Tier } from "./physics";

export interface RoundLog {
  side: "alive" | "dead";
  tier: Tier;
  x: number;
}

export interface RunState {
  mode: Mode;
  lives: number;
  score: number;
  streak: number;
  bestStreak: number;
  history: RoundLog[];
  newCards: string[];
  peekUsed: boolean;
  /** Seed for a single seeded box (daily, challenge, 1935). */
  seed?: string;
  challenge?: { w: number | null; o: "alive" | "dead" | null };
  firstEver: boolean;
}

export function newRun(mode: Mode, extra: Partial<RunState> = {}): RunState {
  return {
    mode,
    lives: mode === "run" ? 9 : 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    history: [],
    newCards: [],
    peekUsed: false,
    firstEver: false,
    ...extra,
  };
}

type Screen = "intro" | "home" | "round" | "summary" | "catdex";

/** Navigation registry: screens call nav.go without importing each other. */
export const nav: { go: (screen: Screen, run?: RunState) => void } = {
  go: () => {},
};
