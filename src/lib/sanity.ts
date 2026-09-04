import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { PortableTextBlock } from "@portabletext/to-html";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export { sanityClient };

export type Category = "poem" | "essay" | "story";

export const categoryLabels: Record<Category, string> = {
  poem: "поезия",
  essay: "есе",
  story: "разказ",
};

export interface SanityImage {
  asset: { _ref: string; _type: "reference" };
  [key: string]: unknown;
}

export interface Author {
  name: string;
  tagline: string;
  profileImage?: SanityImage;
  bio?: PortableTextBlock[];
  instagramUrl?: string;
  facebookUrl?: string;
}

export interface Book {
  _id: string;
  title: string;
  slug: string;
  coverImage?: SanityImage;
  description: string;
  annotation?: PortableTextBlock[];
  excerpts?: string[];
  purchaseUrl?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  category: Category;
  publishedAt: string;
  excerpt: string;
  body?: PortableTextBlock[];
}

export interface PressItem {
  _id: string;
  mediaName: string;
  title: string;
  url: string;
  publishedAt: string;
  description?: string;
}

const bookProjection = `{
  _id,
  title,
  "slug": slug.current,
  coverImage,
  description,
  annotation,
  excerpts,
  purchaseUrl
}`;

const postProjection = `{
  _id,
  title,
  "slug": slug.current,
  category,
  publishedAt,
  excerpt,
  body
}`;

export async function getAuthor(): Promise<Author | null> {
  return sanityClient.fetch(
    `*[_type == "author"][0]{ name, tagline, profileImage, bio, instagramUrl, facebookUrl }`,
  );
}

export async function getBooks(): Promise<Book[]> {
  return sanityClient.fetch(
    `*[_type == "book"] | order(order asc) ${bookProjection}`,
  );
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  return sanityClient.fetch(
    `*[_type == "book" && slug.current == $slug][0] ${bookProjection}`,
    { slug },
  );
}

export async function getPosts(): Promise<Post[]> {
  return sanityClient.fetch(
    `*[_type == "post"] | order(publishedAt desc) ${postProjection}`,
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0] ${postProjection}`,
    { slug },
  );
}

export async function getPress(): Promise<PressItem[]> {
  return sanityClient.fetch(
    `*[_type == "press"] | order(publishedAt desc){ _id, mediaName, title, url, publishedAt, description }`,
  );
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("bg-BG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function readingTime(blocks: PortableTextBlock[] = []): number {
  const words = blocks
    .filter((block) => block._type === "block")
    .flatMap((block) =>
      ((block as { children?: { text?: string }[] }).children ?? []).map(
        (child) => child.text ?? "",
      ),
    )
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
