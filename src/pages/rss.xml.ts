import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import type { AstroSharedContext } from 'astro'

export async function GET(context: AstroSharedContext) {
  const notes = await getCollection('notes')
  const notas = await getCollection('notas')
  const itemsNotes = notes.map(note => ({
    title: note.data.title,
    pubDate: note.data.publishDate,
    description: note.data.resume,
    // Compute RSS link from post `id`
    // This example assumes all posts are rendered as `/blog/[id]` routes
    link: `/notebook/${note.id}/`,
  }))
  const itemNotas = notas.map(note => ({
    title: note.data.title,
    pubDate: note.data.publishDate,
    description: note.data.resume,
    // Compute RSS link from post `id`
    // This example assumes all posts are rendered as `/blog/[id]` routes
    link: `/es/cuaderno/${note.id}/`,
  }))
  return rss({
    title: 'Notebook Posts',
    description: 'My notebook Posts',
    site: context.url.origin,
    items: [
      itemsNotes,
      itemNotas,
    ].flat(),
    customData: `<language>en-us</language>`,
    stylesheet: '/rss/styles.xsl',
  })
}
