import { getPublishedNotes } from '@helpers/collections'
import { runSearch } from '@helpers/search'
import type { SupportedLanguages } from '@i18n/utils'
import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams
  const q = params.get('q') ?? ''
  const collection = params.get('collection') ?? ''
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10))
  const langParam = params.get('lang') ?? 'en'
  const lang: SupportedLanguages = langParam === 'es' ? 'es' : 'en'

  const allNotes = await getPublishedNotes(lang)

  const response = runSearch(allNotes, {
    q,
    collection,
    page,
    lang,
  })

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
