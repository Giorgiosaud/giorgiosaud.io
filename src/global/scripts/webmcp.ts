/**
 * WebMCP tools for the notebook.
 *
 * Exposes read-only tools (search notes, read a note as Markdown) to AI agents
 * running in the browser, via the WebMCP API. Progressive enhancement: when the
 * browser has no model context, nothing happens.
 *
 * Spec: https://webmachinelearning.github.io/webmcp/
 * The spec moved the entry point from `navigator.modelContext` to
 * `document.modelContext` (July 2026); Chrome still serves both during the
 * origin trial, so we prefer the new one and fall back to the old.
 *
 * The tools are thin wrappers over endpoints the site already serves:
 * `/api/notes/search.json` and the `.md` version of every note.
 */

export type NotebookLang = 'en' | 'es'

/** Shape returned by `execute`: MCP-style text content. */
export interface ToolResult {
  content: {
    type: 'text'
    text: string
  }[]
  isError?: boolean
}

export interface NotebookTool {
  name: string
  title: string
  description: string
  inputSchema: Record<string, unknown>
  annotations: {
    readOnlyHint: boolean
  }
  execute: (input: Record<string, unknown>) => Promise<ToolResult>
}

/** Minimal surface of `ModelContext` we rely on. */
export interface ModelContextLike {
  registerTool: (
    tool: NotebookTool,
    options?: {
      signal?: AbortSignal
    },
  ) => unknown
}

export interface NotebookToolsEnv {
  fetch: typeof fetch
  /** e.g. https://www.giorgiosaud.io */
  origin: string
  /** Language of the current page; default for tool calls. */
  lang: NotebookLang
  /** `.md` path of the note currently open, if any (from <link rel="alternate">). */
  currentMarkdownPath?: string | null
}

const NOTE_PREFIX: Record<NotebookLang, string> = {
  en: '/notebook',
  es: '/es/cuaderno',
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function getModelContext(
  doc: unknown,
  nav: unknown,
): ModelContextLike | null {
  const fromDoc = (
    doc as
      | {
          modelContext?: ModelContextLike
        }
      | undefined
  )?.modelContext
  if (fromDoc && typeof fromDoc.registerTool === 'function') return fromDoc
  const fromNav = (
    nav as
      | {
          modelContext?: ModelContextLike
        }
      | undefined
  )?.modelContext
  if (fromNav && typeof fromNav.registerTool === 'function') return fromNav
  return null
}

function text(value: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: typeof value === 'string' ? value : JSON.stringify(value),
      },
    ],
  }
}

function error(message: string): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
    isError: true,
  }
}

function parseLang(value: unknown, fallback: NotebookLang): NotebookLang {
  return value === 'es' || value === 'en' ? value : fallback
}

/**
 * Accepts a bare slug ("css-layers-2026"), a path ("/es/cuaderno/x") or a full
 * URL, and returns the note slug and language, or null if it is not a note.
 */
export function parseNoteRef(
  ref: string,
  fallbackLang: NotebookLang,
): {
  slug: string
  lang: NotebookLang
} | null {
  const trimmed = ref.trim()
  if (SLUG_REGEX.test(trimmed))
    return {
      slug: trimmed,
      lang: fallbackLang,
    }

  let pathname: string
  try {
    pathname = new URL(trimmed, 'https://placeholder.invalid').pathname
  } catch {
    return null
  }
  const match = pathname.match(
    /^\/(?:(es)\/cuaderno|notebook)\/([a-z0-9-]+?)(?:\.md)?\/?$/,
  )
  if (!match || !SLUG_REGEX.test(match[2])) return null
  return {
    slug: match[2],
    lang: match[1] ? 'es' : 'en',
  }
}

