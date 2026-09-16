import { defineField, defineType } from "sanity";

/**
 * Written server-side by the Stripe webhook (src/pages/api/webhook.ts),
 * not something an editor creates by hand — a durable record of each sale
 * that survives even if the notification email gets lost or marked spam.
 * Factual fields are marked readOnly since they're a snapshot of what was
 * actually ordered/paid; `status` is the one field meant to be edited, to
 * track fulfillment.
 */
export default defineType({
  name: "order",
  title: "Поръчка",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Статус",
      type: "string",
      options: {
        list: [
          { title: "Нова", value: "new" },
          { title: "Изпратена", value: "shipped" },
          { title: "Отказана", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "new",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bookTitle",
      title: "Книга",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "quantity",
      title: "Брой",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "amountTotal",
      title: "Сума",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "currency",
      title: "Валута",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "customerName",
      title: "Име на клиента",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "customerEmail",
      title: "Имейл на клиента",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "customerPhone",
      title: "Телефон на клиента",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "shippingAddress",
      title: "Адрес за доставка",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "line1", title: "Адрес", type: "string" }),
        defineField({ name: "line2", title: "Адрес (2)", type: "string" }),
        defineField({ name: "city", title: "Град", type: "string" }),
        defineField({ name: "postalCode", title: "Пощ. код", type: "string" }),
        defineField({ name: "country", title: "Държава", type: "string" }),
      ],
    }),
    defineField({
      name: "stripeSessionId",
      title: "Stripe Session ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "createdAt",
      title: "Дата на поръчката",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Дата, най-новите отгоре",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "customerName",
      subtitle: "bookTitle",
      status: "status",
    },
    prepare({ title, subtitle, status }) {
      const statusLabel =
        status === "shipped" ? "✓ Изпратена" : status === "cancelled" ? "✕ Отказана" : "● Нова";
      return {
        title: `${title} — ${subtitle}`,
        subtitle: statusLabel,
      };
    },
  },
});
