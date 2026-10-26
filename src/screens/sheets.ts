import { ACHIEVEMENTS } from "../achievements";
import { setSoundEnabled } from "../audio";
import { cardHTML } from "../card";
import { catSVG } from "../cats";
import { dailyNumber } from "../game";
import { BY_ID } from "../outcomes";
import { TIER_LABEL } from "../physics";
import { nav, newRun } from "../run";
import { shareText, siteURL } from "../share";
import { exportCode, freshSave, importCode, persist, replaceSave, save, today } from "../state";
import { newSeedCode } from "../rng";
import { $, $$, closeSheet, esc, openSheet, toast } from "../ui";
import { applyMotion, applyTheme, syncSoundButton } from "../prefs";

export function openAbout(): void {
  openSheet(
    "About this box",
    `<div class="prose">
      <p>Schrödinger proposed the cat in <button class="year-egg" aria-label="1935">1935</button> as a thought experiment, to show how strange it is to apply quantum rules to everyday things. No real cat was ever in a box, and none was harmed making this game.</p>
      <h3>The one real thing in here</h3>
      <p>Radioactive decay is exact: after waiting <i>t</i> with half-life <i>T</i>, the chance the atom has decayed is <span class="eq">1 − 2<sup>−t/T</sup></span>. Your score multiplier grows in a straight line while survival falls exponentially, so the best expected stop sits just under one half-life. Greed loses on average. That's the game.</p>
      <h3>Honesty notes</h3>
      <ul>
        <li>The point of the thought experiment is the <b>measurement problem</b>: the quantum description holds both alternatives, while opening shows one. It's not just "we don't know what happened."</li>
        <li>In the real world, interactions with the environment (<b>decoherence</b>) stop a cat-sized superposition from being observable. The game ignores this for fun.</li>
        <li>The five lenses are interpretations, and physicists still argue about them. The game never says which is correct.</li>
        <li>The rising Geiger crackle is a tension effect, not a detector reading. Isotope half-lives are real but time-compressed.</li>
      </ul>
      <p class="fine">No accounts or ads. Your progress stays on this device, and visits are counted without cookies.</p>
    </div>`,
    {
      onMount: (s) => {
        let taps = 0;
        $(".year-egg", s).addEventListener("click", () => {
          taps++;
          if (taps < 3) return;
          open1935();
        });
      },
    },
  );
}

function open1935(): void {
  if (save.box1935) {
    closeSheet();
    nav.go("round", newRun("1935", { seed: save.box1935.seed }));
    return;
  }
  openSheet(
    "1935 Mode",
    `<div class="prose"><p>One box. One <b>real</b> hour per half-life, so the odds reach 50% at the 60-minute mark, matching the hour in Schrödinger's original setup.</p>
    <p>The box keeps time even if you close the tab. It opens itself after four hours.</p>
    <button class="btn btn-primary seal">Seal the box</button></div>`,
    {
      onMount: (s) =>
        $(".seal", s).addEventListener("click", () => {
          save.box1935 = { sealedAt: Date.now(), seed: "y1935-" + newSeedCode() };
          persist();
          closeSheet();
          nav.go("round", newRun("1935", { seed: save.box1935.seed }));
        }),
    },
  );
}

export function openSettings(): void {
  const s = save.settings;
  openSheet(
    "Settings",
    `<div class="settings">
      <label class="row"><span>Sound</span><input type="checkbox" class="sw" data-k="sound" ${s.sound !== false ? "checked" : ""}></label>
      <label class="row"><span>Reduce motion</span><select data-k="motion"><option value="auto" ${s.reducedMotion === null ? "selected" : ""}>Follow system</option><option value="on" ${s.reducedMotion === true ? "selected" : ""}>On</option><option value="off" ${s.reducedMotion === false ? "selected" : ""}>Off</option></select></label>
      <label class="row"><span>Theme</span><select data-k="theme"><option value="light" ${s.theme === "light" ? "selected" : ""}>Notebook</option><option value="dark" ${s.theme === "dark" ? "selected" : ""}>Chalkboard</option></select></label>
      <h3>Save code</h3>
      <p class="fine">Progress lives in this browser. Copy the code to move it, or paste one to restore.</p>
      <div class="save-io"><button class="btn btn-ghost do-export">Copy save code</button></div>
      <textarea class="code-in" rows="3" placeholder="Paste a save code" aria-label="Save code"></textarea>
      <div class="save-io"><button class="btn btn-ghost do-import">Restore from code</button><button class="btn btn-danger do-reset">Erase progress</button></div>
    </div>`,
    {
      onMount: (root) => {
        $<HTMLInputElement>("[data-k=sound]", root).addEventListener("change", (e) => {
          s.sound = (e.target as HTMLInputElement).checked;
          setSoundEnabled(s.sound);
          syncSoundButton();
          persist();
        });
        $<HTMLSelectElement>("[data-k=motion]", root).addEventListener("change", (e) => {
          const v = (e.target as HTMLSelectElement).value;
          s.reducedMotion = v === "auto" ? null : v === "on";
          applyMotion();
          persist();
        });
        $<HTMLSelectElement>("[data-k=theme]", root).addEventListener("change", (e) => {
          s.theme = (e.target as HTMLSelectElement).value as typeof s.theme;
          applyTheme();
          persist();
        });
        $(".do-export", root).addEventListener("click", async () => {
          const code = await exportCode();
          try {
            await navigator.clipboard.writeText(code);
            toast("Save code copied.");
          } catch {
            $<HTMLTextAreaElement>(".code-in", root).value = code;
            toast("Copy the code from the box below.");
          }
        });
        $(".do-import", root).addEventListener("click", async () => {
          const ok = await importCode($<HTMLTextAreaElement>(".code-in", root).value);
          toast(ok ? "Progress restored." : "That code didn't work.");
          if (ok) {
            closeSheet();
            nav.go("home");
          }
        });
        $(".do-reset", root).addEventListener("click", (e) => {
          const b = e.currentTarget as HTMLButtonElement;
          if (b.dataset.armed !== "1") {
            b.dataset.armed = "1";
            b.textContent = "Tap again to erase everything";
            return;
          }
          replaceSave(freshSave());
          closeSheet();
          toast("Progress erased. Fresh box.");
          nav.go("home");
        });
      },
    },
  );
}

