import { cardHTML } from "../card";
import { LENS_BY_ID } from "../lenses";
import { BY_ID } from "../outcomes";
import { TIER_RANK } from "../physics";
import { nav, newRun, type RunState } from "../run";
import { shareText } from "../share";
import { persist, save } from "../state";
import { track } from "../analytics";
import { $, fmt, ICON, reducedMotion, toast } from "../ui";

const glyph = (h: RunState["history"][number]) =>
  h.tier === "legendary" ? "🌀" : h.tier === "weird" ? "📦" : h.side === "dead" ? "👻" : TIER_RANK[h.tier] >= 2 ? "⭐" : "🐈";

export function mountSummary(root: HTMLElement, run: RunState): () => void {
  const isRecord = run.score > save.highScore;
  save.runs++;
  save.highScore = Math.max(save.highScore, run.score);
  save.bestStreak = Math.max(save.bestStreak, run.bestStreak);
  persist();
  track("run_end", { score: run.score, rounds: run.history.length, lens: save.activeLens });

  const alive = run.history.filter((h) => h.side === "alive").length;
  const avgWait = run.history.reduce((a, h) => a + h.x, 0) / Math.max(1, run.history.length);

  root.innerHTML = `<section class="screen summary">
    <article class="report ${reducedMotion() ? "" : "typed"}">
      <header class="report-head">
        <p class="kicker">Laboratory report · run ${save.runs}</p>
        <h1>Nine lives, spent.</h1>
        ${isRecord ? `<span class="stamp stamp-record">New record</span>` : `<span class="stamp stamp-done">Run complete</span>`}
      </header>
      <dl class="report-lines">
        <div><dt>Final score</dt><dd class="big">${fmt(run.score)}</dd></div>
        <div><dt>Boxes opened</dt><dd>${run.history.length}</dd></div>
        <div><dt>Cats alive</dt><dd>${alive} of ${run.history.length}</dd></div>
        <div><dt>Best streak</dt><dd>${run.bestStreak}</dd></div>
        <div><dt>Average wait</dt><dd>${avgWait.toFixed(2)} half-lives</dd></div>
        <div><dt>Interpretation</dt><dd>${LENS_BY_ID[save.activeLens].name}</dd></div>
      </dl>
      <p class="report-strip" aria-label="Round by round results">${run.history.map((h) => `<span class="rs ${h.side}" title="${h.side}, ${h.tier}">${h.side === "dead" ? ICON.ghost : ICON.cat}</span>`).join("")}</p>
      ${run.newCards.length ? `<h2 class="report-sub">New in the Catdex · ${run.newCards.length}</h2><div class="new-cards">${run.newCards.map((id) => cardHTML(BY_ID[id], { cls: "card-mini" })).join("")}</div>` : `<p class="report-note">No new cards this run. The box is holding out on you.</p>`}
      <p class="report-sign">signed, the observer</p>
    </article>
    <div class="summary-actions">
      <button class="btn btn-primary btn-xl" data-act="again">Play again<small>9 fresh lives</small></button>
      <button class="btn" data-act="share">Share result</button>
      <div class="summary-row"><button class="btn btn-ghost" data-act="catdex">Catdex</button><button class="btn btn-ghost" data-act="home">Home</button></div>
    </div>
  </section>`;

  root.addEventListener("click", async (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
    if (act === "again") nav.go("round", newRun("run"));
    if (act === "home") nav.go("home");
    if (act === "catdex") nav.go("catdex");
    if (act === "share") {
      const text = `Schrödinger's Box · ${fmt(run.score)} pts · best streak ${run.bestStreak}\n${run.history.map(glyph).join("")}\n${run.newCards.length} new cats · ${LENS_BY_ID[save.activeLens].name}`;
      const out = await shareText(text, undefined, "run");
      if (out === "copied") toast("Copied. Paste it anywhere.");
    }
  });
  setTimeout(() => ($("[data-act=again]", root) as HTMLButtonElement).focus({ preventScroll: true }), 400);
  return () => {};
}
