// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { projectId, dataset, apiVersion } from './sanity/env';

// https://astro.build/config
export default defineConfig({
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
