import { defineConfig } from "vite";

// Social cards need absolute image URLs. Vercel exposes the production domain at build time.
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export default defineConfig({
  plugins: [
    {
      name: "absolute-og-image",
      transformIndexHtml: (html) => (site ? html.replaceAll('content="/og.png"', `content="https://${site}/og.png"`) : html),
    },
  ],
});
