import "./styles.css";
import { onAchievement } from "./achievements";
import { initAnalytics } from "./analytics";
import { parseChallenge } from "./game";
import { applyMotion, applyTheme, initSound } from "./prefs";
import { nav, newRun, type RunState } from "./run";
import { mountCatdex } from "./screens/catdex";
import { mountHome, mountIntro } from "./screens/home";
import { mountRound } from "./screens/round";
import { mountSummary } from "./screens/summary";
import { save } from "./state";
import { $, bindButtonSounds, closeSheet, reducedMotion, toast } from "./ui";

const app = $("#app");
let cleanup: () => void = () => {};

function swap(screen: Parameters<typeof nav.go>[0], run?: RunState): void {
  cleanup();
  closeSheet(false);
  const host = document.createElement("div");
  host.className = `screen-host host-${screen}`;
  app.replaceChildren(host);
  window.scrollTo(0, 0);
  document.body.dataset.screen = screen;
  if (screen === "intro") cleanup = mountIntro(host);
  else if (screen === "home") cleanup = mountHome(host);
  else if (screen === "round" && run) cleanup = mountRound(host, run);
  else if (screen === "summary" && run) cleanup = mountSummary(host, run);
  else if (screen === "catdex") cleanup = mountCatdex(host);
  else cleanup = mountHome(host);
}

type VT = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };

nav.go = (screen, run) => {
  const vt = (document as Document & { startViewTransition?: (cb: () => void) => VT }).startViewTransition;
  if (!vt || reducedMotion() || document.hidden || !app.childElementCount) return swap(screen, run);
  const t = vt.call(document, () => swap(screen, run));
  // A skipped transition still runs the swap; its rejections are not errors.
  [t.ready, t.finished, t.updateCallbackDone].forEach((p) => p.catch(() => {}));
};

applyTheme();
applyMotion();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", applyMotion);
initSound();
initAnalytics();
bindButtonSounds();
onAchievement((a) => toast(`<b>Badge earned</b><span>${a.name}</span>`, "achv", 3200));

// Boot: a challenge link opens its box; a first visit gets the intro, everyone else the home screen.
const challenge = parseChallenge(location.hash);
if (challenge) {
  history.replaceState(null, "", location.pathname);
  nav.go("round", newRun("challenge", { seed: challenge.seed, challenge: { w: challenge.w, o: challenge.o } }));
} else if (save.runs === 0) {
  nav.go("intro");
} else {
  nav.go("home");
}

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
