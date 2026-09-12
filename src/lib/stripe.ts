import Stripe from "stripe";

export const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

/**
 * Tracks this specific Checkout flow in the Stripe Dashboard, separate from
 * any other Checkout integration on the account. Required on API versions
 * 2026-03-25.dahlia and later.
 */
export const CHECKOUT_INTEGRATION_IDENTIFIER = "petyaspeaks_book_checkout_qwneprst";
