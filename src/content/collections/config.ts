import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections = defineCollection({
	loader: glob({
		pattern: "**\/[^_]*.md",
		base: "./src/content/collections/en",
	}),
	schema: z.object({
		title: z.string(),
		icon: z.string(),
		description: z.string(),
	}),
});
export const colecciones = defineCollection({
	loader: glob({
		pattern: "**\/[^_]*.md",
		base: "./src/content/collections/es",
	}),
	schema: z.object({
		title: z.string(),
		icon: z.string(),
		description: z.string(),
	}),
});
export default {
	collections,
	colecciones,
};
