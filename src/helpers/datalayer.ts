type Lang = 'en' | 'es'

type AnalyticsEvent =
  | {
      event: 'note_view'
      note_id: string
      note_title: string
      category: string
      lang: Lang
    }
  | {
      event: 'scroll_depth'
      note_id: string
      depth: 25 | 50 | 75 | 100
      lang: Lang
    }
  | {
      event: 'page_exit_scroll'
      note_id: string
      max_depth: number
      lang: Lang
    }
  | {
      event: 'search_performed'
      q: string
      results_count: number
      collection: string
      lang: Lang
    }
  | {
      event: 'collection_filter'
      collection: string
      lang: Lang
    }
  | {
      event: 'search_result_click'
      note_id: string
      note_title: string
      position: number
      lang: Lang
    }
  | {
      event: 'related_note_click'
      note_id: string
      source_note_id: string
      lang: Lang
    }
  | {
      event: 'share_click'
      note_id: string
      method: 'copy' | 'native'
      lang: Lang
    }
  | {
      event: 'ai_summarizer_open'
      note_id: string
      lang: Lang
    }

export function trackEvent(payload: AnalyticsEvent): void {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args)
    }
  }
  const { event, ...params } = payload
  window.gtag('event', event, params)
}
