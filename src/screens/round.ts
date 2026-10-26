import { award } from "../achievements";
import { deadSlide, fanfare, geigerClick, glitch, haptic, lidPop, shimmer, softClick, stinger } from "../audio";
import { cardHTML, sideLabel } from "../card";
import { catSVG } from "../cats";
import { crateSVG } from "../crate";
import { challengeHash, createRound, dailyNumber, peekBand, resolve, type Result, type Round } from "../game";
import { LENS_BY_ID, LENSES } from "../lenses";
import { BY_ID } from "../outcomes";
import { MAX_HALF_LIVES, multiplier, pDead, streakBonus, TIER_LABEL, TIER_RANK } from "../physics";
import { createPlot, type Plot } from "../plot";
import { nav, type RunState } from "../run";
import { renderCardImage, shareImage, shareText, siteURL } from "../share";
import { collect, persist, save, today, uniqueCards } from "../state";
import { track } from "../analytics";
import { $, announce, esc, fmt, ICON, reducedMotion, sheetOpen, sleep, toast } from "../ui";

/** Dev-only time multiplier for testing (?speed=4). Always 1 in production. */
const SPEED = import.meta.env.DEV ? Number(new URLSearchParams(location.search).get("speed") ?? 1) || 1 : 1;

const NOTES: { at: number; text: string }[] = [
  { at: 0.5, text: "still nothing…" },
  { at: 1, text: "one half-life. coin flip." },
  { at: 1.5, text: "the multiplier likes this" },
  { at: 2, text: "75% decayed. bold." },
  { at: 2.5, text: "is it clicking faster?" },
  { at: 3, text: "87.5%. why are you like this" },
  { at: 3.5, text: "IT WILL OPEN ITSELF" },
];

export function livesHTML(lives: number): string {
  return `<div class="lives" role="img" aria-label="${lives} of 9 lives left">${Array.from({ length: 9 }, (_, i) => `<span class="paw ${i < lives ? "" : "lost"}">${ICON.paw}</span>`).join("")}</div>`;
}

function nearMiss(res: Result): string {
  const pct = (res.p * 100).toFixed(1);
  if (res.main.side === "dead") {
    if (res.auto === "cap") return `The box stopped waiting at ${pct}%. So should you.`;
    if (res.auto === "collapse") return `It collapsed on its own at ${pct}%. Nobody touched it.`;
    if (res.p >= 0.5) return `You got greedy at ${pct}% decay odds.`;
    if (res.p < 0.2) return `Only ${pct}% odds. The atom simply felt like it.`;
    return `Decayed at ${pct}% odds. Unlucky, but not that unlucky.`;
  }
  if (res.auto === "collapse") return `Self-collapsed at ${pct}%, and the cat made it. Multiplier frozen.`;
  if (res.x >= 3) return `Lived at ${pct}%. Absolutely unhinged.`;
  if (res.x >= 2) return `Lived at ${pct}%. Bold.`;
  if (res.x < 0.25) return `Opened at ${pct}%. Safe. Suspiciously safe.`;
  if (res.x > 0.75 && res.x < 1.15) return `Opened at ${pct}%, right around the best expected stop.`;
  return `Lived at ${pct}% decay odds.`;
}

