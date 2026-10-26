import { catSVG, type Palette } from "./cats";
import type { Outcome } from "./outcomes";
import { TIER_LABEL, type Tier } from "./physics";
import { track } from "./analytics";

export const TIER_COLOR: Record<Tier, string> = {
  common: "#1F2433",
  uncommon: "#19C26A",
  rare: "#1E9BE8",
  epic: "#9B4DFF",
  legendary: "#F2B21B",
  weird: "#F0399F",
};

export const TIER_PIPS: Record<Tier, string> = {
  common: "●",
  uncommon: "◆",
  rare: "◆◆",
  epic: "◆◆◆",
  legendary: "★",
  weird: "✦",
};

const CANVAS_PALETTE: Palette = { ink: "#1F2433", fill: "#FBF6EA", ghost: "#E2F0EE", kraft: "#D2AE7C", light: "#FBF6EA" };

export const siteURL = () => location.origin + location.pathname;

export type ShareOutcome = "shared" | "copied" | "downloaded" | "failed";

export async function shareText(text: string, url = siteURL(), kind = "text"): Promise<ShareOutcome> {
  track("share", { kind });
  const full = `${text}\n${url}`;
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(full);
    return "copied";
  } catch {
    return "failed";
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Renders a 1080 x 1350 share card as a PNG blob. */
export async function renderCardImage(o: Outcome, meta: { lens: string; wait: number; side: string }): Promise<Blob | null> {
  await document.fonts.ready;
  const W = 1080;
  const H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const color = TIER_COLOR[o.tier];

  // Graph paper
  ctx.fillStyle = "#F2EAD6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(95,140,170,.18)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 27) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 27) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(200,85,61,.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(110, 0);
  ctx.lineTo(110, H);
  ctx.stroke();

  // Title
  ctx.fillStyle = "#1F2433";
  ctx.font = "900 64px 'Big Shoulders Stencil Display', Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SCHRÖDINGER'S BOX", W / 2, 120);

  // Card with tier glow
  const cx = 190;
  const cy = 180;
  const cw = 700;
  const ch = 960;
  ctx.save();
  if (o.tier !== "common") {
    ctx.shadowColor = color;
    ctx.shadowBlur = 70;
  }
  ctx.fillStyle = "#FBF6EA";
  roundRect(ctx, cx, cy, cw, ch, 18);
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = o.tier === "legendary" ? 14 : 6;
  ctx.strokeStyle = o.tier === "common" ? "#1F2433" : color;
  roundRect(ctx, cx, cy, cw, ch, 18);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1F2433";
  roundRect(ctx, cx + 22, cy + 22, cw - 44, ch - 44, 10);
  ctx.stroke();

  ctx.font = "800 38px 'Big Shoulders Display', Impact, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = o.tier === "common" ? "#1F2433" : color;
  ctx.fillText(`${TIER_PIPS[o.tier]}  ${TIER_LABEL[o.tier].toUpperCase()}`, cx + 50, cy + 82);
  ctx.textAlign = "right";
  ctx.fillStyle = "#1F2433";
  ctx.fillText(meta.side.toUpperCase(), cx + cw - 50, cy + 82);

  const svg = catSVG(o.cat, CANVAS_PALETTE);
  try {
    const img = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
    ctx.drawImage(img, cx + 90, cy + 110, cw - 180, cw - 180);
  } catch {
    /* art failed to rasterize; the card still has its text */
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#1F2433";
  ctx.font = "800 78px 'Big Shoulders Display', Impact, sans-serif";
  ctx.fillText(o.name.toUpperCase(), W / 2, cy + 770);
  ctx.font = "30px 'Special Elite', 'Courier New', monospace";
  wrap(ctx, o.flavor, W / 2, cy + 830, cw - 120, 40);

  ctx.font = "34px 'Special Elite', 'Courier New', monospace";
  ctx.fillText(`${meta.lens} · waited ${meta.wait.toFixed(2)} half-lives`, W / 2, H - 92);
  ctx.font = "26px 'Special Elite', 'Courier New', monospace";
  ctx.fillStyle = "rgba(31,36,51,.7)";
  ctx.fillText(location.host || "schrodingers-box", W / 2, H - 44);

  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number): void {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > max && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
}

export async function shareImage(blob: Blob, filename: string, text: string): Promise<ShareOutcome> {
  track("share", { kind: "image" });
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] }) && matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ files: [file], text });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "failed";
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return "downloaded";
}
