// 1. Import utilities from `astro:content`
import { z, defineCollection, reference } from "astro:content";

// 2. Define your collection(s)
const notesCollection = defineCollection({
  schema: z.object({
    draft: z.boolean({
      required_error: "draft is required",
    }),
    title: z.string(),
    resume: z.string(),
    selfHealing: z.string().length(6),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
    author: reference("team"),
    category: z.string(),
    tags: z.array(z.string()),
  }),
});

const notasCollection = defineCollection({
  schema: z.object({
    draft: z.boolean({
      required_error: "draft is required",
    }),
    title: z.string(),
    resume: z.string(),
    selfHealing: z.string().length(6),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
    author: reference("equipo"),
    category: z.string(),
    tags: z.array(z.string()),
  }),
});

const equipoCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    alias: z.string(),
    name: z.string(),
    title: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
  }),
});

const teamCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    alias: z.string(),
    name: z.string(),
    title: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
  }),
});

const portfolioCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    client: z.string(),
    country: z.string(),
    category: z.string(),
    selfHealing: z.string().length(6),
    workingOn: z.string(),
    project: z.string(),
    resume: z.string(),
    classes: z.string().optional(),
    classesClient: z.string().optional(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
    technologies: z.array(z.string()),
  }),
});
const portafolioCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    client: z.string(),
    country: z.string(),
    category: z.string(),
    selfHealing: z.string().length(6),
    workingOn: z.string(),
    project: z.string(),
    resume: z.string(),
    classes: z.string().optional(),
    classesClient: z.string().optional(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
    technologies: z.array(z.string()),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  notes: notesCollection,
  notas: notasCollection,
  team: teamCollection,
  equipo: equipoCollection,
  portfolio: portfolioCollection,
  portafolio: portafolioCollection,
};