export function mountRound(root: HTMLElement, run: RunState): () => void {
  let raf = 0;
  let disposed = false;
  let phase: "wait" | "collapsing" | "reveal" | "done" = "wait";
  let r: Round;
  let plot: Plot;
  let t0 = 0;
  let paused = 0;
  let hiddenAt: number | null = null;
  let lastFrame = 0;
  let lastAria = 0;
  let notesShown = 0;
  let skipLens: (() => void) | null = null;
  let els: Record<"sec" | "alive" | "dead" | "mult" | "pot" | "clock" | "odds" | "seam" | "shake", HTMLElement | null>;
  const rm = reducedMotion();

  const elapsed = () =>
    run.mode === "1935" && save.box1935
      ? (Date.now() - save.box1935.sealedAt) / 1000
      : (((hiddenAt ?? performance.now()) - t0 - paused) / 1000) * SPEED;

  const onVis = () => {
    if (document.hidden) hiddenAt = performance.now();
    else if (hiddenAt !== null) {
      paused += performance.now() - hiddenAt;
      hiddenAt = null;
      lastFrame = performance.now();
    }
  };
  document.addEventListener("visibilitychange", onVis);

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== " " && e.key !== "Enter") return;
    if (sheetOpen()) return;
    const tgt = e.target as HTMLElement;
    if (tgt.matches("input, textarea")) return;
    if (tgt.matches("button") && !tgt.matches(".open-btn, .next-btn")) return;
    e.preventDefault();
    if (e.repeat) return;
    if (phase === "wait") void doOpen(null);
    else if (phase === "reveal" && skipLens) skipLens();
    else if (phase === "done") ($(".next-btn") as HTMLButtonElement | null)?.click();
  };
  document.addEventListener("keydown", onKey);

  function startRound(): void {
    phase = "wait";
    document.body.style.setProperty("--heat", "0");
    notesShown = 0;
    const seed = run.mode === "run" ? undefined : run.seed;
    r = createRound(run.mode, save.activeLens, seed);
    const lens = LENS_BY_ID[r.lens];
    const isRun = run.mode === "run";
    const firstHint = run.firstEver && run.history.length === 0;
    const sealed = run.mode === "1935" && save.box1935 ? new Date(save.box1935.sealedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

    root.innerHTML = `<section class="screen round mode-${run.mode} ${rm ? "rm" : ""}" data-lens="${r.lens}">
      <div class="hud">
        ${isRun ? livesHTML(run.lives) : `<div class="mode-badge">${modeBadge(run)}</div>`}
        ${isRun ? `<div class="hud-score"><span class="hud-lbl">Score</span><b class="score-n">${fmt(run.score)}</b><span class="streak">${run.streak ? `streak ${run.streak} · ×${streakBonus(run.streak).toFixed(1)}` : "no streak yet"}</span></div>` : run.mode === "1935" ? `<div class="hud-score"><span class="hud-lbl">Sealed at ${sealed}</span><b class="clock">00:00:00</b></div>` : ""}
      </div>
      <div class="iso-row">
        <button class="iso-chip" aria-expanded="false" aria-controls="iso-fact"><span class="iso-sym">${r.iso.symbol}</span><span class="iso-name">${r.iso.name}</span><span class="iso-T">T = ${run.mode === "1935" ? "60 min" : r.T.toFixed(1) + " s"}</span></button>
        <span class="lens-chip" title="${esc(lens.twist)}">${lens.name}</span>
      </div>
      <p class="iso-fact" id="iso-fact">Real half-life: ${r.iso.realHalfLife}<span class="iso-more">. ${esc(r.iso.fact)}</span> <em>Time-compressed for your convenience.</em></p>
      ${run.challenge ? challengeBanner(run) : ""}
      <figure class="plot"></figure>
      <div class="stage">
        <div class="notes" aria-hidden="true"></div>
        <div class="rays" aria-hidden="true"></div>
        <div class="crate-wrap"><div class="crate-shake">${crateSVG()}</div><div class="crate-shadow"></div></div>
      </div>
      <div class="readout">
        <div class="odds-labels"><span>Alive <b class="alive-n">100.0%</b></span><span class="mult-x">×<b>1.00</b></span><span>Dead <b class="dead-n">0.0%</b></span></div>
        <div class="odds" role="meter" aria-label="Decay odds" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0% decay odds"><div class="odds-alive"></div><div class="odds-ticks"></div></div>
        <p class="mult-pot">${isRun ? `+<b>100</b> if alive` : run.mode === "1935" ? "One box. One real hour per half-life." : run.mode === "challenge" ? "The exact box your friend opened." : "One box. Same for everyone today."}</p>
      </div>
      ${r.lens === "qbism" ? `<label class="credence"><span>Your guess it's alive: <b class="cred-n">50%</b></span><input type="range" min="0" max="100" value="50" step="1" class="cred-in" aria-label="Your guess, in percent, that the cat is alive"></label>` : ""}
      ${r.lens === "pilotwave" ? `<button class="btn btn-ghost peek-btn" ${run.peekUsed ? "disabled" : ""}>${run.peekUsed ? "Peek used this run" : "Peek at the wave · once per run"}</button>` : ""}
      <div class="open-zone"><button class="open-btn" aria-describedby="open-help"><span>Open</span></button></div>
      <p class="hint" id="open-help">${firstHint ? "Wait. Then open. Don't get greedy." : "Space or Enter to open"}</p>
    </section>`;

    plot = createPlot($(".plot", root));
    const q = (sel: string) => root.querySelector<HTMLElement>(sel);
    els = { sec: q(".round"), alive: q(".alive-n"), dead: q(".dead-n"), mult: q(".mult-x b"), pot: q(".mult-pot b"), clock: q(".clock"), odds: q(".odds"), seam: q(".seam"), shake: q(".crate-shake") };
    const fact = $(".iso-fact", root);
    $(".iso-chip", root).addEventListener("click", (e) => {
      const open = fact.classList.toggle("is-expanded");
      (e.currentTarget as HTMLElement).setAttribute("aria-expanded", String(open));
    });
    $(".open-btn", root).addEventListener("click", () => void doOpen(null));
    const cred = root.querySelector<HTMLInputElement>(".cred-in");
    cred?.addEventListener("input", () => {
      r.credence = Number(cred.value) / 100;
      $(".cred-n", root).textContent = `${cred.value}%`;
    });
    root.querySelector(".peek-btn")?.addEventListener("click", (e) => {
      if (run.peekUsed || phase !== "wait") return;
      run.peekUsed = true;
      const b = peekBand(r);
      plot.peek(b.from, b.to);
      shimmer();
      award("peek");
      addNote("the wave leans this way…", true);
      const btn = e.currentTarget as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = "Peek used this run";
    });

    t0 = performance.now();
    paused = 0;
    hiddenAt = document.hidden ? t0 : null;
    lastFrame = t0;
    raf = requestAnimationFrame(frame);
    announce(`New box. ${r.iso.name}, half-life ${run.mode === "1935" ? "60 minutes" : r.T.toFixed(1) + " seconds"}.`);
  }

  function addNote(text: string, pinned = false): void {
    const notes = $(".notes", root);
    const i = notes.children.length;
    const el = document.createElement("p");
    el.className = `note note-${i % 2 ? "r" : "l"} ${pinned ? "note-pin" : ""}`;
    el.style.setProperty("--rot", `${(i % 2 ? 1 : -1) * (2 + (i * 7) % 5)}deg`);
    el.style.setProperty("--y", `${8 + ((i * 23) % 60)}%`);
    el.textContent = text;
    notes.append(el);
  }

  function frame(now: number): void {
    if (disposed || phase !== "wait") return;
    // Time only runs while the box is actually on screen: a stalled or throttled tab counts as paused.
    const gap = now - lastFrame;
    if (gap > 250 && hiddenAt === null) paused += gap - 16;
    const dt = Math.min(0.1, gap / 1000);
    lastFrame = now;
    const t = elapsed();
    const h = t / r.T;

    if (r.collapseAt !== null && t >= r.collapseAt && h < MAX_HALF_LIVES) {
      void selfCollapse();
      return;
    }
    if (h >= MAX_HALF_LIVES) {
      void doOpen("cap");
      return;
    }

    const p = pDead(t, r.T);
    const m = multiplier(t, r.T);
    plot.update(h);
    document.body.style.setProperty("--heat", p.toFixed(3));
    els.sec?.style.setProperty("--alive", ((1 - p) * 100).toFixed(2) + "%");
    if (els.alive) els.alive.textContent = ((1 - p) * 100).toFixed(1) + "%";
    if (els.dead) els.dead.textContent = (p * 100).toFixed(1) + "%";
    if (els.mult) els.mult.textContent = m.toFixed(2);
    if (run.mode === "run" && els.pot) {
      els.pot.textContent = fmt(Math.round(100 * m * streakBonus(run.streak) * (r.lens === "objective" ? 1.5 : 1)));
    }
    if (els.clock) {
      const s = Math.floor(t);
      els.clock.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, "0")).join(":");
    }
    if (now - lastAria > 1000 && els.odds) {
      lastAria = now;
      els.odds.setAttribute("aria-valuenow", (p * 100).toFixed(0));
      els.odds.setAttribute("aria-valuetext", `${(p * 100).toFixed(0)}% decay odds, multiplier ${m.toFixed(1)}`);
    }

    while (notesShown < NOTES.length && h >= NOTES[notesShown].at) addNote(NOTES[notesShown++].text);

    // Geiger crackle: click rate climbs with the odds (a tension effect, not a reading).
    const rate = 0.7 + 34 * p * p;
    if (Math.random() < rate * dt) {
      geigerClick();
      els.seam?.classList.remove("flick");
      void els.seam?.getBoundingClientRect();
      els.seam?.classList.add("flick");
    }

    if (!rm && els.shake) {
      const shake = els.shake;
      const ts = now / 1000;
      const amp = (h < 1 ? 0 : Math.pow((h - 1) / 3, 2) * 6) + (h > 3.5 ? ((h - 3.5) / 0.5) * 10 : 0);
      const jx = (Math.sin(ts * 53) + Math.sin(ts * 31.7)) * 0.5 * amp * (0.6 + Math.random() * 0.4);
      const jy = Math.sin(ts * 47.3) * amp * 0.35;
      const rot = Math.sin(ts * 41) * amp * 0.22;
      shake.style.transform = `translate(${jx.toFixed(2)}px, ${jy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
    }

    raf = requestAnimationFrame(frame);
  }

  async function selfCollapse(): Promise<void> {
    phase = "collapsing";
    softClick();
    haptic(10);
    plot.freeze((r.collapseAt ?? 0) / r.T);
    $(".stage", root).classList.add("is-collapsed");
    addNote("*click*", true);
    award("selfcollapse");
    announce("The box collapsed by itself.");
    await sleep(rm ? 300 : 900);
    if (disposed) return;
    phase = "wait";
    void doOpen("collapse");
  }

  function applyResult(res: Result): { isNew: boolean; otherNew: boolean; lensesUnlocked: string[] } {
    save.rounds++;
    const dead = res.main.side === "dead";
    run.history.push({ side: res.main.side, tier: res.main.tier, x: res.x });
    if (dead) {
      run.lives--;
      run.streak = 0;
    } else {
      run.streak++;
      run.bestStreak = Math.max(run.bestStreak, run.streak);
    }
    run.score += res.points;
    const isNew = collect(res.main.card.id);
    if (isNew) run.newCards.push(res.main.card.id);
    let otherNew = false;
    if (res.other) {
      otherNew = collect(res.other.card.id, true);
      if (otherNew) run.newCards.push(res.other.card.id);
      save.otherYou = [res.other.card.id, ...save.otherYou].slice(0, 60);
      save.multiverse.branches++;
      save.multiverse.log = [{ at: today(), followed: res.main.card.id, other: res.other.card.id, followedSide: res.main.side }, ...save.multiverse.log].slice(0, 200);
      award("twoworlds");
    }

    award("first");
    if (Math.abs(res.p - 0.5) < 0.0005) award("coinflip");
    if (res.x < 0.1 && !res.auto) award("quick");
    if (!dead && res.x >= 3) award("three");
    if (res.auto === "cap") award("ride");
    if (run.streak >= 5) award("streak5");
    if (run.streak >= 9) award("streak9");
    if (run.score >= 5000 && run.mode === "run") award("score5k");
    if (res.main.tier === "weird" || res.other?.tier === "weird") award("weird");
    if (res.main.tier === "legendary" || res.other?.tier === "legendary") award("legend");
    if (res.calibration !== null && res.calibration >= 45) award("calibrated");
    const n = uniqueCards();
    if (n >= 20) award("halfdex");
    if (n >= 40) award("fulldex");

    const lensesUnlocked: string[] = [];
    for (const l of LENSES) {
      if (n >= l.unlockAt && !save.lensesUnlocked.includes(l.id)) {
        save.lensesUnlocked.push(l.id);
        lensesUnlocked.push(l.name);
      }
    }

    if (run.mode === "daily") {
      const day = today();
      const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      save.daily.streak = save.daily.lastDay === y ? save.daily.streak + 1 : 1;
      save.daily.lastDay = day;
      save.daily.results[day] = { wait: res.x, side: res.main.side, card: res.main.card.id, tier: res.main.tier };
      if (save.daily.streak >= 3) award("daily3");
      track("daily_open", { side: res.main.side });
    }
    if (run.mode === "1935") {
      save.box1935 = null;
      award("y1935");
    }
    persist();
    track("round", { side: res.main.side, tier: res.main.tier, lens: r.lens, wait: Math.round(res.x * 10) / 10 });
    if (isNew || otherNew) track("card_new", { tier: res.main.tier, total: n });
    return { isNew, otherNew, lensesUnlocked };
  }

  async function doOpen(auto: Result["auto"]): Promise<void> {
    if (phase !== "wait") return;
    phase = "reveal";
    cancelAnimationFrame(raf);
    const t = auto === "collapse" && r.collapseAt !== null ? r.collapseAt : elapsed();
    const res = resolve(r, t, run.streak, auto);
    const dead = res.main.side === "dead";
    plot.freeze(res.x);
    plot.mark(res.x, `${dead ? "decayed" : "lived"} @ ${res.x.toFixed(2)}T`, dead);
    const info = applyResult(res);
    const cred = root.querySelector<HTMLInputElement>(".cred-in");
    if (cred) cred.disabled = true;
    ($(".open-btn", root) as HTMLButtonElement).disabled = true;

    // Beat 1: the lid bursts.
    const stage = $(".stage", root);
    stage.dataset.tier = res.main.tier;
    $(".crate-shake", root).style.transform = "";
    stage.classList.add("is-open");
    lidPop();
    haptic(18);
    await sleep(rm ? 150 : 520);
    if (disposed) return;

    // Beat 2: the lens shows how the collapse happened.
    const ov = $("#overlay");
    ov.innerHTML = `<div class="reveal ${rm ? "rm" : ""}" data-tier="${res.main.tier}" data-side="${res.main.side}" data-lens="${r.lens}">
      <div class="reveal-flash"></div>
      <div class="lens-stage" aria-hidden="true">${lensStageHTML(res, r)}</div>
      <div class="reveal-main"></div>
    </div>`;
    ov.classList.add("is-open");
    const rv = $(".reveal", ov);
    requestAnimationFrame(() => rv.classList.add("is-lens"));
    if (r.lens === "objective" && auto !== "collapse") softClick();
    await new Promise<void>((done) => {
      const tm = setTimeout(done, rm ? 600 : 1500);
      skipLens = () => {
        clearTimeout(tm);
        done();
      };
      rv.addEventListener("pointerdown", () => skipLens?.(), { once: true });
    });
    skipLens = null;
    if (disposed) return;

    // Beat 3: the card flips in.
    rv.classList.remove("is-lens");
    rv.classList.add("is-card");
    $(".reveal-main", rv).innerHTML = revealMainHTML(res, info);
    if (dead) deadSlide();
    else stinger(TIER_RANK[res.main.tier]);
    if (res.main.tier === "legendary" || res.other?.tier === "legendary") {
      glitch();
      if (!rm) {
        document.body.classList.add("glitching");
        setTimeout(() => document.body.classList.remove("glitching"), 3000);
      }
    }
    haptic(dead ? [40, 60, 40] : TIER_RANK[res.main.tier] >= 2 ? [20, 30, 20, 30, 60] : 25);
    if (info.lensesUnlocked.length) {
      setTimeout(() => {
        fanfare();
        info.lensesUnlocked.forEach((nm) => toast(`<b>New lens unlocked</b><span>${nm} is ready on the home screen.</span>`, "unlock", 4200));
      }, 900);
    }

    // HUD catches up.
    const hud = root.querySelector(".lives");
    if (hud && dead) {
      const paws = hud.querySelectorAll(".paw");
      paws[run.lives]?.classList.add("lost", "just-lost");
      hud.setAttribute("aria-label", `${run.lives} of 9 lives left`);
    }
    const sc = root.querySelector(".score-n");
    if (sc) countUp(sc as HTMLElement, run.score - res.points, run.score, 700);
    const pts = rv.querySelector(".pts-n");
    if (pts) countUp(pts as HTMLElement, 0, res.points, 650);

    announce(`${sideLabel(res.main.card, res.main.side)}. ${TIER_LABEL[res.main.tier]} card: ${res.main.card.name}. ${dead ? "You lost a life." : `Plus ${res.points} points.`}`);
    bindRevealActions(rv, res);
    phase = "done";
  }

  function bindRevealActions(rv: HTMLElement, res: Result): void {
    const next = $(".next-btn", rv) as HTMLButtonElement;
    setTimeout(() => next.focus({ preventScroll: true }), 50);
    next.addEventListener("click", () => {
      closeReveal();
      if (run.mode !== "run") nav.go("home");
      else if (run.lives <= 0) nav.go("summary", run);
      else startRound();
    });
    rv.querySelector(".share-card")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      btn.disabled = true;
      const blob = await renderCardImage(res.main.card, { lens: LENS_BY_ID[r.lens].name, wait: res.x, side: sideLabel(res.main.card, res.main.side) });
      btn.disabled = false;
      if (!blob) return toast("Couldn't draw the card on this browser.");
      const outc = await shareImage(blob, `schrodingers-box-${res.main.card.id}.png`, `${res.main.card.name} · ${TIER_LABEL[res.main.tier]}`);
      if (outc === "downloaded") toast("Card saved as an image.");
    });
    rv.querySelector(".share-text")?.addEventListener("click", async () => {
      const outc = await shareText(shareLine(res), run.mode === "daily" ? siteURL() : siteURL() + challengeHash(r.seed, res), run.mode);
      if (outc === "copied") toast("Copied. Paste it anywhere.");
    });
    rv.querySelector(".share-challenge")?.addEventListener("click", async () => {
      const line = `I opened this box at ${res.x.toFixed(2)} half-lives and the cat ${res.main.side === "alive" ? "lived" : "did not"}. Your turn.`;
      const outc = await shareText(line, siteURL() + challengeHash(r.seed, res), "challenge");
      if (outc === "copied") toast("Challenge link copied.");
    });
  }

  function shareLine(res: Result): string {
    const tier = TIER_LABEL[res.main.tier];
    const side = res.main.side === "alive" ? "Alive" : "Dead";
    if (run.mode === "daily") return `Schrödinger's Box #${dailyNumber(today())} · waited ${res.x.toFixed(2)} half-lives · ${side} · ${tier}`;
    return `Schrödinger's Box · waited ${res.x.toFixed(2)} half-lives · ${side} · ${tier}`;
  }

  function revealMainHTML(res: Result, info: { isNew: boolean; otherNew: boolean }): string {
    const dead = res.main.side === "dead";
    const lens = LENS_BY_ID[r.lens];
    const lensMult = r.lens === "objective" ? " · lens ×1.5" : "";
    const streakTxt = !dead && res.points ? ` · streak ×${streakBonus(run.streak - 1).toFixed(1)}` : "";
    let score = "";
    if (run.mode === "run") {
      score = dead
        ? `<div class="pts pts-dead"><span class="lost-paw">${ICON.paw}</span><b>−1 life</b><small>${run.lives} left · you keep the card</small></div>`
        : `<div class="pts"><b>+<span class="pts-n">0</span></b><small>×${res.mult.toFixed(2)}${streakTxt}${lensMult}</small></div>`;
      if (res.calibration !== null) score += `<p class="calib">Calibration ${res.calibration >= 0 ? "+" : ""}${res.calibration} · you guessed ${Math.round(r.credence * 100)}% alive</p>`;
    }
    let challenge = "";
    if (run.challenge && run.challenge.w !== null) {
      const theirs = run.challenge.w;
      const they = run.challenge.o === "alive" ? "lived" : "didn't";
      const won = !dead && (run.challenge.o !== "alive" || res.x > theirs);
      challenge = `<p class="vs ${won ? "won" : ""}">Your friend waited ${theirs.toFixed(2)}T and the cat ${they}. You waited ${res.x.toFixed(2)}T. <b>${won ? "You win." : "They win."}</b></p>`;
    }
    const other = res.other
      ? `<div class="other-you"><span class="ou-lbl">Meanwhile, in the other branch, Other You got</span>${cardHTML(res.other.card, { side: res.other.side, isNew: info.otherNew, cls: "card-mini" })}</div>`
      : "";
    const primary = run.mode !== "run" ? "Done" : run.lives <= 0 ? "Read the lab report" : "Next box";
    const secondary =
      run.mode === "run"
        ? `<button class="btn btn-ghost share-card">Save card</button><button class="btn btn-ghost share-challenge">Challenge a friend</button>`
        : `<button class="btn btn-ghost share-text">Share result</button><button class="btn btn-ghost share-card">Save card</button>`;
    return `<div class="card-slot">${cardHTML(res.main.card, { side: res.main.side, isNew: info.isNew, cls: "card-hero" })}</div>
      <div class="reveal-info">
        ${score}
        <p class="nearmiss">${nearMiss(res)}</p>
        ${challenge}
        <p class="caption"><b>${lens.name}.</b> ${lens.caption}</p>
        ${other}
        <div class="reveal-actions"><button class="btn btn-primary next-btn">${primary}<kbd>⏎</kbd></button>${secondary}</div>
      </div>`;
  }

  startRound();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    document.body.style.setProperty("--heat", "0");
    document.removeEventListener("visibilitychange", onVis);
    document.removeEventListener("keydown", onKey);
    closeReveal();
  };
}

