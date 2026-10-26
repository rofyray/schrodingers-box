// The live decay plot: a pen inks the survival curve and the score line as you wait.

import { MAX_HALF_LIVES } from "./physics";

const L = 38;
const R = 378;
const TOP = 16;
const BOT = 128;
const X = (h: number) => L + (h / MAX_HALF_LIVES) * (R - L);
const YS = (surv: number) => BOT - surv * (BOT - TOP);
const YM = (m: number) => BOT - ((m - 1) / 8) * (BOT - TOP);

const HAND = `font-family="'Nanum Pen Script','Comic Sans MS',cursive"`;

function survivalPath(to: number, steps = 60): string {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const h = (to * i) / steps;
    d += `${i ? "L" : "M"}${X(h).toFixed(1)},${YS(Math.pow(2, -h)).toFixed(1)}`;
  }
  return d;
}

export interface Plot {
  el: SVGSVGElement;
  update(h: number): void;
  mark(h: number, label: string, dead: boolean): void;
  peek(from: number, to: number): void;
  freeze(h: number): void;
}

export function createPlot(container: HTMLElement): Plot {
  container.innerHTML = `<svg class="plot-svg" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Survival odds falling as time passes">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${[1, 2, 3].map((h) => `<path d="M${X(h)},${TOP} V${BOT}" class="pl-guide"/>`).join("")}
    ${[0.5, 0.25, 0.125].map((s) => `<path d="M${L},${YS(s)} H${R}" class="pl-guide"/>`).join("")}
    <path d="M${L},${TOP - 6} V${BOT} H${R + 8}" class="pl-axis"/>
    <path d="M${R + 3},${BOT - 4} l6,4 l-6,4" class="pl-axis"/>
    <rect class="pl-peek" x="0" y="${TOP}" width="0" height="${BOT - TOP}" rx="8"/>
    <path class="pl-pencil" d="${survivalPath(MAX_HALF_LIVES)}"/>
    <path class="pl-pencil pl-pencil-m" d="M${X(0)},${YM(1)} L${X(MAX_HALF_LIVES)},${YM(9)}"/>
    <path class="pl-ink-m" d=""/>
    <path class="pl-ink" d=""/>
    <path class="pl-now" d=""/>
    <g class="pl-pen"><circle r="4.5" class="pl-pen-dot"/><path d="M0,0 l10,-22 l7,3 l-10,22 Z" class="pl-nib"/></g>
    <circle class="pl-mdot" r="3.2"/>
    <g class="pl-mark" opacity="0"><path d="M-6,-6 L6,6 M6,-6 L-6,6" class="pl-x"/><text class="pl-mark-t" x="0" y="-12" text-anchor="middle" ${HAND}></text></g>
  </g>
  <g class="pl-labels" ${HAND}>
    <text x="${L - 6}" y="${TOP + 4}" text-anchor="end">100%</text>
    <text x="${L - 6}" y="${YS(0.5) + 4}" text-anchor="end">50%</text>
    <text x="${L - 6}" y="${YS(0.25) + 4}" text-anchor="end">25%</text>
    ${["0", "T", "2T", "3T", "4T"].map((s, i) => `<text x="${X(i)}" y="${BOT + 16}" text-anchor="middle">${s}</text>`).join("")}
    <text class="pl-key" x="${X(1.25)}" y="${YS(0.42) - 6}">alive</text>
    <text class="pl-key pl-key-m" x="${X(3.2)}" y="${YM(7.4) - 6}">× score</text>
  </g>
</svg>`;
  const el = container.querySelector("svg") as SVGSVGElement;
  const ink = el.querySelector(".pl-ink") as SVGPathElement;
  const inkM = el.querySelector(".pl-ink-m") as SVGPathElement;
  const now = el.querySelector(".pl-now") as SVGPathElement;
  const pen = el.querySelector(".pl-pen") as SVGGElement;
  const mdot = el.querySelector(".pl-mdot") as SVGCircleElement;
  const markG = el.querySelector(".pl-mark") as SVGGElement;
  const markT = el.querySelector(".pl-mark-t") as SVGTextElement;
  const peekR = el.querySelector(".pl-peek") as SVGRectElement;
  let frozen = false;

  const update = (h: number) => {
    if (frozen) return;
    const hh = Math.min(MAX_HALF_LIVES, Math.max(0, h));
    ink.setAttribute("d", survivalPath(hh, Math.max(4, Math.ceil(hh * 18))));
    inkM.setAttribute("d", `M${X(0)},${YM(1)} L${X(hh).toFixed(1)},${YM(1 + 2 * hh).toFixed(1)}`);
    const px = X(hh);
    const py = YS(Math.pow(2, -hh));
    pen.setAttribute("transform", `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
    mdot.setAttribute("cx", px.toFixed(1));
    mdot.setAttribute("cy", YM(1 + 2 * hh).toFixed(1));
    now.setAttribute("d", `M${px.toFixed(1)},${TOP} V${BOT}`);
  };

  update(0);

  return {
    el,
    update,
    freeze(h: number) {
      update(h);
      frozen = true;
      el.classList.add("is-frozen");
    },
    mark(h: number, label: string, dead: boolean) {
      const hh = Math.min(MAX_HALF_LIVES, h);
      markG.setAttribute("transform", `translate(${X(hh).toFixed(1)} ${YS(Math.pow(2, -hh)).toFixed(1)})`);
      markT.textContent = label;
      markT.setAttribute("text-anchor", hh > 3 ? "end" : hh < 0.4 ? "start" : "middle");
      markG.classList.toggle("is-dead", dead);
      markG.setAttribute("opacity", "1");
    },
    peek(from: number, to: number) {
      peekR.setAttribute("x", X(from).toFixed(1));
      peekR.setAttribute("width", (X(to) - X(from)).toFixed(1));
      el.classList.add("has-peek");
    },
  };
}
