/**
 * Shared Sanity project constants. Read by both astro.config.mjs (Astro/Vite)
 * and sanity.config.ts (Sanity CLI) — a plain module sidesteps the two
 * tools' different env-var prefix conventions (PUBLIC_ vs SANITY_STUDIO_).
 *
 * The project ID is not secret — it's a public identifier, safe to commit.
 */
export const projectId = "b5k2orgo";
export const dataset = "production";
export const apiVersion = "2025-01-01";
