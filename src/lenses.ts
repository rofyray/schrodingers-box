import type { LensId } from "./state";

export interface Lens {
  id: LensId;
  name: string;
  short: string;
  unlockAt: number;
  twist: string;
  caption: string;
}

export const LENSES: Lens[] = [
  {
    id: "copenhagen",
    name: "Copenhagen",
    short: "CPH",
    unlockAt: 0,
    twist: "The baseline. Nothing is settled until you open the box.",
    caption: "Observation yields one outcome. Why, and when, is still debated.",
  },
  {
    id: "manyworlds",
    name: "Many-Worlds",
    short: "MWI",
    unlockAt: 5,
    twist: "You collect both outcomes but score only your branch. Other You keeps the other card.",
    caption: "Every outcome happens, in a different branch.",
  },
  {
    id: "pilotwave",
    name: "Pilot Wave",
    short: "PW",
    unlockAt: 12,
    twist: "The outcome is fixed the moment the box appears. Once per run, you can peek at a faint hint.",
    caption: "The cat was always definite; the wave guided it.",
  },
  {
    id: "objective",
    name: "Objective Collapse",
    short: "GRW",
    unlockAt: 20,
    twist: "Points ×1.5, but the box may collapse on its own and freeze your multiplier.",
    caption: "Collapse may be a physical process that happens without you.",
  },
  {
    id: "qbism",
    name: "QBism",
    short: "QB",
    unlockAt: 30,
    twist: "Guess how likely the cat is alive before you open. Honest guesses earn a bonus.",
    caption: "The quantum state describes your expectations, not the cat.",
  },
];

export const LENS_BY_ID = Object.fromEntries(LENSES.map((l) => [l.id, l])) as Record<LensId, Lens>;
