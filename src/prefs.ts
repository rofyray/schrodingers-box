import { setSoundEnabled, unlockAudio } from "./audio";
import { persist, save } from "./state";
import { $, ICON, reducedMotion } from "./ui";

export function applyMotion(): void {
  document.documentElement.classList.toggle("rm", reducedMotion());
}

export function applyTheme(): void {
  const t = save.settings.theme;
  if (t === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = t;
  const dark = t === "dark" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#1D2823" : "#F2EAD6");
}

const soundOn = () => save.settings.sound !== false;

export function syncSoundButton(): void {
  const b = $("#mute");
  const on = soundOn();
  b.innerHTML = on ? ICON.soundOn : ICON.soundOff;
  b.setAttribute("aria-pressed", String(!on));
  b.setAttribute("aria-label", on ? "Mute sound" : "Unmute sound");
}

/** Sound stays silent until the first tap (autoplay rules), then follows the saved setting. */
export function initSound(): void {
  syncSoundButton();
  const first = () => {
    unlockAudio();
    setSoundEnabled(soundOn());
  };
  window.addEventListener("pointerdown", first, { once: true, capture: true });
  window.addEventListener("keydown", first, { once: true, capture: true });
  $("#mute").addEventListener("click", () => {
    unlockAudio();
    save.settings.sound = !soundOn();
    setSoundEnabled(save.settings.sound);
    syncSoundButton();
    persist();
  });
}
