import type { APIRoute } from "astro";
import type Stripe from "stripe";
import { stripe } from "../../lib/stripe";

export const prerender = false;

/**
 * Fulfillment lives here, not on the success page — a customer can pay
 * successfully and never load the success page (lost connection, closed
 * tab), so any logic that only ran there would silently drop orders.
 *
 * This currently only logs the order. There's no email or database layer
 * in this repo yet, so nothing actually notifies anyone of a sale — wiring
 * that up (e.g. an email via Resend, or an order record in Sanity) is a
 * required follow-up before this goes live, not an optional nice-to-have.
 */
function fulfillOrder(session: Stripe.Checkout.Session) {
  console.log("Order to fulfill:", {
    sessionId: session.id,
    customerEmail: session.customer_details?.email,
    shippingAddress: session.collected_information?.shipping_details?.address,
    amountTotal: session.amount_total,
    currency: session.currency,
  });
}

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status !== "unpaid") {
        fulfillOrder(session);
      }
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      console.log("Payment failed for session:", session.id);
      break;
    }
  }

  return new Response(null, { status: 200 });
};
