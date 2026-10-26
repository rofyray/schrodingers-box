// Every cat is assembled from parts: a body, ears, eyes, a mouth and accessories.
// Forty outcomes, about thirty drawn parts. Coordinates live in a 200 x 200 box.

export type Body = "sit" | "loaf" | "ghost" | "sheet" | "peek" | "none";
export type Ears = "pointy" | "round" | "folded" | "floppy" | "tufted" | "notched";
export type Eyes = "open" | "sleepy" | "glare" | "x" | "spiral" | "sparkle" | "happy" | "holes" | "none";
export type Mouth = "w" | "flat" | "open" | "smirk" | "tongue" | "o" | "none";
export type Acc =
  | "sunglasses" | "halo" | "glasses" | "labcoat" | "clipboard" | "monocle" | "tophat" | "partyhat"
  | "confetti" | "goggles" | "crown" | "bowtie" | "collar" | "dogsnout" | "sign" | "scorecard" | "geiger"
  | "tombstone" | "chains" | "cloud" | "candle" | "form" | "harp" | "wings" | "flask" | "box" | "erwin"
  | "holebox" | "zzz" | "sparkles" | "tabby" | "arms" | "remeasure" | "stars";

export interface CatSpec {
  body: Body;
  ears?: Ears;
  eyes?: Eyes;
  mouth?: Mouth;
  acc?: Acc[];
  pose?: { tx?: number; ty?: number; s?: number };
  /** Draw a regular body in ghost fill (a ghost peeking out of the box). */
  ghost?: boolean;
  scene?: "milk" | "nested" | "wave" | "slits" | "superposed";
}

export interface Palette {
  ink: string;
  fill: string;
  ghost: string;
  kraft: string;
  light: string;
}

export const DOM_PALETTE: Palette = {
  ink: "var(--ink)",
  fill: "var(--card-fill)",
  ghost: "var(--ghost)",
  kraft: "var(--kraft)",
  light: "var(--card-fill)",
};

interface H {
  x: number;
  y: number;
  r: number;
}

const HEADS: Record<Body, H> = {
  sit: { x: 100, y: 70, r: 34 },
  ghost: { x: 100, y: 68, r: 34 },
  loaf: { x: 100, y: 92, r: 34 },
  sheet: { x: 100, y: 96, r: 30 },
  peek: { x: 100, y: 92, r: 32 },
  none: { x: 100, y: 70, r: 34 },
};

const MONO = `font-family="'Special Elite','Courier New',monospace"`;

const mirror = (h: H, inner: string) =>
  `${inner}<g transform="translate(${2 * h.x} 0) scale(-1 1)">${inner}</g>`;

const f = (n: number) => Math.round(n * 10) / 10;

// ---------- head + face ----------

function head(h: H, p: Palette, fill: string): string {
  const { x, y, r } = h;
  const d = `M${f(x - r)},${f(y + 2)} C${f(x - r - 2)},${f(y - r * 0.76)} ${f(x - r * 0.5)},${f(y - r * 0.94)} ${x},${f(y - r * 0.94)} C${f(x + r * 0.5)},${f(y - r * 0.94)} ${f(x + r + 2)},${f(y - r * 0.76)} ${f(x + r)},${f(y + 2)} C${f(x + r)},${f(y + r * 0.72)} ${f(x + r * 0.5)},${f(y + r * 0.94)} ${x},${f(y + r * 0.94)} C${f(x - r * 0.5)},${f(y + r * 0.94)} ${f(x - r)},${f(y + r * 0.72)} ${f(x - r)},${f(y + 2)} Z`;
  const tuft = `<path d="M${f(x - r + 1)},${f(y + r * 0.22)} l-8,3 l7,4 l-6,4 l8,1" fill="${fill}" stroke="${p.ink}"/>`;
  return `<path d="${d}" fill="${fill}"/>${mirror(h, tuft)}`;
}

function ears(kind: Ears, h: H, p: Palette, fill: string): string {
  const { x, y, r } = h;
  const L = (s: string) => mirror(h, s);
  switch (kind) {
    case "pointy":
    case "tufted": {
      const base = `<path d="M${f(x - r * 0.95)},${f(y - r * 0.2)} L${f(x - r * 0.82)},${f(y - r * 1.38)} L${f(x - r * 0.18)},${f(y - r * 0.86)} Z" fill="${fill}"/><path d="M${f(x - r * 0.78)},${f(y - r * 0.5)} L${f(x - r * 0.74)},${f(y - r * 1.08)} L${f(x - r * 0.42)},${f(y - r * 0.8)}" stroke-width="2"/>`;
      const tuft = kind === "tufted" ? `<path d="M${f(x - r * 0.82)},${f(y - r * 1.38)} l-3,-9 M${f(x - r * 0.82)},${f(y - r * 1.38)} l3,-8" stroke-width="2.4"/>` : "";
      return L(base + tuft);
    }
    case "notched": {
      const left = `<path d="M${f(x - r * 0.95)},${f(y - r * 0.2)} L${f(x - r * 0.82)},${f(y - r * 1.38)} L${f(x - r * 0.18)},${f(y - r * 0.86)} Z" fill="${fill}"/>`;
      const right = `<path d="M${f(x + r * 0.95)},${f(y - r * 0.2)} L${f(x + r * 0.86)},${f(y - r * 1.2)} L${f(x + r * 0.7)},${f(y - r * 1.08)} L${f(x + r * 0.66)},${f(y - r * 1.36)} L${f(x + r * 0.18)},${f(y - r * 0.86)} Z" fill="${fill}"/>`;
      return left + right;
    }
    case "round":
      return L(`<path d="M${f(x - r * 0.98)},${f(y - r * 0.3)} C${f(x - r * 1.15)},${f(y - r * 1.25)} ${f(x - r * 0.35)},${f(y - r * 1.35)} ${f(x - r * 0.25)},${f(y - r * 0.85)} Z" fill="${fill}"/><path d="M${f(x - r * 0.8)},${f(y - r * 0.55)} C${f(x - r * 0.85)},${f(y - r * 1.0)} ${f(x - r * 0.5)},${f(y - r * 1.05)} ${f(x - r * 0.45)},${f(y - r * 0.8)}" stroke-width="2"/>`);
    case "folded":
      return L(`<path d="M${f(x - r * 0.85)},${f(y - r * 0.55)} L${f(x - r * 0.7)},${f(y - r * 1.1)} L${f(x - r * 0.3)},${f(y - r * 0.9)} Z" fill="${fill}"/><path d="M${f(x - r * 0.7)},${f(y - r * 1.1)} L${f(x - r * 0.62)},${f(y - r * 0.82)} L${f(x - r * 0.4)},${f(y - r * 0.9)}" stroke-width="2"/>`);
    case "floppy":
      return L(`<path d="M${f(x - r * 0.7)},${f(y - r * 0.8)} C${f(x - r * 1.5)},${f(y - r * 0.8)} ${f(x - r * 1.45)},${f(y + r * 0.6)} ${f(x - r * 1.12)},${f(y + r * 0.62)} C${f(x - r * 0.9)},${f(y + r * 0.64)} ${f(x - r * 0.85)},${f(y)} ${f(x - r * 0.75)},${f(y - r * 0.3)}" fill="${p.ink}"/>`);
  }
}

