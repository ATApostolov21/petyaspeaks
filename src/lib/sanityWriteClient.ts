import { createClient } from "@sanity/client";
import { projectId, dataset, apiVersion } from "../../sanity/env";

/**
 * Server-only, token-authenticated client for writes (e.g. the order
 * record created by the Stripe webhook). Separate from the read-only
 * `sanity:client` virtual module used everywhere else, which has no
 * write access and is meant for build-time content fetching.
 */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: import.meta.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});
