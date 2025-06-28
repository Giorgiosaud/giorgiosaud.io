import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const equipo = defineCollection({
  loader: glob({ base: "src/content/team/es", pattern: "*.(md|mdx)" }),
  schema: z.object({
    draft: z.boolean(),
    alias: z.string(),
    name: z.string(),
    title: z.string(),
    resume: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
  }),
});

export const team = defineCollection({
  loader: glob({ base: "src/content/team/en", pattern: "*.(md|mdx)" }),
  schema: z.object({
    draft: z.boolean(),
    alias: z.string(),
    name: z.string(),
    title: z.string(),
    resume: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
  }),
});
export default {
  team,
  equipo
}