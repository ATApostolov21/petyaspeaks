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
      useCdn: true,
      studioBasePath: '/studio',
    }),
  ],
});