function eyes(kind: Eyes, h: H, p: Palette): string {
  const { x, y, r } = h;
  const ex = x - r * 0.38;
  const ey = y + r * 0.02;
  const er = r * 0.13;
  const L = (s: string) => mirror(h, s);
  switch (kind) {
    case "open":
      return L(`<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(er)}" fill="${p.ink}" stroke="none"/><circle cx="${f(ex + er * 0.35)}" cy="${f(ey - er * 0.4)}" r="${f(er * 0.35)}" fill="${p.light}" stroke="none"/>`);
    case "sparkle":
      return L(`<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(er * 1.4)}" fill="${p.ink}" stroke="none"/><circle cx="${f(ex + er * 0.5)}" cy="${f(ey - er * 0.5)}" r="${f(er * 0.5)}" fill="${p.light}" stroke="none"/><circle cx="${f(ex - er * 0.5)}" cy="${f(ey + er * 0.5)}" r="${f(er * 0.22)}" fill="${p.light}" stroke="none"/>`);
    case "sleepy":
      return L(`<path d="M${f(ex - er * 1.4)},${f(ey)} Q${f(ex)},${f(ey + er * 1.4)} ${f(ex + er * 1.4)},${f(ey)}" stroke-width="2.6"/>`);
    case "happy":
      return L(`<path d="M${f(ex - er * 1.3)},${f(ey + er * 0.5)} Q${f(ex)},${f(ey - er * 1.5)} ${f(ex + er * 1.3)},${f(ey + er * 0.5)}" stroke-width="2.8"/>`);
    case "glare":
      return L(`<path d="M${f(ex - er * 1.3)},${f(ey - er * 0.2)} L${f(ex + er * 1.3)},${f(ey + er * 0.3)}" stroke-width="2.6"/><path d="M${f(ex - er * 1.0)},${f(ey + er * 0.05)} A${f(er)},${f(er)} 0 0 0 ${f(ex + er * 1.0)},${f(ey + er * 0.25)} Z" fill="${p.ink}" stroke="none"/>`);
    case "x":
      return L(`<path d="M${f(ex - er)},${f(ey - er)} L${f(ex + er)},${f(ey + er)} M${f(ex + er)},${f(ey - er)} L${f(ex - er)},${f(ey + er)}" stroke-width="2.8"/>`);
    case "spiral":
      return L(`<path d="M${f(ex)},${f(ey)} m0,-1 a1.5,1.5 0 1 1 -1.5,2 a3.5,3.5 0 1 1 4.5,-4 a5.5,5.5 0 1 1 -7,6" stroke-width="1.8"/>`);
    case "holes":
      return L(`<ellipse cx="${f(ex + 2)}" cy="${f(ey - 4)}" rx="${f(er * 1.3)}" ry="${f(er * 1.9)}" fill="${p.ink}" stroke="none"/>`);
    case "none":
      return "";
  }
}

function nose(h: H, p: Palette): string {
  const { x, y, r } = h;
  const ny = y + r * 0.26;
  return `<path d="M${f(x - 4)},${f(ny)} L${f(x + 4)},${f(ny)} L${x},${f(ny + 4)} Z" fill="${p.ink}" stroke-width="1.5"/>`;
}

function whiskers(h: H): string {
  const { x, y, r } = h;
  const wy = y + r * 0.38;
  return mirror(h, `<path d="M${f(x - r * 0.42)},${f(wy)} l-${f(r * 0.7)},-4 M${f(x - r * 0.42)},${f(wy + 4)} l-${f(r * 0.72)},3" stroke-width="1.4" opacity=".75"/>`);
}

