import type { CatSpec } from "./cats";
import type { Tier } from "./physics";

export type Side = "alive" | "dead" | "both";

export interface Outcome {
  id: string;
  name: string;
  side: Side;
  tier: Tier;
  cat: CatSpec;
  flavor: string;
}

// Adding a cat is one line.
export const OUTCOMES: Outcome[] = [
  // ---- Alive · Common
  { id: "alive_loaf", name: "Sleepy Loaf", side: "alive", tier: "common", cat: { body: "loaf", eyes: "sleepy", mouth: "w", acc: ["zzz", "tabby"] }, flavor: "Survived the experiment by sleeping through it." },
  { id: "alive_glare", name: "The Glare", side: "alive", tier: "common", cat: { body: "sit", eyes: "glare", mouth: "flat" }, flavor: "It heard you hoping for the other outcome." },
  { id: "alive_boxsit", name: "If It Fits", side: "alive", tier: "common", cat: { body: "peek", eyes: "happy", mouth: "w", acc: ["box"] }, flavor: "Has decided the box is a bed now. The flask can stay." },
  { id: "alive_yawn", name: "Big Yawn", side: "alive", tier: "common", cat: { body: "sit", ears: "round", eyes: "sleepy", mouth: "open", acc: ["tabby"] }, flavor: "Sat through the whole thought experiment and yawned once, at the end." },
  { id: "alive_blep", name: "Blep", side: "alive", tier: "common", cat: { body: "loaf", ears: "round", eyes: "open", mouth: "tongue" }, flavor: "Tongue out. State: definitely alive." },
  { id: "alive_bowtie", name: "Formal Wear", side: "alive", tier: "common", cat: { body: "sit", ears: "folded", eyes: "open", mouth: "w", acc: ["bowtie"] }, flavor: "Wore a bow tie in case the observation was formal. You're late." },
  { id: "alive_critic", name: "Box Critic", side: "alive", tier: "common", cat: { body: "sit", ears: "notched", eyes: "glare", mouth: "smirk", acc: ["tabby", "scorecard"] }, flavor: "Two out of five. Dark, and someone left poison in here." },
  // ---- Alive · Uncommon
  { id: "alive_shades", name: "Too Cool", side: "alive", tier: "uncommon", cat: { body: "sit", eyes: "none", mouth: "smirk", acc: ["sunglasses", "sparkles"] }, flavor: "Wore sunglasses inside a sealed box and regrets nothing." },
  { id: "alive_sign", name: "Close The Lid", side: "alive", tier: "uncommon", cat: { body: "sit", eyes: "open", mouth: "flat", acc: ["sign"] }, flavor: "You opened it without knocking." },
  { id: "alive_professor", name: "Professor Whiskers", side: "alive", tier: "uncommon", cat: { body: "sit", ears: "tufted", eyes: "open", mouth: "w", acc: ["tophat", "monocle"] }, flavor: "Has strong opinions about Niels Bohr." },
  { id: "alive_party", name: "Nine Lives Party", side: "alive", tier: "uncommon", cat: { body: "sit", eyes: "happy", mouth: "open", acc: ["partyhat", "confetti"] }, flavor: "Still on life one of nine. Celebrating accordingly." },
  { id: "alive_goggles", name: "Lab Assistant", side: "alive", tier: "uncommon", cat: { body: "sit", ears: "tufted", eyes: "open", mouth: "w", acc: ["goggles"] }, flavor: "Wears goggles to every experiment, naps included." },
  // ---- Alive · Rare
  { id: "alive_labcoat", name: "Dr. Cat, PhD", side: "alive", tier: "rare", cat: { body: "sit", eyes: "open", mouth: "smirk", acc: ["labcoat", "glasses"] }, flavor: "Published a paper about you. Reviewer 2 was harsh." },
  { id: "alive_dog", name: "Was A Dog", side: "alive", tier: "rare", cat: { body: "sit", ears: "floppy", eyes: "sparkle", acc: ["dogsnout", "collar"] }, flavor: "The wavefunction had other plans." },
  { id: "alive_crown", name: "Monarch Of The Box", side: "alive", tier: "rare", cat: { body: "loaf", eyes: "glare", mouth: "smirk", acc: ["crown", "sparkles"] }, flavor: "Rules exactly one cubic metre and expects tribute." },
  { id: "alive_geiger", name: "Unplugged", side: "alive", tier: "rare", cat: { body: "sit", eyes: "open", mouth: "smirk", acc: ["geiger"] }, flavor: "Unplugged the Geiger counter. Kept the hammer, just in case." },
  // ---- Alive · Epic
  { id: "alive_observer", name: "The Observer", side: "alive", tier: "epic", cat: { body: "sit", eyes: "open", mouth: "flat", acc: ["glasses", "clipboard"] }, flavor: "Has been watching you the whole time. Your collapse is pending." },
  { id: "alive_insidejob", name: "Inside Job", side: "alive", tier: "epic", cat: { body: "sit", ears: "notched", eyes: "glare", mouth: "smirk", acc: ["holebox"], pose: { tx: 36, ty: 6, s: 0.82 } }, flavor: "Let itself out an hour ago and waited to see your face." },

  // ---- Dead · Common
  { id: "dead_ghost", name: "Ghost Cat", side: "dead", tier: "common", cat: { body: "ghost", eyes: "open", mouth: "w" }, flavor: "Dead, technically. Still expects dinner." },
  { id: "dead_halo", name: "Tiny Halo", side: "dead", tier: "common", cat: { body: "loaf", eyes: "x", mouth: "tongue", acc: ["halo"] }, flavor: "One life down. The halo is a loaner." },
  { id: "dead_float", name: "Floaty", side: "dead", tier: "common", cat: { body: "ghost", eyes: "sleepy", mouth: "w", acc: ["sparkles"] }, flavor: "Weighs nothing now and has never been happier." },
  { id: "dead_boo", name: "Mild Boo", side: "dead", tier: "common", cat: { body: "ghost", ears: "round", eyes: "open", mouth: "o", acc: ["arms"] }, flavor: "Practicing for the big haunt. It needs work." },
  { id: "dead_sheet", name: "Bedsheet Ghost", side: "dead", tier: "common", cat: { body: "sheet", eyes: "holes" }, flavor: "A low-budget haunt. Cut the ear holes itself." },
  { id: "dead_spiral", name: "Seeing Stars", side: "dead", tier: "common", cat: { body: "loaf", eyes: "spiral", mouth: "o", acc: ["stars"] }, flavor: "Still processing the measurement." },
  { id: "dead_wisp", name: "Little Wisp", side: "dead", tier: "common", cat: { body: "ghost", eyes: "happy", mouth: "w", pose: { s: 0.62, ty: 22 } }, flavor: "A small ghost with a surprisingly loud purr." },
  // ---- Dead · Uncommon
  { id: "dead_haunt", name: "Haunts The Box", side: "dead", tier: "uncommon", cat: { body: "peek", ghost: true, eyes: "glare", mouth: "o", acc: ["box"] }, flavor: "Moved back into the box and won't pay rent." },
  { id: "dead_tomb", name: "1 Of 9", side: "dead", tier: "uncommon", cat: { body: "ghost", eyes: "happy", mouth: "w", acc: ["tombstone"], pose: { tx: -42, ty: 14, s: 0.72 } }, flavor: "Here lies one life. Eight more where that came from." },
  { id: "dead_chains", name: "Chain Rattler", side: "dead", tier: "uncommon", cat: { body: "ghost", eyes: "glare", mouth: "o", acc: ["chains"] }, flavor: "Rattles at 3 a.m. Mostly for attention." },
  { id: "dead_cloud", name: "Cloud Nine", side: "dead", tier: "uncommon", cat: { body: "loaf", eyes: "happy", mouth: "w", acc: ["halo", "cloud"] }, flavor: "Sitting on cloud nine, which is technically reserved for life nine." },
  { id: "dead_candle", name: "Séance Cat", side: "dead", tier: "uncommon", cat: { body: "ghost", ears: "tufted", eyes: "sleepy", mouth: "w", acc: ["candle"], pose: { tx: 14 } }, flavor: "Lit a candle to contact the living. Got you." },
  // ---- Dead · Rare
  { id: "dead_complaint", name: "Files A Complaint", side: "dead", tier: "rare", cat: { body: "ghost", eyes: "glare", mouth: "flat", acc: ["form"], pose: { tx: -14 } }, flavor: "Re: being dead and alive at the same time. Please advise." },
  { id: "dead_harp", name: "Harp Practice", side: "dead", tier: "rare", cat: { body: "ghost", eyes: "sleepy", mouth: "w", acc: ["wings", "halo", "harp"], pose: { tx: -18 } }, flavor: "Knows exactly one song. It's about you." },
  { id: "dead_poltergeist", name: "Poltergeist", side: "dead", tier: "rare", cat: { body: "ghost", eyes: "sparkle", mouth: "smirk", acc: ["arms", "flask"], pose: { tx: -26 } }, flavor: "Still knocks things off tables. Death changed nothing." },
  // ---- Dead · Epic
  { id: "dead_schrodinger", name: "Haunts Schrödinger", side: "dead", tier: "epic", cat: { body: "ghost", eyes: "glare", mouth: "o", acc: ["arms", "erwin"], pose: { tx: 42, ty: -18, s: 0.78 } }, flavor: "Erwin hasn't slept well since 1935." },
  { id: "dead_backinbox", name: "Requests A Retry", side: "dead", tier: "epic", cat: { body: "peek", ghost: true, eyes: "sparkle", mouth: "w", acc: ["box", "remeasure"] }, flavor: "Climbed back in and would like a re-measurement, please." },

  // ---- Shared Legendary
  { id: "legend_superposed", name: "Superposed Cat", side: "both", tier: "legendary", cat: { body: "none", scene: "superposed" }, flavor: "Never picked a side. Your screen is taking it badly." },

  // ---- Weird
  { id: "weird_milk", name: "Went Out For Milk", side: "both", tier: "weird", cat: { body: "none", scene: "milk" }, flavor: "The box is empty apart from a note in pawprint handwriting." },
  { id: "weird_nested", name: "Box In A Box", side: "both", tier: "weird", cat: { body: "none", scene: "nested" }, flavor: "Inside the box: a smaller box. Inside that: a smaller box. You stop checking." },
  { id: "weird_wave", name: "Just A Wave", side: "both", tier: "weird", cat: { body: "none", scene: "wave" }, flavor: "Skipped the collapse entirely and is smug about it." },
  { id: "weird_slits", name: "Both Slits", side: "both", tier: "weird", cat: { body: "none", scene: "slits" }, flavor: "Went through both doors. Left an interference pattern of ears." },
];

export const BY_ID: Record<string, Outcome> = Object.fromEntries(OUTCOMES.map((o) => [o.id, o]));

export const TOTAL_CARDS = OUTCOMES.length;

/** Pick an outcome on a side for a rolled tier. Legendary and Weird ignore the side. */
export function pickOutcome(side: "alive" | "dead", tier: Tier, u: number): Outcome {
  const pool = OUTCOMES.filter((o) =>
    tier === "legendary" || tier === "weird" ? o.tier === tier : o.side === side && o.tier === tier,
  );
  return pool[Math.min(pool.length - 1, Math.floor(u * pool.length))];
}
