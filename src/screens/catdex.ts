import { cardHTML, sideLabel } from "../card";
import { catSVG } from "../cats";
import { OUTCOMES, BY_ID, TOTAL_CARDS, type Outcome } from "../outcomes";
import { TIER_LABEL } from "../physics";
import { nav } from "../run";
import { renderCardImage, shareImage, TIER_PIPS } from "../share";
import { catdexPercent, save, uniqueCards } from "../state";
import { $, $$, ICON, openSheet, toast } from "../ui";

type Filter = "all" | "alive" | "dead" | "odd" | "other";

export function mountCatdex(root: HTMLElement): () => void {
  let filter: Filter = "all";

  const tile = (o: Outcome) => {
    const rec = save.catdex[o.id];
    const no = String(OUTCOMES.indexOf(o) + 1).padStart(2, "0");
    if (!rec)
      return `<button class="dex-tile missing tier-${o.tier}" data-id="${o.id}" aria-label="Card ${no}, not found yet, ${TIER_LABEL[o.tier]}"><span class="dex-no">${no}</span><span class="dex-art">${catSVG(o.cat)}</span><span class="dex-name">? ? ?</span><span class="dex-tier">${TIER_PIPS[o.tier]}</span></button>`;
    return `<button class="dex-tile tier-${o.tier}" data-id="${o.id}" aria-label="${o.name}, ${TIER_LABEL[o.tier]}"><span class="dex-no">${no}</span><span class="dex-art">${catSVG(o.cat, undefined, { wobble: true })}</span><span class="dex-name">${o.name}</span><span class="dex-tier">${TIER_PIPS[o.tier]}${rec.count > 1 ? ` <em>×${rec.count}</em>` : ""}</span></button>`;
  };

  const list = (): Outcome[] => {
    if (filter === "alive") return OUTCOMES.filter((o) => o.side === "alive");
    if (filter === "dead") return OUTCOMES.filter((o) => o.side === "dead");
    if (filter === "odd") return OUTCOMES.filter((o) => o.side === "both");
    return OUTCOMES;
  };

  const render = () => {
    const n = uniqueCards();
    const body =
      filter === "other"
        ? save.otherYou.length
          ? `<p class="dex-note">Cards your other branches collected while you followed this one. Newest first.</p><div class="dex-grid">${save.otherYou.map((id, i) => (BY_ID[id] ? tile(BY_ID[id]).replace("dex-tile", `dex-tile ou-${i}`) : "")).join("")}</div>`
          : `<p class="dex-empty">Other You hasn't collected anything yet. Switch to the Many-Worlds lens and open a box.</p>`
        : `<div class="dex-grid">${list().map(tile).join("")}</div>`;
    root.innerHTML = `<section class="screen catdex">
      <header class="screen-head">
        <button class="icon-btn" data-act="back" aria-label="Back home">${ICON.back}</button>
        <h1>Catdex</h1>
        <span class="dex-count">${n}/${TOTAL_CARDS}</span>
      </header>
      <div class="ruler" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${catdexPercent()}" aria-label="Catdex completion"><div class="ruler-fill" style="width:${catdexPercent()}%"></div><span>${catdexPercent()}% catalogued</span></div>
      <div class="tabs" role="tablist">
        ${(["all", "alive", "dead", "odd", "other"] as Filter[]).map((f) => `<button role="tab" aria-selected="${f === filter}" data-f="${f}">${{ all: "All", alive: "Alive", dead: "Dead", odd: "Weird & Legendary", other: "Other You" }[f]}</button>`).join("")}
      </div>
      ${body}
    </section>`;
  };

  render();

  root.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    if (el.closest("[data-act=back]")) return nav.go("home");
    const f = el.closest<HTMLElement>("[data-f]")?.dataset.f as Filter | undefined;
    if (f) {
      filter = f;
      render();
      ($(`[data-f=${f}]`, root) as HTMLElement).focus();
      return;
    }
    const id = el.closest<HTMLElement>(".dex-tile")?.dataset.id;
    if (id) openCard(id);
  });

  return () => {};
}

export function openCard(id: string): void {
  const o = BY_ID[id];
  const rec = save.catdex[id];
  if (!rec) {
    openSheet(
      "Not found yet",
      `<div class="dex-detail"><div class="card-silhouette tier-${o.tier}">${catSVG(o.cat)}</div><p class="detail-meta">${TIER_PIPS[o.tier]} ${TIER_LABEL[o.tier]} · ${o.side === "both" ? "either side" : o.side === "alive" ? "Alive side" : "Dead side"}</p><p class="detail-hint">${o.tier === "common" ? "Open more boxes." : "Waiting longer raises the odds of rarer cards."}</p></div>`,
    );
    return;
  }
  openSheet(
    o.name,
    `<div class="dex-detail">${cardHTML(o, { cls: "card-hero card-static" })}
      <p class="detail-meta">Found ${rec.count} time${rec.count > 1 ? "s" : ""} · first on ${rec.firstAt}${rec.viaBranch ? " · only by Other You so far" : ""}</p>
      <button class="btn btn-ghost save-card">Save card image</button></div>`,
    {
      onMount: (s) =>
        $(".save-card", s).addEventListener("click", async () => {
          const blob = await renderCardImage(o, { lens: "Catdex", wait: 0, side: sideLabel(o) });
          if (blob && (await shareImage(blob, `schrodingers-box-${o.id}.png`, o.name)) === "downloaded") toast("Card saved as an image.");
        }),
    },
  );
  $$(".sheet .card").forEach((c) => c.classList.add("is-flipped"));
}
