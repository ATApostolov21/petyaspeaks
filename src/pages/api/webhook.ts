import type { APIRoute } from "astro";
import type Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { sendEmail } from "../../lib/email";
import { formatPrice } from "../../lib/sanity";

export const prerender = false;

const OWNER_EMAIL = "atanasapostolov237@gmail.com";

function formatAddress(address: Stripe.Address | null | undefined): string {
  if (!address) return "—";
  return [address.line1, address.line2, `${address.postal_code ?? ""} ${address.city ?? ""}`.trim(), address.country]
    .filter(Boolean)
    .join("<br/>");
}

/**
 * Fulfillment lives here, not on the success page — a customer can pay
 * successfully and never load the success page (lost connection, closed
 * tab), so any logic that only ran there would silently drop orders.
 *
 * Sends two emails via Resend: an internal notification (so someone
 * actually knows to ship the book) and a customer confirmation (the
 * success page promises one — this is what makes that true).
 */
async function fulfillOrder(session: Stripe.Checkout.Session) {
  const bookTitle = session.metadata?.bookTitle ?? "книга";
  const customerName = session.customer_details?.name ?? "—";
  const customerEmail = session.customer_details?.email;
  const customerPhone = session.customer_details?.phone ?? "—";
  const address = session.collected_information?.shipping_details?.address;
  const amount =
    session.amount_total != null ? formatPrice(session.amount_total / 100) : "—";

  console.log("Order fulfilled:", {
    sessionId: session.id,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress: address,
    amountTotal: session.amount_total,
    currency: session.currency,
  });

  const emails: Promise<unknown>[] = [
    sendEmail({
      to: OWNER_EMAIL,
      subject: `Нова поръчка — ${bookTitle}`,
      html: `
        <h2>Нова поръчка</h2>
        <p><strong>Книга:</strong> ${bookTitle}</p>
        <p><strong>Сума:</strong> ${amount}</p>
        <p><strong>Клиент:</strong> ${customerName}</p>
        <p><strong>Имейл:</strong> ${customerEmail ?? "—"}</p>
        <p><strong>Телефон:</strong> ${customerPhone}</p>
        <p><strong>Адрес за доставка:</strong><br/>${formatAddress(address)}</p>
      `,
      replyTo: customerEmail ?? undefined,
    }),
  ];

  if (customerEmail) {
    emails.push(
      sendEmail({
        to: customerEmail,
        subject: "Потвърждение на поръчката — Petya Speaks",
        html: `
          <p>Здравейте${customerName !== "—" ? " " + customerName : ""},</p>
          <p>Благодарим за поръчката на „${bookTitle}“! Плащането е получено успешно.</p>
          <p>Книгата ще бъде изпратена на адреса, който посочихте при поръчката.</p>
          <p>С благодарност,<br/>Петя</p>
        `,
      }),
    );
  }

  // Settle rather than all() — a failed customer email shouldn't stop the
  // owner notification from going out, and vice versa.
  const results = await Promise.allSettled(emails);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Order email failed to send:", result.reason);
    }
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
        // Awaited deliberately: a serverless function can be frozen the
        // instant it returns a response, which would truncate a
        // fire-and-forget email send mid-flight.
        await fulfillOrder(session);
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
