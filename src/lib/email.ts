/**
 * Thin wrapper around Resend's HTTP API — deliberately not the `resend`
 * SDK, since a single POST endpoint doesn't warrant a dependency.
 */
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

const FROM_ADDRESS = "Petya Speaks <orders@petyaspeaks.art>";

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }

  return response.json();
}
