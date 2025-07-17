import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

export const technologies = defineCollection({
	loader: file("src/content/technologies/technologies.json"),
	schema: z.object({
		id: z.string(),
		techs: z.array(z.string()),
	}),
});