function mouth(kind: Mouth, h: H, p: Palette): string {
  const { x, y, r } = h;
  const my = y + r * 0.42;
  switch (kind) {
    case "w":
      return `<path d="M${f(x - 8)},${f(my)} q4,5 8,0 q4,5 8,0" stroke-width="2.2"/>`;
    case "flat":
      return `<path d="M${f(x - 6)},${f(my + 2)} h12" stroke-width="2.2"/>`;
    case "smirk":
      return `<path d="M${f(x - 7)},${f(my + 2)} q8,3 13,-4" stroke-width="2.2"/>`;
    case "open":
      return `<path d="M${f(x - 7)},${f(my)} q7,-2 14,0 q-1,12 -7,12 q-6,0 -7,-12 Z" fill="${p.ink}" stroke-width="2"/>`;
    case "tongue":
      return `<path d="M${f(x - 8)},${f(my)} q4,5 8,0 q4,5 8,0" stroke-width="2.2"/><path d="M${f(x - 4)},${f(my + 2)} q0,9 4,9 q4,0 4,-9" fill="${p.fill}" stroke-width="2"/><path d="M${x},${f(my + 3)} v5" stroke-width="1.2"/>`;
    case "o":
      return `<ellipse cx="${x}" cy="${f(my + 4)}" rx="5" ry="7" fill="${p.ink}" stroke="none"/>`;
    case "none":
      return "";
  }
}

// ---------- bodies ----------

const outlined = (d: string, p: Palette, fill: string, w = 11) =>
  `<path d="${d}" stroke="${p.ink}" stroke-width="${w}"/><path d="${d}" stroke="${fill}" stroke-width="${w - 6}"/>`;

function body(kind: Body, p: Palette, fill: string): string {
  switch (kind) {
    case "sit":
      return (
        outlined("M134,168 C168,170 178,142 164,126 C158,120 150,124 154,132", p, fill) +
        `<path d="M74,94 C58,118 54,150 62,176 L138,176 C146,150 142,118 126,94 Z" fill="${fill}"/>` +
        `<path d="M90,114 l4,6 l4,-6 l4,6 l4,-6 l4,6" stroke-width="1.8" opacity=".6"/>` +
        `<path d="M88,142 V174 M112,142 V174" stroke-width="2.2"/>` +
        `<ellipse cx="86" cy="176" rx="11" ry="5.5" fill="${fill}"/><ellipse cx="114" cy="176" rx="11" ry="5.5" fill="${fill}"/>` +
        `<path d="M48,181 H152" stroke-width="2" stroke-dasharray="2 6" opacity=".55"/>`
      );
    case "loaf":
      return (
        `<ellipse cx="104" cy="146" rx="62" ry="32" fill="${fill}"/>` +
        outlined("M162,156 C172,178 134,184 118,178", p, fill) +
        `<ellipse cx="82" cy="175" rx="11" ry="5" fill="${fill}"/><ellipse cx="108" cy="176" rx="11" ry="5" fill="${fill}"/>` +
        `<path d="M42,183 H166" stroke-width="2" stroke-dasharray="2 6" opacity=".55"/>`
      );
    case "ghost":
      return (
        `<path d="M136,150 c16,-4 22,-20 12,-30" stroke-width="2.4" stroke-dasharray="1 5"/>` +
        `<path d="M68,80 C62,110 60,140 58,168 Q66,182 74,168 Q82,182 90,168 Q98,182 106,168 Q114,182 122,168 Q130,182 138,168 Q140,140 132,80 Z" fill="${p.ghost}"/>` +
        `<ellipse cx="100" cy="194" rx="34" ry="3.5" stroke-width="1.6" stroke-dasharray="2 5" opacity=".45"/>`
      );
    case "sheet":
      return (
        `<path d="M52,176 C48,120 54,62 72,52 L74,30 L90,44 C97,41 103,41 110,44 L126,30 L128,52 C146,62 152,120 148,176 Q140,188 130,176 Q120,188 110,176 Q100,188 90,176 Q80,188 70,176 Q60,188 52,176 Z" fill="${p.ghost}"/>` +
        `<path d="M66,150 q6,-14 4,-34 M134,150 q-6,-14 -4,-34" stroke-width="1.6" opacity=".45"/>` +
        `<ellipse cx="100" cy="196" rx="40" ry="3" stroke-width="1.6" stroke-dasharray="2 5" opacity=".45"/>`
      );
    case "peek":
    case "none":
      return "";
  }
}

// ---------- accessories ----------

function crate(x: number, y: number, w: number, hgt: number, p: Palette, flaps = true): string {
  const flapL = flaps ? `<path d="M${x},${y} L${x - 16},${y - 22} L${x + w * 0.42},${y - 14} L${x + w * 0.45},${y}" fill="${p.kraft}"/>` : "";
  const flapR = flaps ? `<path d="M${x + w},${y} L${x + w + 14},${y - 24} L${x + w * 0.58},${y - 14} L${x + w * 0.55},${y}" fill="${p.kraft}"/>` : "";
  return (
    flapL + flapR +
    `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" fill="${p.kraft}"/>` +
    `<path d="M${x + 8},${y + 12} l12,-8 M${x + 8},${y + 22} l20,-14 M${x + w - 30},${y + hgt - 6} l22,-16 M${x + w - 18},${y + hgt - 6} l10,-8" stroke-width="1.3" opacity=".5"/>` +
    `<text x="${x + w / 2}" y="${y + hgt / 2 + 6}" text-anchor="middle" font-size="12" fill="${p.ink}" stroke="none" ${MONO} letter-spacing="1">THIS SIDE UP</text>`
  );
}

