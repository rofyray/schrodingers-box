// Every sound is synthesized with Web Audio. No files to download.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = false;

export function audioReady(): boolean {
  return !!ctx && enabled;
}

/** Call from a user gesture. Creates the context lazily (autoplay policy). */
export function unlockAudio(): void {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (master && ctx) master.gain.setTargetAtTime(on ? 0.55 : 0, ctx.currentTime, 0.02);
}

function out(): { c: AudioContext; m: GainNode } | null {
  if (!ctx || !master || !enabled) return null;
  return { c: ctx, m: master };
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "triangle", gain = 0.2, endFreq?: number): void {
  const o = out();
  if (!o) return;
  const { c, m } = o;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(m);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function burst(start: number, dur: number, hp: number, gain: number, lp?: number): void {
  const o = out();
  if (!o || !noise) return;
  const { c, m } = o;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f1 = c.createBiquadFilter();
  f1.type = "highpass";
  f1.frequency.value = hp;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  let node: AudioNode = src.connect(f1);
  if (lp) {
    const f2 = c.createBiquadFilter();
    f2.type = "lowpass";
    f2.frequency.value = lp;
    node = node.connect(f2);
  }
  node.connect(g).connect(m);
  src.start(start, Math.random() * 0.4, dur + 0.02);
}

/** One Geiger click. */
export function geigerClick(): void {
  const o = out();
  if (!o) return;
  burst(o.c.currentTime, 0.004 + Math.random() * 0.004, 2200, 0.35 + Math.random() * 0.3);
}

export function uiTap(): void {
  const o = out();
  if (!o) return;
  tone(1400, o.c.currentTime, 0.04, "square", 0.04);
}

export function lidPop(): void {
  const o = out();
  if (!o) return;
  const t = o.c.currentTime;
  tone(150, t, 0.25, "sine", 0.5, 40);
  burst(t, 0.12, 300, 0.4, 3000);
  burst(t + 0.05, 0.3, 4000, 0.08);
}

/** Reveal stinger, pitched up and lengthened by rarity rank (0..4). */
export function stinger(rank: number): void {
  const o = out();
  if (!o) return;
  const t = o.c.currentTime;
  const root = 523.25 * Math.pow(2, (rank * 2) / 12);
  const steps = [0, 4, 7, 12, 16, 19];
  const n = 2 + Math.ceil(rank);
  for (let i = 0; i < n; i++) tone(root * Math.pow(2, steps[i] / 12), t + i * 0.075, 0.5 + rank * 0.1, "triangle", 0.16);
  if (rank >= 3) tone(root * 2, t + n * 0.075, 0.9, "sine", 0.1);
}

/** Dead: a comic slide whistle and a sad trombone, never anything grim. */
export function deadSlide(): void {
  const o = out();
  if (!o) return;
  const { c, m } = o;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const vib = c.createOscillator();
  const vg = c.createGain();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1100, t);
  osc.frequency.exponentialRampToValueAtTime(260, t + 0.55);
  vib.frequency.value = 9;
  vg.gain.value = 18;
  vib.connect(vg).connect(osc.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  osc.connect(g).connect(m);
  osc.start(t);
  vib.start(t);
  osc.stop(t + 0.65);
  vib.stop(t + 0.65);
  [392, 370, 349, 330].forEach((fq, i) => tone(fq, t + 0.7 + i * 0.22, i === 3 ? 0.6 : 0.2, "sawtooth", 0.05, i === 3 ? 300 : undefined));
}

export function glitch(): void {
  const o = out();
  if (!o) return;
  const t = o.c.currentTime;
  for (let i = 0; i < 18; i++) {
    const at = t + i * 0.06 + Math.random() * 0.03;
    tone(80 + Math.random() * 1800, at, 0.05, "square", 0.06);
    if (i % 3 === 0) burst(at, 0.04, 1000, 0.15);
  }
}

/** Objective Collapse: the box measures itself with a soft click. */
export function softClick(): void {
  const o = out();
  if (!o) return;
  const t = o.c.currentTime;
  tone(2400, t, 0.03, "sine", 0.18);
  burst(t, 0.03, 1500, 0.2, 6000);
}

export function shimmer(): void {
  const o = out();
  if (!o) return;
  const t = o.c.currentTime;
  [880, 1318, 1760, 2637].forEach((fq, i) => tone(fq, t + i * 0.05, 0.6, "sine", 0.05));
}

export function fanfare(): void {
  const o = out();
  if (!o) return;
  const t = o.c.currentTime;
  [523, 659, 784, 1046, 784, 1046].forEach((fq, i) => tone(fq, t + i * 0.09, i > 3 ? 0.5 : 0.15, "square", 0.05));
}

export function haptic(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
