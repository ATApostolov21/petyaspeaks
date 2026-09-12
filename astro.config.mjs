// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import vercel from '@astrojs/vercel';
import { projectId, dataset, apiVersion } from './sanity/env';

// https://astro.build/config
export default defineConfig({
  // Stays static by default — only routes that opt out with
  // `export const prerender = false` (the Stripe checkout/webhook
  // endpoints) render on demand. Every existing page is unaffected.
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    sanity({
      projectId,
      dataset,
      apiVersion,
      // Every query here runs once, at build time — not per visitor — so
      // there's no caching benefit, only staleness risk right after a
      // publish races the webhook-triggered rebuild. Always read fresh.
      useCdn: false,
      studioBasePath: '/studio',
    }),
  ],
});