export function createNotebookTools(env: NotebookToolsEnv): NotebookTool[] {
  const searchNotes: NotebookTool = {
    name: 'search_notes',
    title: 'Search notebook',
    description:
      "Search Giorgio Saud's web development notebook (CSS, Astro, design systems, AI agents, architecture). Returns matching notes with title, description, URL and a slug you can pass to read_note. An empty query lists the latest notes.",
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Free-text search over titles, descriptions and tags. At least 2 characters; empty lists the latest notes.',
        },
        lang: {
          type: 'string',
          enum: [
            'en',
            'es',
          ],
          description: 'Notebook language. Defaults to the page language.',
        },
        collection: {
          type: 'string',
          description: 'Optional collection id to filter by, e.g. "css".',
        },
        page: {
          type: 'integer',
          minimum: 1,
          description: 'Results page (12 per page). Defaults to 1.',
        },
      },
    },
    annotations: {
      readOnlyHint: true,
    },
    async execute(input) {
      const lang = parseLang(input.lang, env.lang)
      const params = new URLSearchParams({
        lang,
      })
      if (typeof input.query === 'string') params.set('q', input.query)
      if (typeof input.collection === 'string')
        params.set('collection', input.collection)
      if (typeof input.page === 'number' && input.page >= 1)
        params.set('page', String(Math.floor(input.page)))

      const res = await env.fetch(
        `${env.origin}/api/notes/search.json?${params}`,
      )
      if (!res.ok) return error(`Search failed with HTTP ${res.status}`)
      const data = (await res.json()) as {
        results: {
          id: string
          title: string
          description?: string
          href: string
          publishDate: string
          collections: string[]
        }[]
        total: number
        page: number
        totalPages: number
      }

      return text({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        results: data.results.map(note => ({
          slug: note.id,
          title: note.title,
          description: note.description,
          url: `${env.origin}${note.href}`,
          publishDate: note.publishDate,
          collections: note.collections,
        })),
      })
    },
  }

  const readNote: NotebookTool = {
    name: 'read_note',
    title: 'Read note',
    description:
      'Read a notebook note as Markdown. Pass the slug returned by search_notes, or a note URL. Without arguments, reads the note open in this tab.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description:
            'Note slug (e.g. "css-layers-2026") or note URL. Omit to read the current note.',
        },
        lang: {
          type: 'string',
          enum: [
            'en',
            'es',
          ],
          description:
            'Language when passing a bare slug. Defaults to the page language.',
        },
      },
    },
    annotations: {
      readOnlyHint: true,
    },
    async execute(input) {
      let path: string
      if (typeof input.slug === 'string' && input.slug.trim() !== '') {
        const ref = parseNoteRef(input.slug, parseLang(input.lang, env.lang))
        if (!ref)
          return error(`"${input.slug}" is not a valid note slug or URL`)
        path = `${NOTE_PREFIX[ref.lang]}/${ref.slug}.md`
      } else if (env.currentMarkdownPath) {
        path = env.currentMarkdownPath
      } else {
        return error(
          'No note is open in this tab. Pass a slug (use search_notes to find one).',
        )
      }

      const res = await env.fetch(`${env.origin}${path}`)
      if (res.status === 404) return error(`Note not found: ${path}`)
      if (!res.ok)
        return error(`Reading the note failed with HTTP ${res.status}`)
      const markdown = await res.text()
      return text(
        `Source: ${env.origin}${path.replace(/\.md$/, '')}\n\n${markdown}`,
      )
    },
  }

  return [
    searchNotes,
    readNote,
  ]
}

/**
 * Registers every tool; returns the controller whose abort() unregisters them
 * (the spec has no unregisterTool — tools are removed through the signal).
 */
export async function registerNotebookTools(
  ctx: ModelContextLike,
  tools: NotebookTool[],
): Promise<AbortController> {
  const controller = new AbortController()
  for (const tool of tools) {
    try {
      await ctx.registerTool(tool, {
        signal: controller.signal,
      })
    } catch (err) {
      console.warn(`[webmcp] could not register ${tool.name}`, err)
    }
  }
  return controller
}