function acc(a: Acc, h: H, p: Palette, fill: string): string {
  const { x, y, r } = h;
  switch (a) {
    case "sunglasses": {
      const lens = `<path d="M${f(x - r * 0.78)},${f(y - r * 0.16)} h${f(r * 0.64)} v${f(r * 0.2)} q0,${f(r * 0.28)} -${f(r * 0.32)},${f(r * 0.28)} q-${f(r * 0.32)},0 -${f(r * 0.32)},-${f(r * 0.28)} Z" fill="${p.ink}"/><path d="M${f(x - r * 0.66)},${f(y - r * 0.04)} l7,-4" stroke="${p.light}" stroke-width="2"/>`;
      return mirror(h, lens) + `<path d="M${f(x - r * 0.14)},${f(y - r * 0.12)} h${f(r * 0.28)} M${f(x - r * 0.78)},${f(y - r * 0.14)} l-${f(r * 0.24)},-3" stroke-width="2.4"/><path d="M${f(x + r * 0.78)},${f(y - r * 0.14)} l${f(r * 0.24)},-3" stroke-width="2.4"/>`;
    }
    case "glasses":
      return mirror(h, `<circle cx="${f(x - r * 0.38)}" cy="${f(y + r * 0.02)}" r="${f(r * 0.26)}" fill="none" stroke-width="2.4"/>`) + `<path d="M${f(x - r * 0.12)},${f(y)} q${f(r * 0.12)},-5 ${f(r * 0.24)},0" stroke-width="2.2"/>`;
    case "monocle":
      return `<circle cx="${f(x + r * 0.38)}" cy="${f(y + r * 0.02)}" r="${f(r * 0.28)}" fill="none" stroke-width="2.6"/><path d="M${f(x + r * 0.62)},${f(y + r * 0.16)} C${f(x + r * 0.9)},${f(y + r * 0.9)} ${f(x + r * 0.5)},${f(y + r * 1.3)} ${f(x + r * 0.3)},${f(y + r * 1.9)}" stroke-width="1.4" stroke-dasharray="1.5 3"/>`;
    case "halo":
      return `<ellipse cx="${x}" cy="${f(y - r * 1.55)}" rx="${f(r * 0.62)}" ry="${f(r * 0.17)}" fill="none" stroke-width="3.4"/><ellipse cx="${x}" cy="${f(y - r * 1.55)}" rx="${f(r * 0.46)}" ry="${f(r * 0.09)}" fill="none" stroke-width="1.2" opacity=".6"/><path d="M${f(x - r * 0.9)},${f(y - r * 1.75)} l-6,-4 M${f(x + r * 0.9)},${f(y - r * 1.75)} l6,-4 M${x},${f(y - r * 1.95)} v-6" stroke-width="1.8"/>`;
    case "tophat":
      return `<g transform="rotate(-10 ${x} ${f(y - r)})"><rect x="${f(x - r * 0.48)}" y="${f(y - r * 1.85)}" width="${f(r * 0.96)}" height="${f(r * 0.95)}" rx="3" fill="${p.ink}"/><rect x="${f(x - r * 0.48)}" y="${f(y - r * 1.12)}" width="${f(r * 0.96)}" height="${f(r * 0.18)}" fill="${fill}" stroke-width="1.6"/><ellipse cx="${x}" cy="${f(y - r * 0.9)}" rx="${f(r * 0.82)}" ry="${f(r * 0.13)}" fill="${p.ink}"/></g>`;
    case "partyhat":
      return `<g transform="rotate(14 ${x} ${f(y - r)})"><path d="M${f(x - r * 0.42)},${f(y - r * 0.82)} L${x},${f(y - r * 2.0)} L${f(x + r * 0.42)},${f(y - r * 0.82)} Z" fill="${fill}"/><path d="M${f(x - r * 0.3)},${f(y - r * 1.1)} L${f(x + r * 0.22)},${f(y - r * 1.4)} M${f(x - r * 0.16)},${f(y - r * 1.45)} L${f(x + r * 0.1)},${f(y - r * 1.65)} M${f(x - r * 0.38)},${f(y - r * 0.86)} L${f(x + r * 0.36)},${f(y - r * 1.16)}" stroke-width="2"/><circle cx="${x}" cy="${f(y - r * 2.05)}" r="5" fill="${p.ink}"/></g>`;
    case "confetti":
      return `<g stroke-width="2"><path d="M30,40 l6,4 M168,30 l-4,7 M22,96 l7,-2 M178,92 l-6,-4 M44,20 l3,6 M150,58 l6,2"/><rect x="160" y="120" width="6" height="6" transform="rotate(20 163 123)" fill="${p.ink}"/><rect x="28" y="130" width="6" height="6" transform="rotate(-25 31 133)" fill="none"/><circle cx="58" cy="36" r="3" fill="${p.ink}"/><circle cx="142" cy="18" r="2.5" fill="none"/></g>`;
    case "goggles":
      return `<path d="M${f(x - r)},${f(y - r * 0.5)} Q${x},${f(y - r * 0.68)} ${f(x + r)},${f(y - r * 0.5)}" stroke-width="5"/>` + mirror(h, `<circle cx="${f(x - r * 0.34)}" cy="${f(y - r * 0.56)}" r="${f(r * 0.26)}" fill="${fill}" stroke-width="3.6"/><path d="M${f(x - r * 0.44)},${f(y - r * 0.66)} l5,-3" stroke-width="1.6"/>`);
    case "crown":
      return `<path d="M${f(x - r * 0.56)},${f(y - r * 0.78)} l0,-${f(r * 0.52)} l${f(r * 0.28)},${f(r * 0.26)} l${f(r * 0.28)},-${f(r * 0.42)} l${f(r * 0.28)},${f(r * 0.42)} l${f(r * 0.28)},-${f(r * 0.26)} l0,${f(r * 0.52)} Z" fill="${fill}"/><circle cx="${x}" cy="${f(y - r * 0.98)}" r="3" fill="${p.ink}"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.92)}" r="2" fill="${p.ink}"/><circle cx="${f(x + r * 0.3)}" cy="${f(y - r * 0.92)}" r="2" fill="${p.ink}"/>`;
    case "bowtie":
      return `<path d="M${x},${f(y + r)} l-15,-8 v18 Z M${x},${f(y + r)} l15,-8 v18 Z" fill="${p.ink}"/><circle cx="${x}" cy="${f(y + r + 1)}" r="4" fill="${fill}" stroke-width="2"/>`;
    case "collar":
      return `<path d="M${f(x - r * 0.75)},${f(y + r * 0.78)} Q${x},${f(y + r * 1.12)} ${f(x + r * 0.75)},${f(y + r * 0.78)}" stroke-width="6"/><circle cx="${x}" cy="${f(y + r * 1.22)}" r="7" fill="${fill}" stroke-width="2.4"/><path d="M${f(x - 3)},${f(y + r * 1.22)} h6" stroke-width="2.4"/>`;
    case "dogsnout":
      return `<ellipse cx="${x}" cy="${f(y + r * 0.4)}" rx="${f(r * 0.42)}" ry="${f(r * 0.3)}" fill="${fill}"/><ellipse cx="${x}" cy="${f(y + r * 0.26)}" rx="7" ry="5" fill="${p.ink}"/><path d="M${x},${f(y + r * 0.36)} v6 M${f(x - 8)},${f(y + r * 0.56)} q8,6 16,0" stroke-width="2"/><path d="M${f(x - 4)},${f(y + r * 0.62)} q0,12 4,12 q4,0 4,-12" fill="${fill}" stroke-width="2"/>`;
    case "sign":
      return `<path d="M152,150 L166,64" stroke-width="4"/><g transform="rotate(6 164 46)"><rect x="132" y="26" width="64" height="40" rx="2" fill="${fill}" stroke-width="2.6"/><text x="164" y="43" text-anchor="middle" font-size="12" fill="${p.ink}" stroke="none" ${MONO}>CLOSE</text><text x="164" y="58" text-anchor="middle" font-size="12" fill="${p.ink}" stroke="none" ${MONO}>THE LID</text></g><ellipse cx="150" cy="152" rx="9" ry="7" fill="${fill}"/>`;
    case "scorecard":
      return `<g transform="rotate(-8 150 118)"><rect x="128" y="96" width="42" height="34" rx="2" fill="${fill}" stroke-width="2.4"/><text x="149" y="120" text-anchor="middle" font-size="17" fill="${p.ink}" stroke="none" ${MONO}>2/5</text></g><ellipse cx="134" cy="132" rx="8" ry="6" fill="${fill}"/>`;
    case "geiger":
      return `<rect x="122" y="132" width="46" height="34" rx="4" fill="${fill}"/><path d="M131,156 A14,14 0 0 1 159,156" stroke-width="2"/><path d="M145,156 L154,144" stroke-width="2.4"/><circle cx="145" cy="156" r="2.5" fill="${p.ink}"/><path d="M168,148 C184,148 184,116 170,108" stroke-width="2"/><rect x="162" y="96" width="10" height="16" rx="3" transform="rotate(-20 167 104)" fill="${p.ink}"/><ellipse cx="124" cy="150" rx="9" ry="7" fill="${fill}"/><path d="M178,92 l6,-4 M182,102 l7,-1 M174,84 l3,-6" stroke-width="1.6"/>`;
    case "labcoat":
      return `<path d="M74,94 C58,118 54,150 62,176 L138,176 C146,150 142,118 126,94 Z" fill="${fill}"/><path d="M86,100 L98,132 L100,176 M114,100 L102,132" stroke-width="2.4"/><path d="M80,100 L92,124 L86,128 M120,100 L108,124 L114,128" stroke-width="2.2"/><rect x="110" y="142" width="18" height="16" fill="none" stroke-width="2"/><path d="M114,142 v-8 M120,142 v-6" stroke-width="2.4"/><circle cx="104" cy="148" r="1.8" fill="${p.ink}"/><circle cx="104" cy="162" r="1.8" fill="${p.ink}"/><path d="M88,142 V174 M112,160 V174" stroke-width="2.2"/><ellipse cx="86" cy="176" rx="11" ry="5.5" fill="${fill}"/><ellipse cx="114" cy="176" rx="11" ry="5.5" fill="${fill}"/>`;
    case "clipboard":
      return `<g transform="rotate(-6 140 140)"><rect x="114" y="112" width="52" height="64" rx="4" fill="${p.kraft}"/><rect x="120" y="120" width="40" height="52" fill="${fill}" stroke-width="1.6"/><rect x="132" y="106" width="16" height="10" rx="2" fill="${p.ink}"/><text x="140" y="136" text-anchor="middle" font-size="9" fill="${p.ink}" stroke="none" ${MONO}>SUBJECT:</text><text x="140" y="150" text-anchor="middle" font-size="12" fill="${p.ink}" stroke="none" ${MONO}>YOU</text><path d="M125,158 h8 v8 h-8 Z M126,161 l3,3 l5,-7 M138,162 h18" stroke-width="1.5"/></g><ellipse cx="116" cy="146" rx="9" ry="7" fill="${fill}"/>`;
    case "tombstone":
      return `<path d="M106,178 V96 C106,62 172,62 172,96 V178 Z" fill="${p.fill}" stroke-width="3"/><path d="M114,170 l6,-6 M158,108 l6,-6" stroke-width="1.3" opacity=".45"/><text x="139" y="108" text-anchor="middle" font-size="13" fill="${p.ink}" stroke="none" ${MONO}>1 OF 9</text><text x="139" y="126" text-anchor="middle" font-size="13" fill="${p.ink}" stroke="none" ${MONO}>LIVES</text><text x="139" y="144" text-anchor="middle" font-size="13" fill="${p.ink}" stroke="none" ${MONO}>USED</text><path d="M96,180 l4,-8 l3,8 l4,-10 l3,10 M164,180 l4,-9 l3,9 l4,-7 l3,7" stroke-width="2"/><path d="M90,181 H186" stroke-width="2.2"/>`;
    case "chains":
      return `<g stroke-width="2.4">${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${74 + i * 11}" cy="${120 + i * 6}" rx="6" ry="4" transform="rotate(28 ${74 + i * 11} ${120 + i * 6})" fill="none"/>`).join("")}<circle cx="144" cy="166" r="11" fill="${p.ink}"/></g>`;
    case "cloud":
      return `<path d="M28,178 C14,178 14,158 30,158 C30,142 52,140 58,152 C64,138 90,138 94,154 C102,140 128,140 132,156 C140,144 166,146 166,162 C184,160 186,182 168,182 Z" fill="${p.light}" stroke-width="2.8"/><path d="M40,170 q10,4 20,0 M110,170 q12,5 24,0" stroke-width="1.4" opacity=".5"/>`;
    case "candle":
      return `<rect x="32" y="132" width="18" height="44" fill="${fill}"/><path d="M32,138 q4,8 8,0 q4,10 10,-2" stroke-width="1.8"/><path d="M41,132 v-6" stroke-width="2"/><path d="M41,104 C34,114 34,122 41,124 C48,122 48,114 41,104 Z" fill="${fill}" stroke-width="2.2"/><path d="M41,112 c-2,4 -2,7 0,9" stroke-width="1.4"/><path d="M26,98 l-5,-5 M56,98 l5,-5 M41,92 v-6" stroke-width="1.6" opacity=".7"/><path d="M24,178 H58" stroke-width="2.2"/>`;
    case "form":
      return `<g transform="rotate(8 142 140)"><rect x="118" y="102" width="50" height="66" fill="${fill}" stroke-width="2.4"/><text x="143" y="118" text-anchor="middle" font-size="8.5" fill="${p.ink}" stroke="none" ${MONO}>FORM 27-B</text><text x="143" y="130" text-anchor="middle" font-size="6.5" fill="${p.ink}" stroke="none" ${MONO}>RE: BEING DEAD</text><path d="M124,140 h38 M124,148 h30 M124,156 h34" stroke-width="1.3"/><path d="M150,160 l4,4 l8,-10" stroke-width="2"/></g><ellipse cx="120" cy="138" rx="8" ry="6" fill="${p.ghost}"/>`;
    case "harp":
      return `<path d="M138,176 L138,96 C150,88 160,82 168,74 C178,96 176,140 164,176 Z" fill="none" stroke-width="3.4"/><path d="M146,170 V94 M154,170 V88 M162,170 V84 M168,160 V90" stroke-width="1.2"/><path d="M132,178 H172" stroke-width="3"/><ellipse cx="136" cy="128" rx="8" ry="6" fill="${p.ghost}"/><path d="M180,60 q5,-4 2,-10 M186,74 q6,-2 6,-9" stroke-width="1.6"/><circle cx="182" cy="62" r="2.4" fill="${p.ink}"/><circle cx="191" cy="76" r="2.4" fill="${p.ink}"/>`;
    case "wings":
      return mirror(h, `<path d="M74,104 C46,82 18,92 16,112 C26,110 28,120 38,118 C40,128 52,128 56,124 C60,132 70,128 72,124 Z" fill="${p.light}" stroke-width="2.6"/><path d="M32,108 q14,-6 30,4 M44,116 q10,-2 20,4" stroke-width="1.4" opacity=".6"/>`);
    case "flask":
      return `<g transform="rotate(-38 154 70)"><path d="M146,44 h14 v14 l14,26 a6,6 0 0 1 -5,9 h-32 a6,6 0 0 1 -5,-9 l14,-26 Z" fill="${fill}"/><path d="M138,80 h30" stroke-width="1.8"/><path d="M148,70 a2,2 0 1 0 0.1,0 M158,76 a1.6,1.6 0 1 0 0.1,0" stroke-width="1.6"/></g><path d="M178,96 q6,4 4,12 M186,82 q10,2 10,12 M120,36 l-8,-6 M130,26 l-4,-8" stroke-width="1.8"/><path d="M150,178 c8,-6 28,-6 38,0" stroke-width="2" stroke-dasharray="3 4"/><path d="M14,178 H190" stroke-width="2"/>`;
    case "box":
      return crate(42, 122, 116, 60, p);
    case "remeasure":
      return `<path d="M154,40 q20,8 14,36" stroke-width="2" marker-end=""/><path d="M164,72 l4,6 l5,-7" stroke-width="2"/><text x="150" y="34" text-anchor="middle" font-size="11" fill="${p.ink}" stroke="none" ${MONO}>re-measure</text><text x="150" y="46" text-anchor="middle" font-size="11" fill="${p.ink}" stroke="none" ${MONO}>pls</text>`;
    case "holebox":
      return `<path d="M8,104 L18,84 L94,84 L84,104 Z" fill="${p.kraft}"/><rect x="8" y="104" width="76" height="76" fill="${p.kraft}"/><path d="M84,104 L94,84 L94,160 L84,180" fill="${p.kraft}"/><path d="M30,180 L30,150 C24,140 26,124 34,118 L32,104 L42,114 C48,111 56,111 60,114 L70,104 L68,118 C76,126 76,140 70,150 L70,180" fill="${p.ink}" stroke-width="2"/><path d="M22,96 l-10,-6 M86,96 l10,-8 M50,82 l0,-10" stroke-width="1.6"/><path d="M4,182 H98" stroke-width="2"/>`;
    case "erwin":
      return `<g><path d="M30,180 L36,140 C40,132 72,132 76,140 L82,180 Z" fill="${fill}"/><path d="M48,138 l8,10 l8,-10" stroke-width="2"/><path d="M50,150 l6,-3 l6,3 l-6,3 Z" fill="${p.ink}"/><circle cx="56" cy="114" r="20" fill="${fill}"/><path d="M38,104 C40,88 72,88 74,104 C68,98 62,96 56,99 C48,96 42,98 38,104 Z" fill="${p.ink}"/><circle cx="48" cy="114" r="6" fill="none" stroke-width="2.2"/><circle cx="64" cy="114" r="6" fill="none" stroke-width="2.2"/><path d="M54,114 h4" stroke-width="2"/><circle cx="48" cy="115" r="1.8" fill="${p.ink}"/><circle cx="64" cy="115" r="1.8" fill="${p.ink}"/><path d="M50,126 q6,-3 12,0" stroke-width="2.6"/><ellipse cx="56" cy="130" rx="3" ry="2.4" fill="${p.ink}"/><path d="M80,100 q4,6 0,10 q-4,-4 0,-10 Z M28,110 q4,6 0,10 q-4,-4 0,-10 Z" fill="${p.light}" stroke-width="1.6"/><path d="M24,182 H90" stroke-width="2"/><text x="56" y="172" text-anchor="middle" font-size="9" fill="${p.ink}" stroke="none" ${MONO}>E.S.</text></g>`;
    case "zzz":
      return `<path d="M140,46 h10 l-10,10 h10 M156,28 h13 l-13,13 h13 M174,8 h8 l-8,8 h8" stroke-width="2.4"/>`;
    case "sparkles":
      return [
        [36, 46, 8],
        [166, 58, 10],
        [156, 138, 6],
        [30, 120, 6],
      ]
        .map(([sx, sy, s]) => `<path d="M${sx},${sy - s} Q${sx},${sy} ${sx + s},${sy} Q${sx},${sy} ${sx},${sy + s} Q${sx},${sy} ${sx - s},${sy} Q${sx},${sy} ${sx},${sy - s} Z" fill="${p.ink}" stroke-width="1"/>`)
        .join("");
    case "stars":
      return `<ellipse cx="${x}" cy="${f(y - r * 1.1)}" rx="${f(r * 1.05)}" ry="${f(r * 0.26)}" fill="none" stroke-width="1.4" stroke-dasharray="3 5"/>` +
        [[x - r, y - r * 1.12], [x + r * 0.5, y - r * 1.34], [x + r * 0.9, y - r * 0.98]]
          .map(([sx, sy]) => `<path d="M${f(sx)},${f(sy - 6)} l2,4 l4,1 l-3,3 l1,4 l-4,-2 l-4,2 l1,-4 l-3,-3 l4,-1 Z" fill="${p.ink}" stroke-width="1"/>`)
          .join("");
    case "tabby":
      return `<path d="M${x},${f(y - r * 0.9)} v${f(r * 0.3)} M${f(x - 8)},${f(y - r * 0.86)} v${f(r * 0.22)} M${f(x + 8)},${f(y - r * 0.86)} v${f(r * 0.22)}" stroke-width="2.2"/><path d="M146,120 q-6,6 -4,14 M154,132 q-6,6 -4,14 M58,128 q6,6 4,14" stroke-width="2.2" opacity=".8"/>`;
    case "arms":
      return `<path d="M68,112 q-18,-8 -22,-26 M132,112 q18,-8 22,-26" stroke-width="3"/><path d="M44,84 l-4,-6 M46,84 l2,-7 M156,84 l4,-6 M154,84 l-2,-7" stroke-width="2"/>`;
  }
}

const BACK_ACC: Acc[] = ["wings", "halo", "stars"];
const SCENE_BACK: Acc[] = ["tombstone", "holebox", "harp"];
const SCENE_FRONT: Acc[] = ["cloud", "box", "erwin", "candle", "confetti", "flask", "zzz", "sparkles", "remeasure"];

// ---------- scenes for Weird and Legendary ----------

function scene(kind: NonNullable<CatSpec["scene"]>, p: Palette): string {
  switch (kind) {
    case "milk":
      return (
        crate(40, 112, 120, 68, p) +
        `<path d="M56,112 L70,96 L146,96 L144,112" fill="${p.ink}" opacity=".85"/>` +
        `<g transform="rotate(-7 100 64)"><rect x="66" y="34" width="68" height="52" fill="${p.light}" stroke-width="2.4"/><path d="M100,34 l0,-6" stroke-width="3"/><circle cx="100" cy="30" r="3" fill="${p.ink}"/><text x="100" y="54" text-anchor="middle" font-size="10" fill="${p.ink}" stroke="none" ${MONO}>went out</text><text x="100" y="67" text-anchor="middle" font-size="10" fill="${p.ink}" stroke="none" ${MONO}>for milk.</text><text x="118" y="80" text-anchor="middle" font-size="9" fill="${p.ink}" stroke="none" ${MONO}>- C.</text></g>` +
        `<path d="M30,184 H170" stroke-width="2"/>`
      );
    case "nested":
      return (
        crate(22, 100, 156, 82, p, false) +
        `<rect x="54" y="62" width="92" height="56" fill="${p.kraft}"/><rect x="78" y="34" width="44" height="32" fill="${p.kraft}"/><rect x="92" y="18" width="16" height="16" fill="${p.kraft}"/><path d="M98,24 h4" stroke-width="1.5"/>` +
        `<path d="M14,184 H186" stroke-width="2"/>`
      );
    case "wave":
      return (
        `<path d="M10,120 C30,70 50,70 70,120 S110,170 130,120 S170,70 190,120" stroke-width="5"/>` +
        `<path d="M44,86 L48,62 L58,80 M66,82 L76,64 L78,88" fill="${p.fill}" stroke-width="3"/>` +
        `<circle cx="54" cy="92" r="3" fill="${p.ink}"/><circle cx="66" cy="92" r="3" fill="${p.ink}"/><path d="M56,100 q2,3 4,0 q2,3 4,0" stroke-width="1.8"/>` +
        `<path d="M30,96 l-14,-3 M30,100 l-14,2 M82,96 l14,-3 M82,100 l14,2" stroke-width="1.2"/>` +
        `<path d="M10,150 C30,130 50,130 70,150 S110,170 130,150 S170,130 190,150" stroke-width="1.6" opacity=".4" stroke-dasharray="3 5"/>`
      );
    case "slits":
      return (
        `<rect x="92" y="14" width="16" height="50" fill="${p.ink}"/><rect x="92" y="82" width="16" height="36" fill="${p.ink}"/><rect x="92" y="136" width="16" height="50" fill="${p.ink}"/>` +
        `<path d="M10,100 h40" stroke-width="2" stroke-dasharray="4 4"/>` +
        `<path d="M108,73 C140,73 150,40 186,30 M108,127 C140,127 150,160 186,170" stroke-width="2.2" stroke-dasharray="2 5"/>` +
        [40, 70, 100, 130, 160].map((yy, i) => `<path d="M180,${yy - 8} L184,${yy - 18} L188,${yy - 8}" stroke-width="2" opacity="${[0.5, 0.8, 1, 0.8, 0.5][i]}"/><path d="M192,${yy - 8} L196,${yy - 18} L198,${yy - 6}" stroke-width="2" opacity="${[0.5, 0.8, 1, 0.8, 0.5][i]}"/>`).join("") +
        `<path d="M46,74 L42,56 L56,66 C62,64 68,64 74,66 L88,56 L84,74" fill="${p.fill}" stroke-width="2.6"/><circle cx="56" cy="78" r="2.6" fill="${p.ink}"/><circle cx="72" cy="78" r="2.6" fill="${p.ink}"/>` +
        `<path d="M40,74 C36,104 44,112 64,112 C84,112 92,104 88,74" fill="none" stroke-width="2.6"/>`
      );
    case "superposed": {
      const alive = renderParts({ body: "sit", ears: "pointy", eyes: "sparkle", mouth: "w" }, p);
      const dead = renderParts({ body: "ghost", ears: "pointy", eyes: "x", mouth: "o", acc: ["halo"] }, p);
      return (
        `<defs><clipPath id="sp-l"><rect x="0" y="0" width="100" height="200"/></clipPath><clipPath id="sp-r"><rect x="100" y="0" width="100" height="200"/></clipPath></defs>` +
        `<g class="sp-ghost-copy" opacity=".35" transform="translate(-5 0)">${alive}</g>` +
        `<g clip-path="url(#sp-l)">${alive}</g><g clip-path="url(#sp-r)">${dead}</g>` +
        `<path d="M100,4 V196" stroke-width="2" stroke-dasharray="6 4 1 4"/>` +
        `<text x="50" y="196" text-anchor="middle" font-size="10" fill="${p.ink}" stroke="none" ${MONO}>|alive⟩</text><text x="150" y="196" text-anchor="middle" font-size="10" fill="${p.ink}" stroke="none" ${MONO}>|dead⟩</text>`
      );
    }
  }
}

function renderParts(spec: CatSpec, p: Palette): string {
  const ghosty = spec.ghost || spec.body === "ghost" || spec.body === "sheet";
  const fill = ghosty ? p.ghost : p.fill;
  const h = HEADS[spec.body];
  const list = spec.acc ?? [];
  const sceneBack = list.filter((a) => SCENE_BACK.includes(a)).map((a) => acc(a, h, p, fill)).join("");
  const back = list.filter((a) => BACK_ACC.includes(a)).map((a) => acc(a, h, p, fill)).join("");
  const front = list.filter((a) => !BACK_ACC.includes(a) && !SCENE_BACK.includes(a) && !SCENE_FRONT.includes(a)).map((a) => acc(a, h, p, fill)).join("");
  const sceneFront = list.filter((a) => SCENE_FRONT.includes(a)).map((a) => acc(a, h, p, fill)).join("");

  let cat = back + body(spec.body, p, fill);
  if (spec.body !== "none") {
    if (spec.body !== "sheet") {
      cat += ears(spec.ears ?? "pointy", h, p, fill) + head(h, p, fill);
      if (!list.includes("dogsnout")) cat += nose(h, p) + whiskers(h);
    }
    cat += eyes(spec.eyes ?? "open", h, p);
    if (!list.includes("dogsnout")) cat += mouth(spec.mouth ?? "w", h, p);
  }
  cat += front;

  const pose = spec.pose;
  if (pose) {
    const s = pose.s ?? 1;
    cat = `<g transform="translate(${(pose.tx ?? 0) + 100 * (1 - s)} ${(pose.ty ?? 0) + 100 * (1 - s)}) scale(${s})">${cat}</g>`;
  }
  // The crate in "peek" sits in front of the cat; draw it after the pose group.
  return sceneBack + cat + sceneFront;
}

/** Full SVG markup for a cat spec. */
export function catSVG(spec: CatSpec, p: Palette = DOM_PALETTE, opts: { wobble?: boolean; cls?: string } = {}): string {
  const inner = spec.scene ? scene(spec.scene, p) : renderParts(spec, p);
  const filter = opts.wobble ? ` filter="url(#inkwob)"` : "";
  return `<svg class="${opts.cls ?? "cat"}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="${p.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"${filter}>${inner}</g></svg>`;
}
