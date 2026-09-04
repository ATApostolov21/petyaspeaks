import { defineField, defineType } from "sanity";

export default defineType({
  name: "author",
  title: "Авторка",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Име",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Кратко мото / цитат",
      description: "Показва се на началната страница, в 'За мен' и във футъра.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "profileImage",
      title: "Профилна снимка",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Биография",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram връзка",
      type: "url",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook връзка",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "tagline", media: "profileImage" },
  },
});
