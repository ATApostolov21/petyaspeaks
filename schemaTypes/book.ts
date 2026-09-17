import { defineField, defineType } from "sanity";

export default defineType({
  name: "book",
  title: "Книга",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Заглавие",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Корица",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Кратко описание",
      description: "Показва се на началната страница и в списъка с книги.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "annotation",
      title: "Пълна анотация",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "excerpts",
      title: "Откъси",
      description: "2–3 кратки откъса от книгата — за проза или за стихотворение.",
      type: "array",
      of: [
        {
          type: "object",
          name: "excerpt",
          fields: [
            defineField({
              name: "title",
              title: "Заглавие (незадължително)",
              description: "Напр. заглавието на стихотворението.",
              type: "string",
            }),
            defineField({
              name: "text",
              title: "Текст",
              description: "За стихотворение — всеки нов ред тук се пренася на нов ред на сайта.",
              type: "text",
              rows: 6,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "text" },
          },
        },
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "price",
      title: "Цена (€)",
      description: "Задайте цена, за да се появи бутон за поръчка директно на сайта чрез Stripe.",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "purchaseUrl",
      title: "Връзка за поръчка (резервна)",
      description: "Използва се само ако няма зададена цена по-горе.",
      type: "url",
    }),
    defineField({
      name: "order",
      title: "Ред на показване",
      description: "По-малко число се показва по-напред в списъка.",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Ред на показване",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", media: "coverImage" },
  },
});
