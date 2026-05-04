import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const notes = await getCollection('notes')
  const sorted = notes
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# Giorgiosaud.io

> Web developer notebook with notes on Astro, JavaScript, TypeScript, and modern web development.

## Content access

Every note is available in two formats:
- HTML: \`/notebook/{slug}\`
- Markdown: \`/notebook/{slug}.md\` — served with \`Content-Type: text/markdown; charset=utf-8\`

## Notes
${sorted.map(n => `- [${n.data.title}](/notebook/${n.id}.md): ${n.data.description || ''}`).join('\n')}
`
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
