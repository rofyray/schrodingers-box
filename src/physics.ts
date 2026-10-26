// The only real physics in the game: exponential decay. Everything else is tuning.

export const MAX_HALF_LIVES = 4;

/** P(dead) after t seconds with half-life T. */
export const pDead = (t: number, T: number) => 1 - Math.pow(2, -t / T);

/** Score multiplier grows linearly; survival falls exponentially, so EV peaks near 0.94 T. */
export const multiplier = (t: number, T: number) => 1 + (2 * t) / T;

export const streakBonus = (streak: number) => Math.min(2, 1 + 0.1 * streak);

/** Time at which the atom decays, given a uniform draw u. Dead iff opened at t >= decayAt. */
export const decayTime = (u: number, T: number) => -T * Math.log2(1 - u);

export interface Isotope {
  id: string;
  name: string;
  symbol: string;
  realHalfLife: string;
  /** Real half-life in seconds, used to order game half-lives. */
  realSeconds: number;
  fact: string;
}

const YEAR = 365.25 * 86400;

export const ISOTOPES: Isotope[] = [
  { id: "f18", name: "Fluorine-18", symbol: "¹⁸F", realHalfLife: "109.8 minutes", realSeconds: 6588, fact: "Lights up PET scans, then vanishes before lunch." },
  { id: "tc99m", name: "Technetium-99m", symbol: "⁹⁹ᵐTc", realHalfLife: "6.01 hours", realSeconds: 21636, fact: "The workhorse of medical imaging: tens of millions of scans a year." },
  { id: "rn222", name: "Radon-222", symbol: "²²²Rn", realHalfLife: "3.82 days", realSeconds: 330048, fact: "A gas that seeps out of ordinary rock and into basements." },
  { id: "i131", name: "Iodine-131", symbol: "¹³¹I", realHalfLife: "8.02 days", realSeconds: 692928, fact: "Your thyroid hoards it, which is exactly why doctors use it." },
  { id: "po210", name: "Polonium-210", symbol: "²¹⁰Po", realHalfLife: "138 days", realSeconds: 138 * 86400, fact: "Discovered by Marie and Pierre Curie, named for Poland." },
  { id: "co60", name: "Cobalt-60", symbol: "⁶⁰Co", realHalfLife: "5.27 years", realSeconds: 5.27 * YEAR, fact: "Sterilizes medical gear and some of your spices." },
  { id: "h3", name: "Tritium", symbol: "³H", realHalfLife: "12.3 years", realSeconds: 12.3 * YEAR, fact: "Makes exit signs and watch hands glow with no power at all." },
  { id: "sr90", name: "Strontium-90", symbol: "⁹⁰Sr", realHalfLife: "28.8 years", realSeconds: 28.8 * YEAR, fact: "Powered remote Soviet lighthouses for decades." },
  { id: "cs137", name: "Caesium-137", symbol: "¹³⁷Cs", realHalfLife: "30.1 years", realSeconds: 30.1 * YEAR, fact: "Lets scientists date wine bottled after 1945." },
  { id: "am241", name: "Americium-241", symbol: "²⁴¹Am", realHalfLife: "432 years", realSeconds: 432 * YEAR, fact: "There is probably a speck of it in your smoke detector." },
  { id: "ra226", name: "Radium-226", symbol: "²²⁶Ra", realHalfLife: "1,600 years", realSeconds: 1600 * YEAR, fact: "Once sold in tonics and face creams. Please do not do that." },
  { id: "c14", name: "Carbon-14", symbol: "¹⁴C", realHalfLife: "about 5,730 years", realSeconds: 5730 * YEAR, fact: "Dates anything that was once alive, up to ~50,000 years." },
  { id: "pu239", name: "Plutonium-239", symbol: "²³⁹Pu", realHalfLife: "24,110 years", realSeconds: 24110 * YEAR, fact: "Half of any batch made today will still be around in the year 26,000." },
  { id: "k40", name: "Potassium-40", symbol: "⁴⁰K", realHalfLife: "1.25 billion years", realSeconds: 1.25e9 * YEAR, fact: "Every banana is very slightly radioactive because of it." },
  { id: "u238", name: "Uranium-238", symbol: "²³⁸U", realHalfLife: "4.47 billion years", realSeconds: 4.47e9 * YEAR, fact: "About as old as the Earth. Roughly half the original is left." },
];

const logMin = Math.log(ISOTOPES[0].realSeconds);
const logMax = Math.log(ISOTOPES[ISOTOPES.length - 1].realSeconds);

/** Game half-life (3 to 10 s): longer-lived isotopes get longer boxes, on a log scale. */
export function gameHalfLife(iso: Isotope): number {
  const f = (Math.log(iso.realSeconds) - logMin) / (logMax - logMin);
  return Math.round((3 + 7 * f) * 10) / 10;
}

export type Tier = "common" | "uncommon" | "rare" | "epic" | "legendary" | "weird";

export const TIERS: Tier[] = ["common", "uncommon", "rare", "epic", "legendary"];
const BASE_ODDS: Record<string, number> = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 };

/** Rarity weights after the wait boost: each tier above Common is multiplied by (1 + x). */
export function rarityWeights(halfLivesWaited: number): Record<string, number> {
  const boost = 1 + Math.max(0, halfLivesWaited);
  const raw = TIERS.map((t) => (t === "common" ? BASE_ODDS[t] : BASE_ODDS[t] * boost));
  const sum = raw.reduce((a, b) => a + b, 0);
  return Object.fromEntries(TIERS.map((t, i) => [t, raw[i] / sum]));
}

/** Roll a tier with two uniforms. Weird replaces Rare or higher 1 in 4 times. */
export function rollTier(halfLivesWaited: number, u1: number, u2: number): Tier {
  const w = rarityWeights(halfLivesWaited);
  let acc = 0;
  let tier: Tier = "common";
  for (const t of TIERS) {
    acc += w[t];
    if (u1 < acc) {
      tier = t;
      break;
    }
    tier = t;
  }
  if ((tier === "rare" || tier === "epic" || tier === "legendary") && u2 < 0.25) return "weird";
  return tier;
}

export const TIER_LABEL: Record<Tier, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  weird: "Weird",
};

export const TIER_RANK: Record<Tier, number> = { common: 0, uncommon: 1, rare: 2, weird: 2.5, epic: 3, legendary: 4 };
