import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const badges = defineCollection({
  loader: glob({ pattern: "**\/[^_]*.md", base: "./src/content/badges/en" }),
  schema: z.object({
    slug:z.string(),
        title: z.string(),
        imgSrc:z.string(),
        description:z.string(),
        cardColor:z.string(),
        category:z.string(),
        date: z.date(),
        poweredBy: z.string(),
  }),
});
export const insignias = defineCollection({
  loader: glob({ pattern: "**\/[^_]*.md", base: "./src/content/badges/es" }),
  schema: z.object({
    slug:z.string(),
        title: z.string(),
        imgSrc:z.string(),
        description:z.string(),
        cardColor:z.string(),
        category:z.string(),
        date: z.date(),
        poweredBy: z.string(),
  }),
});
export default{
  badges,
  insignias
}