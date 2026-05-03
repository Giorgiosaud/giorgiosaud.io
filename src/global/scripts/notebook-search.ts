/**
 * Vanilla JS search client for the notebook search index pages.
 * Exposes all functions on `window.notebookSearch` for consumption by
 * inline scripts in notebook/index.astro and es/cuaderno/index.astro.
 */

import { trackEvent } from '../../helpers/datalayer'

export interface SearchParams {
  q: string
  collection: string
  page: number
  lang: string
}

export interface NoteCard {
  id: string
  title: string
  description: string | undefined
  coverSrc: string | undefined
  coverAlt: string | undefined
  href: string
  publishDate: string
  lastUpdate: string | undefined
  collections: string[]
}

export interface SearchResponse {
  results: NoteCard[]
  total: number
  page: number
  totalPages: number
  query: string
  collection: string | null
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

function readInitialParams(): SearchParams {
  const sp = new URLSearchParams(window.location.search)
  return {
    q: sp.get('q') ?? '',
    collection: sp.get('collection') ?? '',
    page: Math.max(1, Number.parseInt(sp.get('page') ?? '1', 10)),
    lang: document.documentElement.lang || 'en',
  }
}

function syncURL(params: SearchParams): void {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.collection) sp.set('collection', params.collection)
  if (params.page > 1) sp.set('page', String(params.page))
  const search = sp.toString()
  const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}`
  history.pushState(
    {
      params,
    },
    '',
    newUrl,
  )
}

function vtn(prefix: string, id: string): string {
  return `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function renderCard(note: NoteCard): string {
  const title = note.title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const description = (note.description ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const coverAlt = (note.coverAlt ?? title).replace(/"/g, '&quot;')
  const collection = note.collections[0] ?? ''
  const imgVtn = vtn('note-img', note.id)
  const titleVtn = vtn('note-title', note.id)
  const dateIso = note.lastUpdate ?? note.publishDate
  const dateLabel = note.lastUpdate
    ? `Updated ${formatDate(dateIso)}`
    : `${formatDate(dateIso)}`

  const imgHtml = note.coverSrc
    ? `<div class="card-thumb" style="view-transition-name:${imgVtn}">
        <img src="${note.coverSrc.replace(/"/g, '&quot;')}" alt="${coverAlt}" loading="lazy" />
      </div>`
    : ''

  const collectionHtml = collection
    ? `<span class="card-collection">${collection.replace(/-/g, ' ')}</span>`
    : ''

  return `<li class="note-card-item">
    <article aria-label="${title}" data-link="${note.href}" data-collection="${collection}">
      <div class="wrapper">
        ${imgHtml}
        <div class="title" style="view-transition-name:${titleVtn}" title="${title}">
          <h2>${title}</h2>
        </div>
        <div class="description" title="${description}">
          <p>${description}</p>
        </div>
        <footer class="card-meta">
          ${collectionHtml}
          <time datetime="${dateIso}" class="card-date">${dateLabel}</time>
        </footer>
      </div>
      <a href="${note.href}" class="card-link" aria-label="${coverAlt}"></a>
    </article>
  </li>`
}

function renderResults(
  data: SearchResponse,
  container: HTMLElement,
  noResultsText: string,
  chipEls: NodeListOf<HTMLButtonElement>,
): void {
  if (data.results.length === 0) {
    container.innerHTML = `<li class="no-results"><p>${noResultsText}</p></li>`
    chipEls.forEach(chip => {
      chip.hidden = chip.dataset.collectionChip !== ''
    })
    return
  }
  container.innerHTML = data.results.map(renderCard).join('')

  const presentCollections = new Set(data.results.flatMap(n => n.collections))
  chipEls.forEach(chip => {
    const id = chip.dataset.collectionChip ?? ''
    chip.hidden = id !== '' && !presentCollections.has(id)
  })
}

function renderPagination(
  data: SearchResponse,
  container: HTMLElement,
  prevLabel: string,
  nextLabel: string,
  onPage: (page: number) => void,
): void {
  container.innerHTML = ''
  if (data.totalPages <= 1) return

  if (data.page > 1) {
    const prev = document.createElement('button')
    prev.className = 'pagination-btn'
    prev.textContent = prevLabel
    prev.addEventListener('click', () => onPage(data.page - 1))
    container.appendChild(prev)
  }

  const info = document.createElement('span')
  info.className = 'pagination-info'
  info.textContent = `${data.page} / ${data.totalPages}`
  container.appendChild(info)

  if (data.page < data.totalPages) {
    const next = document.createElement('button')
    next.className = 'pagination-btn'
    next.textContent = nextLabel
    next.addEventListener('click', () => onPage(data.page + 1))
    container.appendChild(next)
  }
}

export function initNotebookSearch(options: {
  lang: string
  noResultsText: string
  loadingText: string
  prevLabel: string
  nextLabel: string
}): void {
  const resultsEl = document.getElementById(
    'search-results',
  ) as HTMLUListElement | null
  const paginationEl = document.getElementById(
    'pagination',
  ) as HTMLDivElement | null
  const inputEl = document.getElementById(
    'search-input',
  ) as HTMLInputElement | null
  const chipEls = document.querySelectorAll<HTMLButtonElement>(
    '[data-collection-chip]',
  )

  if (!resultsEl || !inputEl) return

  let currentParams: SearchParams = {
    ...readInitialParams(),
    lang: options.lang,
  }

  async function fetchResults(
    params: SearchParams,
    skipResults = false,
  ): Promise<void> {
    if (!skipResults) {
      resultsEl!.innerHTML = `<li class="loading"><p>${options.loadingText}</p></li>`
    }

    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.collection) sp.set('collection', params.collection)
    sp.set('page', String(params.page))
    sp.set('lang', params.lang)

    try {
      const res = await fetch(`/api/notes/search.json?${sp.toString()}`)
      const data: SearchResponse = await res.json()

      const lang = options.lang === 'es' ? 'es' : 'en'
      trackEvent({
        event: 'search_performed',
        q: params.q,
        results_count: data.total,
        collection: params.collection,
        lang,
      })
      if (!skipResults) {
        renderResults(data, resultsEl!, options.noResultsText, chipEls)
      }
      if (paginationEl) {
        renderPagination(
          data,
          paginationEl,
          options.prevLabel,
          options.nextLabel,
          page => {
            currentParams = {
              ...currentParams,
              page,
            }
            syncURL(currentParams)
            fetchResults(currentParams)
          },
        )
      }
    } catch {
      if (!skipResults) {
        resultsEl!.innerHTML = `<li class="error"><p>${options.noResultsText}</p></li>`
      }
    }
  }

  function updateChips(collection: string): void {
    chipEls.forEach(chip => {
      const chipCollection = chip.dataset.collectionChip ?? ''
      chip.classList.toggle('active', chipCollection === collection)
      chip.setAttribute(
        'aria-pressed',
        chipCollection === collection ? 'true' : 'false',
      )
    })
  }

  const debouncedFetch = debounce(() => {
    currentParams = {
      ...currentParams,
      q: inputEl!.value,
      page: 1,
    }
    syncURL(currentParams)
    fetchResults(currentParams)
  }, 300)

  inputEl.addEventListener('input', debouncedFetch)

  chipEls.forEach(chip => {
    chip.addEventListener('click', () => {
      const collection = chip.dataset.collectionChip ?? ''
      const lang = options.lang === 'es' ? 'es' : 'en'
      trackEvent({
        event: 'collection_filter',
        collection,
        lang,
      })
      currentParams = {
        ...currentParams,
        collection,
        page: 1,
      }
      updateChips(collection)
      syncURL(currentParams)
      fetchResults(currentParams)
    })
  })

  window.addEventListener('popstate', event => {
    const restored: SearchParams = event.state?.params ?? {
      ...readInitialParams(),
      lang: options.lang,
    }
    currentParams = restored
    inputEl!.value = restored.q
    updateChips(restored.collection)
    fetchResults(currentParams)
  })

  resultsEl.addEventListener('click', e => {
    const link = (e.target as Element).closest('a.card-link')
    if (!link) return
    const article = link.closest('article')
    if (!article) return
    const items = Array.from(resultsEl.querySelectorAll('.note-card-item'))
    const position = items.indexOf(article.closest('.note-card-item')!) + 1
    const noteId = article.dataset.link ?? ''
    const noteTitle = article.querySelector('h2')?.textContent ?? ''
    const lang = options.lang === 'es' ? 'es' : 'en'
    trackEvent({
      event: 'search_result_click',
      note_id: noteId,
      note_title: noteTitle,
      position,
      lang,
    })
  })

  // Initialize from URL params on page load
  inputEl.value = currentParams.q
  updateChips(currentParams.collection)
  // SSR rendered page 1 — skip replacing results, only render pagination
  const ssrRendered = resultsEl.dataset.ssr === 'true'
  const isDefaultLoad =
    ssrRendered &&
    !currentParams.q &&
    !currentParams.collection &&
    currentParams.page === 1
  fetchResults(currentParams, isDefaultLoad)
}
