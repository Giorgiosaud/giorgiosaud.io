import { file } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const technologies = defineCollection({
    loader: file("src/content/technologies/technologies.json"),
    schema: z.object({
        id: z.string(),
        techs: z.array(z.string()),
    })
})