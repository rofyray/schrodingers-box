import { save } from "./state";
import { uiTap } from "./audio";

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll(sel)) as T[];

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export function reducedMotion(): boolean {
  if (save.settings.reducedMotion !== null) return save.settings.reducedMotion;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------- icons (hand-inked, inline) ----------

export const ICON = {
  paw: `<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><ellipse cx="12" cy="16" rx="5.2" ry="4.4"/><ellipse cx="5.6" cy="10.4" rx="2.1" ry="2.6"/><ellipse cx="9.6" cy="6.6" rx="2.1" ry="2.7"/><ellipse cx="14.4" cy="6.6" rx="2.1" ry="2.7"/><ellipse cx="18.4" cy="10.4" rx="2.1" ry="2.6"/></g></svg>`,
  flame: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c-4.4 0-7-3-7-6.6 0-3.6 2.6-5.6 3.6-8.4.6 1.8 1.6 2.8 2.6 3.2C11 7 12.6 4 15 2c-.4 3 .8 5 2.4 7 1.2 1.6 1.6 3.4 1.6 5.4C19 19 16.4 22 12 22z" fill="currentColor"/><path d="M12 21c-1.8 0-3-1.2-3-3 0-1.8 1.6-2.6 2.2-4.4.8 1.4 3.8 2.2 3.8 4.4 0 1.8-1.2 3-3 3z" fill="var(--paper)"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></g></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></g></svg>`,
  lock: `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  ghost: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V11a7 7 0 0 1 14 0v10l-2.3-1.6L14.3 21 12 19.4 9.7 21l-2.4-1.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9.5" cy="11" r="1.3" fill="currentColor"/><circle cx="14.5" cy="11" r="1.3" fill="currentColor"/></svg>`,
  cat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8L6 3l3.5 4h5L18 3l2 5v12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><path d="M10.5 15.5q1.5 1.2 3 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

// ---------- live regions + toasts ----------

export function announce(msg: string): void {
  const sr = $("#sr");
  sr.textContent = "";
  requestAnimationFrame(() => (sr.textContent = msg));
}

export function toast(html: string, kind: "info" | "achv" | "unlock" = "info", ms = 2600): void {
  const root = $("#toasts");
  const el = document.createElement("div");
  el.className = `toast toast-${kind}`;
  el.innerHTML = html;
  root.append(el);
  requestAnimationFrame(() => el.classList.add("is-in"));
  setTimeout(() => {
    el.classList.remove("is-in");
    setTimeout(() => el.remove(), 400);
  }, ms);
}

// ---------- bottom sheets ----------

let sheetCleanup: (() => void) | null = null;
let lastFocus: HTMLElement | null = null;

export function openSheet(title: string, body: string, opts: { wide?: boolean; onMount?: (root: HTMLElement) => void; cls?: string } = {}): HTMLElement {
  closeSheet(false);
  lastFocus = document.activeElement as HTMLElement;
  const root = $("#sheet-root");
  root.innerHTML = `<div class="scrim" data-close></div>
  <section class="sheet ${opts.wide ? "sheet-wide" : ""} ${opts.cls ?? ""}" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
    <header class="sheet-head"><h2 id="sheet-title">${title}</h2><button class="icon-btn" data-close aria-label="Close">${ICON.close}</button></header>
    <div class="sheet-body">${body}</div>
  </section>`;
  root.classList.add("is-open");
  const sheet = $(".sheet", root);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeSheet();
    if (e.key === "Tab") {
      const f = $$<HTMLElement>("button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])", sheet).filter((x) => !x.hasAttribute("disabled"));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    }
  };
  root.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("[data-close]")) closeSheet();
  });
  document.addEventListener("keydown", onKey, true);
  sheetCleanup = () => document.removeEventListener("keydown", onKey, true);
  opts.onMount?.(sheet);
  requestAnimationFrame(() => {
    sheet.classList.add("is-in");
    ($("[data-close].icon-btn", sheet) as HTMLElement).focus({ preventScroll: true });
  });
  return sheet;
}

export function sheetOpen(): boolean {
  return $("#sheet-root").classList.contains("is-open");
}

export function closeSheet(restoreFocus = true): void {
  const root = $("#sheet-root");
  if (!root.classList.contains("is-open")) return;
  sheetCleanup?.();
  sheetCleanup = null;
  root.classList.remove("is-open");
  root.innerHTML = "";
  if (restoreFocus) lastFocus?.focus?.({ preventScroll: true });
}

/** Global click sound for every button. */
export function bindButtonSounds(): void {
  document.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("button:not(.open-btn)")) uiTap();
  });
}
