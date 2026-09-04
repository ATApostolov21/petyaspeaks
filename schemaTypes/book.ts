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
      description: "2–3 кратки откъса от книгата.",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "purchaseUrl",
      title: "Връзка за поръчка",
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