export function closeReveal(): void {
  const ov = $("#overlay");
  ov.classList.remove("is-open");
  ov.innerHTML = "";
}

function modeBadge(run: RunState): string {
  if (run.mode === "daily") return `Daily Box <b>#${dailyNumber(today())}</b>`;
  if (run.mode === "challenge") return `Challenge box <b>${esc(run.seed ?? "")}</b>`;
  return `1935 Mode`;
}

function challengeBanner(run: RunState): string {
  const c = run.challenge!;
  if (c.w === null) return `<p class="challenge-banner">A friend sent you this exact box.</p>`;
  return `<p class="challenge-banner">A friend opened this exact box at <b>${c.w.toFixed(2)}T</b> and the cat <b>${c.o === "alive" ? "lived" : "didn't"}</b>. Beat them.</p>`;
}

function countUp(el: HTMLElement, from: number, to: number, ms: number): void {
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Lens reveal stages: each one shows the same collapse through a different story. */
export function lensStageHTML(res: Result, r: Round): string {
  const alive = res.main.side === "alive" ? res.main.card : BY_ID.alive_glare;
  const dead = res.main.side === "dead" ? res.main.card : BY_ID.dead_ghost;
  switch (r.lens) {
    case "copenhagen":
      return `<div class="ls-cph"><div class="ls-ghost ls-a">${catSVG(alive.cat)}</div><div class="ls-ghost ls-b">${catSVG(dead.cat)}</div><p class="ls-cap">|alive⟩ + |dead⟩</p></div>`;
    case "manyworlds": {
      const o = res.other!;
      const left = res.main.side === "alive" ? res.main : o;
      const right = res.main.side === "alive" ? o : res.main;
      const follow = res.main.side === "alive" ? "l" : "r";
      return `<div class="ls-mwi follow-${follow}"><div class="ls-branch ls-l"><span>branch A</span>${catSVG(left.card.cat)}<b>${left.side}</b></div><div class="ls-tear"></div><div class="ls-branch ls-r"><span>branch B</span>${catSVG(right.card.cat)}<b>${right.side}</b></div><p class="ls-cap">you follow branch ${follow === "l" ? "A" : "B"}</p></div>`;
    }
    case "pilotwave":
      return `<div class="ls-pw"><svg viewBox="0 0 300 300" aria-hidden="true">${[30, 60, 90, 120, 150, 180].map((rr, i) => `<circle cx="150" cy="290" r="${rr}" style="--i:${i}"/>`).join("")}<path class="ls-path" d="M150,290 C110,240 190,200 150,150 S110,70 150,40"/><circle class="ls-dot" cx="150" cy="40" r="7"/></svg><p class="ls-cap">it was ${res.main.side} all along</p></div>`;
    case "objective":
      return `<div class="ls-grw"><div class="ls-iris"></div><p class="ls-cap">${res.auto === "collapse" ? "collapsed. spontaneously." : "collapsed."}</p></div>`;
    case "qbism": {
      const c = Math.round(r.credence * 100);
      return `<div class="ls-qb" style="--from:${c}%;--to:${res.main.side === "alive" ? 100 : 0}%"><p class="ls-q1">you guessed <b>${c}%</b> alive</p><div class="ls-bar"><div class="ls-fill"></div></div><p class="ls-q2">updated: <b>${res.main.side}</b></p></div>`;
    }
  }
}
