import { catSVG } from "./cats";
import { OUTCOMES, type Outcome } from "./outcomes";
import { TIER_LABEL } from "./physics";
import { TIER_PIPS } from "./share";
import { esc } from "./ui";

export const cardNumber = (o: Outcome) => OUTCOMES.indexOf(o) + 1;

export function sideLabel(o: Outcome, side?: "alive" | "dead"): string {
  if (o.tier === "legendary") return "Alive & Dead";
  if (o.tier === "weird") return side ? `${side === "alive" ? "Alive" : "Dead"}?` : "Unclear";
  return o.side === "alive" ? "Alive" : "Dead";
}

/** The collectible specimen card. Tier is carried by label, pips and frame shape, not color alone. */
export function cardHTML(o: Outcome, opts: { side?: "alive" | "dead"; isNew?: boolean; cls?: string } = {}): string {
  return `<article class="card tier-${o.tier} ${opts.cls ?? ""}" data-id="${o.id}">
    <div class="card-inner">
      <header class="card-top">
        <span class="tier-badge"><i aria-hidden="true">${TIER_PIPS[o.tier]}</i>${TIER_LABEL[o.tier]}</span>
        <span class="card-no">Nº ${String(cardNumber(o)).padStart(2, "0")}</span>
      </header>
      <div class="card-art">${catSVG(o.cat, undefined, { wobble: true })}</div>
      <h3 class="card-name">${esc(o.name)}</h3>
      <p class="card-side">${sideLabel(o, opts.side)}</p>
      <p class="card-flavor">${esc(o.flavor)}</p>
    </div>
    ${opts.isNew ? `<span class="stamp stamp-new" aria-label="New card">New!</span>` : ""}
  </article>`;
}
