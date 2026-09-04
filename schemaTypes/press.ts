import { defineField, defineType } from "sanity";

export default defineType({
  name: "press",
  title: "Публикация за авторката",
  type: "document",
  fields: [
    defineField({
      name: "mediaName",
      title: "Медия / издание",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Заглавие на статията",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Връзка",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Дата",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Кратко описание",
      type: "text",
      rows: 2,
    }),
  ],
  orderings: [
    {
      title: "Дата, най-новите отгоре",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "mediaName" },
  },
});
