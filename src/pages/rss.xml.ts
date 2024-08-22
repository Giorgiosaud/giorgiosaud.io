import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const notes = await getCollection("notes");
  return rss({
    title: "Giorgiosaud Notebook",
    description: "A developer notebook of important things",
    site: context.site,
    items: notes.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.resume,
      // customData: post.data.customData,
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/notebook/${post.slug}/`,
    })),
  });
}
