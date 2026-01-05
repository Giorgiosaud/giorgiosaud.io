<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  interface Props {
    noteId: string
    lang?: 'en' | 'es'
    threshold?: number // Scroll depth threshold to track (0-1), default 0.5
  }

  let { noteId, lang = 'en', threshold = 0.5 }: Props = $props()

  let maxScrollDepth = 0
  let startTime = 0
  let tracked = false
  let observer: IntersectionObserver | null = null

  // Generate or get session ID for anonymous tracking
  function getSessionId(): string {
    const key = 'view_session_id'
    let sessionId = sessionStorage.getItem(key)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem(key, sessionId)
    }
    return sessionId
  }

  // Track the view
  async function trackView(scrollDepth: number) {
    if (tracked) return
    tracked = true

    const viewDuration = Math.floor((Date.now() - startTime) / 1000)

    try {
      await fetch('/api/views/track.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scroll_depth',
          noteId,
          scrollDepth,
          viewDuration,
          language: lang,
          sessionId: getSessionId(),
        }),
      })

      // Also fire gtag event for analytics
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'scroll_depth', {
          event_category: 'engagement',
          event_label: noteId,
          value: Math.round(scrollDepth * 100),
          language: lang,
        })
      }
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  // Calculate scroll depth
  function updateScrollDepth() {
    const content = document.getElementById('content')
    if (!content) return

    const windowHeight = window.innerHeight
    const scrollTop = window.scrollY
    const contentTop = content.offsetTop
    const contentHeight = content.offsetHeight

    // Calculate how far through the content we've scrolled
    const scrolledPast = scrollTop + windowHeight - contentTop
    const scrollDepth = Math.min(1, Math.max(0, scrolledPast / contentHeight))

    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth

      // Track when threshold is reached
      if (maxScrollDepth >= threshold && !tracked) {
        trackView(maxScrollDepth)
      }
    }
  }

  onMount(() => {
    startTime = Date.now()

    // Use scroll listener for tracking
    window.addEventListener('scroll', updateScrollDepth, { passive: true })

    // Initial check
    updateScrollDepth()

    // Also track on page leave if threshold not met
    const handleUnload = () => {
      if (!tracked && maxScrollDepth > 0.1) {
        const viewDuration = Math.floor((Date.now() - startTime) / 1000)
        // Use sendBeacon for reliable tracking on page leave
        const data = JSON.stringify({
          type: 'scroll_depth',
          noteId,
          scrollDepth: maxScrollDepth,
          viewDuration,
          language: lang,
          sessionId: getSessionId(),
        })
        navigator.sendBeacon('/api/views/track.json', new Blob([data], { type: 'application/json' }))

        // Also send to gtag for analytics
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'page_exit_scroll', {
            event_category: 'engagement',
            event_label: noteId,
            value: Math.round(maxScrollDepth * 100),
            view_duration: viewDuration,
            language: lang,
            non_interaction: true,
          })
        }
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('scroll', updateScrollDepth)
      window.removeEventListener('beforeunload', handleUnload)
    }
  })

  // Declare gtag type
  declare global {
    interface Window {
      gtag: (...args: unknown[]) => void
    }
  }
</script>

<!-- Invisible component - just for tracking -->
