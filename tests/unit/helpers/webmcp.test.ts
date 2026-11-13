import { describe, expect, it, vi } from 'vitest'
import {
  createNotebookTools,
  getModelContext,
  type NotebookTool,
  parseNoteRef,
  registerNotebookTools,
} from '../../../src/global/scripts/webmcp'

const ORIGIN = 'https://www.giorgiosaud.io'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function tools(fetchImpl: typeof fetch, current: string | null = null) {
  const [search, read] = createNotebookTools({
    fetch: fetchImpl,
    origin: ORIGIN,
    lang: 'en',
    currentMarkdownPath: current,
  })
  return { search, read }
}

describe('getModelContext', () => {
  const ctx = { registerTool: () => undefined }

  it('prefers document.modelContext', () => {
    const other = { registerTool: () => undefined }
    expect(getModelContext({ modelContext: ctx }, { modelContext: other })).toBe(
      ctx,
    )
  })

  it('falls back to navigator.modelContext', () => {
    expect(getModelContext({}, { modelContext: ctx })).toBe(ctx)
  })

  it('returns null without WebMCP', () => {
    expect(getModelContext({}, {})).toBeNull()
    expect(getModelContext({ modelContext: {} }, undefined)).toBeNull()
  })
})

describe('parseNoteRef', () => {
  it('accepts a bare slug with the fallback language', () => {
    expect(parseNoteRef('css-layers-2026', 'es')).toEqual({
      slug: 'css-layers-2026',
      lang: 'es',
    })
  })

  it('reads the language from a path or URL', () => {
    expect(parseNoteRef('/es/cuaderno/css-layers-2026', 'en')).toEqual({
      slug: 'css-layers-2026',
      lang: 'es',
    })
    expect(
      parseNoteRef(`${ORIGIN}/notebook/css-layers-2026.md`, 'es'),
    ).toEqual({ slug: 'css-layers-2026', lang: 'en' })
  })

  it('rejects anything that is not a note', () => {
    expect(parseNoteRef('../../etc/passwd', 'en')).toBeNull()
    expect(parseNoteRef('/dashboard', 'en')).toBeNull()
    expect(parseNoteRef('Hello World', 'en')).toBeNull()
  })
})

describe('search_notes', () => {
  it('calls the search endpoint and returns absolute URLs', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 'css-layers-2026',
            title: 'CSS Layers',
            description: 'd',
            href: '/notebook/css-layers-2026',
            publishDate: '2026-01-01T00:00:00.000Z',
            collections: ['css'],
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      }),
    )
    const { search } = tools(fetchMock)

    const result = await search.execute({ query: 'layers', lang: 'es', page: 2 })

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.pathname).toBe('/api/notes/search.json')
    expect(url.searchParams.get('q')).toBe('layers')
    expect(url.searchParams.get('lang')).toBe('es')
    expect(url.searchParams.get('page')).toBe('2')

    const data = JSON.parse(result.content[0].text)
    expect(data.results[0]).toMatchObject({
      slug: 'css-layers-2026',
      url: `${ORIGIN}/notebook/css-layers-2026`,
    })
    expect(result.isError).toBeUndefined()
  })

  it('reports HTTP failures as tool errors', async () => {
    const { search } = tools(vi.fn().mockResolvedValue(jsonResponse({}, 500)))
    const result = await search.execute({ query: 'x' })
    expect(result.isError).toBe(true)
  })

  it('is annotated read-only', () => {
    const { search, read } = tools(vi.fn())
    expect(search.annotations.readOnlyHint).toBe(true)
    expect(read.annotations.readOnlyHint).toBe(true)
  })
})

describe('read_note', () => {
  it('fetches the markdown version of a slug in the right language', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('# Hola', { status: 200 }))
    const { read } = tools(fetchMock)

    const result = await read.execute({ slug: 'css-layers-2026', lang: 'es' })

    expect(fetchMock).toHaveBeenCalledWith(
      `${ORIGIN}/es/cuaderno/css-layers-2026.md`,
    )
    expect(result.content[0].text).toContain('# Hola')
    expect(result.content[0].text).toContain(
      `Source: ${ORIGIN}/es/cuaderno/css-layers-2026`,
    )
  })

  it('defaults to the note open in the tab', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('body'))
    const { read } = tools(fetchMock, '/notebook/current-note.md')
    await read.execute({})
    expect(fetchMock).toHaveBeenCalledWith(`${ORIGIN}/notebook/current-note.md`)
  })

  it('errors without a slug when no note is open', async () => {
    const fetchMock = vi.fn()
    const { read } = tools(fetchMock)
    const result = await read.execute({})
    expect(result.isError).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects invalid slugs without fetching', async () => {
    const fetchMock = vi.fn()
    const { read } = tools(fetchMock)
    const result = await read.execute({ slug: '../../secret' })
    expect(result.isError).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports a missing note', async () => {
    const { read } = tools(
      vi.fn().mockResolvedValue(new Response('', { status: 404 })),
    )
    const result = await read.execute({ slug: 'nope' })
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('not found')
  })
})

describe('registerNotebookTools', () => {
  it('registers every tool with a shared abort signal', async () => {
    const registered: { tool: NotebookTool; signal?: AbortSignal }[] = []
    const ctx = {
      registerTool: vi.fn((tool: NotebookTool, opts?: { signal?: AbortSignal }) => {
        registered.push({ tool, signal: opts?.signal })
      }),
    }
    const list = createNotebookTools({
      fetch: vi.fn(),
      origin: ORIGIN,
      lang: 'en',
    })

    const controller = await registerNotebookTools(ctx, list)

    expect(registered.map(r => r.tool.name)).toEqual(['search_notes', 'read_note'])
    expect(registered.every(r => r.signal === controller.signal)).toBe(true)
  })

  it('keeps going when one registration throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ctx = {
      registerTool: vi
        .fn()
        .mockRejectedValueOnce(new Error('duplicate'))
        .mockResolvedValueOnce(undefined),
    }
    const list = createNotebookTools({ fetch: vi.fn(), origin: ORIGIN, lang: 'en' })
    await registerNotebookTools(ctx, list)
    expect(ctx.registerTool).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })
})
