import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const notas = await getCollection('notas')
  const sorted = notas
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# Giorgiosaud.io

> Cuaderno de desarrollador web con notas sobre Astro, JavaScript, TypeScript y desarrollo web moderno.

## Notas
${sorted.map(n => `- [${n.data.title}](/es/cuaderno/${n.id}.md): ${n.data.description || ''}`).join('\n')}
`
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
