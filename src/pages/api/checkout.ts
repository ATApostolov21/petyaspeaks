import type { APIRoute } from "astro";
import { getBookBySlug, CHECKOUT_CURRENCY } from "../../lib/sanity";
import { stripe, CHECKOUT_INTEGRATION_IDENTIFIER } from "../../lib/stripe";

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  const formData = await request.formData();
  const slug = formData.get("slug");

  if (typeof slug !== "string") {
    return new Response("Missing slug", { status: 400 });
  }

  const book = await getBookBySlug(slug);
  if (!book || !book.price) {
    return new Response("Book not available for purchase", { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: CHECKOUT_CURRENCY,
          unit_amount: Math.round(book.price * 100),
          product_data: { name: book.title },
        },
        quantity: 1,
      },
    ],
    // Physical book — collect a mailing address. Bulgaria-only for now;
    // widen `allowed_countries` once international shipping is sorted out.
    shipping_address_collection: { allowed_countries: ["BG"] },
    // Couriers (Econt, Speedy, etc.) need a contact number to deliver.
    phone_number_collection: { enabled: true },
    // Managed Payments (Stripe-as-merchant-of-record, on by default on this
    // account) only supports digital goods and rejects shipping params —
    // this is a physical book, so we stay the merchant of record ourselves.
    managed_payments: { enabled: false },
    success_url: `${url.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url.origin}/books/${book.slug}`,
    integration_identifier: CHECKOUT_INTEGRATION_IDENTIFIER,
  });

  if (!session.url) {
    return new Response("Could not create checkout session", { status: 500 });
  }

  return Response.redirect(session.url, 303);
};
