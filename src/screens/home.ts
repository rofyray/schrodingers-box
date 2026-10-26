import { ACHIEVEMENTS } from "../achievements";
import { crateSVG } from "../crate";
import { dailyNumber, dailySeed } from "../game";
import { LENSES } from "../lenses";
import { BY_ID, TOTAL_CARDS } from "../outcomes";
import { TIER_LABEL } from "../physics";
import { nav, newRun } from "../run";
import { catdexPercent, persist, save, today, uniqueCards, type LensId } from "../state";
import { $, $$, fmt, ICON } from "../ui";
import { openAbout, openAchievements, openDailyDone, openMultiverse, openSettings } from "./sheets";

/** First visit only: one tap to play. The tap also unlocks sound before the first box appears. */
export function mountIntro(root: HTMLElement): () => void {
  root.innerHTML = `<section class="screen intro">
    <header class="home-head">
      <p class="kicker">A push-your-luck thought experiment</p>
      <h1 class="title"><span>Schrödinger's</span><span>Box</span></h1>
    </header>
    <div class="home-stage">
      <p class="fig-note" aria-hidden="true">fig. 1: one cat, probably</p>
      <div class="crate-wrap idle">${crateSVG()}<div class="crate-shadow"></div></div>
    </div>
    <p class="intro-pitch">Wait longer for bigger rewards, but every second the atom is more likely to have decayed.</p>
    <button class="btn btn-primary btn-xl intro-play">Play<small>9 lives</small></button>
  </section>`;
  const play = $(".intro-play", root) as HTMLButtonElement;
  play.addEventListener("click", () => nav.go("round", newRun("run", { firstEver: true })));
  play.focus({ preventScroll: true });
  return () => {};
}

export function mountHome(root: HTMLElement): () => void {
  const day = today();
  const daily = save.daily.results[day];
  const lens = LENSES.find((l) => l.id === save.activeLens)!;
  const n = uniqueCards();
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakAlive = save.daily.lastDay === day || save.daily.lastDay === yest;
  const flame = streakAlive ? save.daily.streak : 0;

  root.innerHTML = `<section class="screen home">
    <header class="home-head">
      <p class="kicker">A push-your-luck thought experiment</p>
      <h1 class="title"><span>Schrödinger's</span><span>Box</span></h1>
    </header>
    <div class="home-stage">
      <p class="fig-note" aria-hidden="true">fig. 1: one cat, probably</p>
      <div class="crate-wrap idle">${crateSVG()}<div class="crate-shadow"></div></div>
    </div>
    <div class="home-stats">
      <button class="stat" data-act="catdex"><b>${catdexPercent()}%</b><span>Catdex ${n}/${TOTAL_CARDS}</span></button>
      <div class="stat"><b>${fmt(save.highScore)}</b><span>High score</span></div>
      <div class="stat ${flame ? "is-hot" : ""}"><b><i class="flame">${ICON.flame}</i>${flame}</b><span>Daily streak</span></div>
    </div>
    <div class="lens-picker" role="radiogroup" aria-label="Interpretation">
      ${LENSES.map((l) => {
        const open = save.lensesUnlocked.includes(l.id);
        return `<button role="radio" aria-checked="${l.id === save.activeLens}" class="lens-opt ${open ? "" : "locked"}" data-lens="${l.id}" ${open ? "" : `aria-disabled="true"`}>
          <b>${l.short}</b><span>${open ? l.name : `${ICON.lock} ${l.unlockAt} cards`}</span></button>`;
      }).join("")}
    </div>
    <p class="lens-desc"><b>${lens.name}.</b> <span>${lens.twist}</span></p>
    ${save.box1935 ? `<button class="btn btn-ghost resume-1935" data-act="1935">A box sealed at ${new Date(save.box1935.sealedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} is still waiting →</button>` : ""}
    <div class="home-actions">
      <button class="btn btn-primary btn-xl" data-act="play">Play<small>9 lives</small></button>
      <button class="btn ${daily ? "is-done" : ""}" data-act="daily">${daily ? `Daily #${dailyNumber(day)} · ${daily.side === "alive" ? "Alive" : "Dead"}, ${TIER_LABEL[BY_ID[daily.card]?.tier ?? "common"]}` : `Daily Box #${dailyNumber(day)}`}</button>
    </div>
    <nav class="home-foot">
      <button data-act="about">About</button>
      <button data-act="achv">Badges ${save.achievements.length}/${ACHIEVEMENTS.length}</button>
      ${save.lensesUnlocked.includes("manyworlds") ? `<button data-act="multiverse">Multiverse</button>` : ""}
      <button data-act="settings">Settings</button>
    </nav>
  </section>`;

  const desc = $(".lens-desc", root);
  $$(".lens-opt", root).forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.lens as LensId;
      const l = LENSES.find((x) => x.id === id)!;
      if (!save.lensesUnlocked.includes(id)) {
        desc.innerHTML = `<b>${l.name}</b> unlocks at ${l.unlockAt} cards. <span>You have ${n}.</span>`;
        return;
      }
      save.activeLens = id;
      persist();
      $$(".lens-opt", root).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      desc.innerHTML = `<b>${l.name}.</b> <span>${l.twist}</span>`;
    }),
  );

  root.addEventListener("click", (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
    if (!act) return;
    if (act === "play") nav.go("round", newRun("run"));
    if (act === "daily") {
      if (daily) openDailyDone();
      else nav.go("round", newRun("daily", { seed: dailySeed(day) }));
    }
    if (act === "catdex") nav.go("catdex");
    if (act === "1935" && save.box1935) nav.go("round", newRun("1935", { seed: save.box1935.seed }));
    if (act === "about") openAbout();
    if (act === "achv") openAchievements();
    if (act === "multiverse") openMultiverse();
    if (act === "settings") openSettings();
  });

  return () => {};
}
