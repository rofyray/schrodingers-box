# Schrödinger's Box

A push-your-luck web game. Watch a sealed box while the decay odds climb, pick your moment to open it, and collapse the cat into one of 40 collectible outcomes, revealed through the quantum interpretation you chose.

Vite + vanilla TypeScript, no framework, no backend. About 45 KB gzipped plus Google Fonts.

## Run

```bash
npm install
npm run dev
```

In development, `?speed=6` runs game time six times faster. Production builds ignore it.

## Deploy

Deploys to Vercel as a Vite project; `vercel.json` sets the build, output and cache headers. The build fills absolute `og:image` URLs from `VERCEL_PROJECT_PRODUCTION_URL` so link previews work on X. Enable Web Analytics in the Vercel project for visitor counts.

## Where things live

| Path | What |
| --- | --- |
| `src/physics.ts` | Decay odds, multiplier, isotopes, rarity roll |
| `src/game.ts` | Round creation (seeded), resolution, challenge links, Daily numbering |
| `src/outcomes.ts` | The 40 cards. Adding a cat is one line. |
| `src/cats.ts` | SVG part system: bodies, ears, eyes, mouths, accessories, scenes |
| `src/lenses.ts` | The five interpretations: twists, captions, unlock thresholds |
| `src/screens/round.ts` | Round loop, tension effects, reveal sequence, lens animations |
| `src/state.ts` | `localStorage` save (`sbox.v1`), export/import save codes |
| `src/audio.ts` | Web Audio synthesis: Geiger clicks, stingers, glitch |
| `src/share.ts` | Text share, canvas PNG share card |
