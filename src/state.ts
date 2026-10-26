import { BY_ID, TOTAL_CARDS } from "./outcomes";

export type LensId = "copenhagen" | "manyworlds" | "pilotwave" | "objective" | "qbism";

export interface CardRecord {
  count: number;
  firstAt: string;
  /** Collected only in another branch (Many-Worlds) so far. */
  viaBranch?: boolean;
}

export interface Branch {
  at: string;
  followed: string;
  other: string;
  followedSide: "alive" | "dead";
}

export interface DailyResult {
  wait: number;
  side: "alive" | "dead";
  card: string;
  tier: string;
}

export interface Save {
  version: 1;
  highScore: number;
  bestStreak: number;
  runs: number;
  rounds: number;
  catdex: Record<string, CardRecord>;
  otherYou: string[];
  lensesUnlocked: LensId[];
  activeLens: LensId;
  achievements: string[];
  multiverse: { branches: number; log: Branch[] };
  daily: { lastDay: string | null; streak: number; results: Record<string, DailyResult> };
  box1935: { sealedAt: number; seed: string } | null;
  settings: { sound: boolean | null; reducedMotion: boolean | null; theme: "auto" | "light" | "dark" };
}

const KEY = "sbox.v1";

export function freshSave(): Save {
  return {
    version: 1,
    highScore: 0,
    bestStreak: 0,
    runs: 0,
    rounds: 0,
    catdex: {},
    otherYou: [],
    lensesUnlocked: ["copenhagen"],
    activeLens: "copenhagen",
    achievements: [],
    multiverse: { branches: 0, log: [] },
    daily: { lastDay: null, streak: 0, results: {} },
    box1935: null,
    settings: { sound: null, reducedMotion: null, theme: "auto" },
  };
}

function merge(raw: Partial<Save>): Save {
  const base = freshSave();
  return {
    ...base,
    ...raw,
    multiverse: { ...base.multiverse, ...(raw.multiverse ?? {}) },
    daily: { ...base.daily, ...(raw.daily ?? {}) },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    version: 1,
  };
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshSave();
    return merge(JSON.parse(raw));
  } catch {
    return freshSave();
  }
}

export const save: Save = loadSave();

export function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* storage full or blocked: the game still plays */
  }
}

export function replaceSave(next: Save): void {
  Object.assign(save, merge(next));
  persist();
}

export const today = () => new Date().toISOString().slice(0, 10);

export function uniqueCards(): number {
  return Object.keys(save.catdex).filter((id) => BY_ID[id]).length;
}

export const catdexPercent = () => Math.round((uniqueCards() / TOTAL_CARDS) * 100);

/** Record a collected card. Returns true if it is new to the Catdex. */
export function collect(id: string, viaBranch = false): boolean {
  const rec = save.catdex[id];
  if (rec) {
    rec.count++;
    if (!viaBranch) delete rec.viaBranch;
    return false;
  }
  save.catdex[id] = { count: 1, firstAt: today(), ...(viaBranch ? { viaBranch: true } : {}) };
  return true;
}

// ---------- save codes (export / import) ----------

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function exportCode(): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(save));
  if (typeof CompressionStream !== "undefined") {
    return "z" + b64url(await pipe(bytes, new CompressionStream("deflate-raw")));
  }
  return "j" + b64url(bytes);
}

export async function importCode(code: string): Promise<boolean> {
  try {
    const kind = code.trim()[0];
    let bytes: Uint8Array = fromB64url(code.trim().slice(1));
    if (kind === "z") bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
    else if (kind !== "j") return false;
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (parsed?.version !== 1) return false;
    replaceSave(parsed);
    return true;
  } catch {
    return false;
  }
}
