import { save, persist } from "./state";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", name: "First Measurement", desc: "Open your first box." },
  { id: "coinflip", name: "Coin Flip", desc: "Open a box at exactly 50.0% decay odds." },
  { id: "quick", name: "Impatient Physicist", desc: "Open within a tenth of a half-life." },
  { id: "three", name: "Three Half-Lives", desc: "Survive after waiting 3 half-lives." },
  { id: "ride", name: "Let It Ride", desc: "Let the box open itself at 4 half-lives." },
  { id: "streak5", name: "Hot Streak", desc: "Five living cats in a row." },
  { id: "streak9", name: "All Nine Lives", desc: "Nine living cats in a row." },
  { id: "score5k", name: "Grant Funded", desc: "Score 5,000 in a single run." },
  { id: "weird", name: "Something's Off", desc: "Find a Weird card." },
  { id: "legend", name: "Both At Once", desc: "Find the Superposed Cat." },
  { id: "twoworlds", name: "Two Worlds At Once", desc: "Collect a cat in two branches at once." },
  { id: "peek", name: "Guided By The Wave", desc: "Use a Pilot Wave peek." },
  { id: "selfcollapse", name: "Nobody Touched It", desc: "Watch a box collapse by itself." },
  { id: "calibrated", name: "Well Calibrated", desc: "Earn the full QBism calibration bonus." },
  { id: "daily3", name: "Ritual", desc: "Open the Daily Box 3 days in a row." },
  { id: "halfdex", name: "Half The Catalogue", desc: "Collect 20 different cards." },
  { id: "fulldex", name: "Complete Catalogue", desc: "Collect all 40 cards." },
  { id: "y1935", name: "Since 1935", desc: "Open the one-hour box." },
];

const listeners: ((a: Achievement) => void)[] = [];

export function onAchievement(fn: (a: Achievement) => void): void {
  listeners.push(fn);
}

/** Unlock once; announce through listeners. */
export function award(id: string): void {
  if (save.achievements.includes(id)) return;
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return;
  save.achievements.push(id);
  persist();
  listeners.forEach((fn) => fn(a));
}