export function openAchievements(): void {
  openSheet(
    `Badges · ${save.achievements.length}/${ACHIEVEMENTS.length}`,
    `<ul class="achv-list">${ACHIEVEMENTS.map((a) => {
      const got = save.achievements.includes(a.id);
      return `<li class="${got ? "got" : ""}"><span class="achv-seal" aria-hidden="true">${got ? "✓" : "?"}</span><div><b>${a.name}</b><span>${a.desc}</span></div><span class="sr-only">${got ? "earned" : "not earned"}</span></li>`;
    }).join("")}</ul>`,
  );
}

/** Your Multiverse: every Many-Worlds split grows a branch on the tree. */
export function openMultiverse(): void {
  const log = save.multiverse.log.slice(0, 40).reverse();
  if (!log.length) {
    openSheet("Your Multiverse", `<p class="dex-empty">No splits yet. Open a box with the Many-Worlds lens and the tree starts growing.</p>`);
    return;
  }
  const step = 54;
  const H = log.length * step + 60;
  const W = 320;
  let x = W / 2;
  let d = `M${x},${H - 10}`;
  const twigs: string[] = [];
  log.forEach((b, i) => {
    const y = H - 30 - i * step;
    const nx = W / 2 + Math.sin(i * 1.3) * 40;
    d += ` Q${x},${y + step / 2} ${nx},${y}`;
    x = nx;
    const dir = i % 2 ? 1 : -1;
    const ox = x + dir * 92;
    const oy = y - 20;
    const o = BY_ID[b.other];
    const f = BY_ID[b.followed];
    twigs.push(
      `<path d="M${x},${y} Q${x + dir * 40},${y} ${ox},${oy}" class="mv-twig"/>` +
        (o ? `<g transform="translate(${ox - 22} ${oy - 44})" class="mv-leaf"><title>Other You: ${esc(o.name)}</title>${catSVG(o.cat).replace("<svg ", '<svg width="44" height="44" ')}</g>` : "") +
        (f ? `<g transform="translate(${x - dir * 66 - 17} ${y - 34})" class="mv-you"><title>You: ${esc(f.name)}</title>${catSVG(f.cat).replace("<svg ", '<svg width="34" height="34" ')}</g>` : "") +
        `<circle cx="${x}" cy="${y}" r="4" class="mv-node"/>`,
    );
  });
  openSheet(
    `Your Multiverse · ${save.multiverse.branches} splits`,
    `<p class="fine">The trunk is you. Each twig is a branch where the other outcome happened, and the cat Other You found there.</p>
    <svg class="mv-tree" viewBox="0 0 ${W} ${H}" role="img" aria-label="Branching tree of ${log.length} splits"><path d="${d}" class="mv-trunk"/>${twigs.join("")}</svg>`,
    { wide: true },
  );
}

export function openDailyDone(): void {
  const day = today();
  const r = save.daily.results[day];
  if (!r) return;
  const o = BY_ID[r.card];
  const line = `Schrödinger's Box #${dailyNumber(day)} · waited ${r.wait.toFixed(2)} half-lives · ${r.side === "alive" ? "Alive" : "Dead"} · ${TIER_LABEL[o.tier]}`;
  openSheet(
    `Daily Box #${dailyNumber(day)}`,
    `<div class="dex-detail">${cardHTML(o, { side: r.side, cls: "card-hero card-static" })}
    <p class="detail-meta">You waited ${r.wait.toFixed(2)} half-lives. Everyone opened this same box today. A new one arrives tomorrow.</p>
    <button class="btn btn-primary share-daily">Share result</button></div>`,
    {
      onMount: (s) =>
        $(".share-daily", s).addEventListener("click", async () => {
          if ((await shareText(line, siteURL(), "daily")) === "copied") toast("Copied. Paste it anywhere.");
        }),
    },
  );
  $$(".sheet .card").forEach((c) => c.classList.add("is-flipped"));
}
