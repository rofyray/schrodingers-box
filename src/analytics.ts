// Vercel Web Analytics: cookieless. Page views and visitor counts work on every plan;
// custom events (rounds, runs, shares) show up in the dashboard on Pro.
import { inject, track as vercelTrack } from "@vercel/analytics";

export function initAnalytics(): void {
  if (import.meta.env.PROD) inject({ mode: "production" });
}

export function track(event: string, data?: Record<string, string | number | boolean>): void {
  if (!import.meta.env.PROD) return;
  try {
    vercelTrack(event, data);
  } catch {
    /* analytics must never break the game */
  }
}
