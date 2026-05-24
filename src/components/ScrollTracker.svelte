<script lang="ts">
import {
  isPushSupported,
  isSubscribed,
  subscribeToPush,
} from '@lib/push-client'
import { onMount } from 'svelte'
import { trackEvent } from '../helpers/datalayer'

interface Props {
  noteId: string
  lang?: 'en' | 'es'
  threshold?: number
  pushPromptDelay?: number
}

let {
  noteId,
  lang = 'en',
  threshold = 0.5,
  pushPromptDelay = 30_000,
}: Props = $props()

let maxScrollDepth = 0
let startTime = 0
let tracked = false

function getSessionId(): string {
  const key = 'view_session_id'
  let sessionId = sessionStorage.getItem(key)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(key, sessionId)
  }
  return sessionId
}

function snapDepth(d: number): 25 | 50 | 75 | 100 {
  if (d >= 1) return 100
  if (d >= 0.75) return 75
  if (d >= 0.5) return 50
  return 25
}

async function trackView(scrollDepth: number) {
  if (tracked) return
  tracked = true

  const viewDuration = Math.floor((Date.now() - startTime) / 1000)

  try {
    await fetch('/api/views/track.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'scroll_depth',
        noteId,
        scrollDepth,
        viewDuration,
        language: lang,
        sessionId: getSessionId(),
      }),
    })
    trackEvent({
      event: 'scroll_depth',
      note_id: noteId,
      depth: snapDepth(scrollDepth),
      lang,
    })
  } catch (error) {
    console.error('Failed to track view:', error)
  }
}

function updateScrollDepth() {
  const content = document.getElementById('content')
  if (!content) return

  const scrolledPast = window.scrollY + window.innerHeight - content.offsetTop
  const scrollDepth = Math.min(
    1,
    Math.max(0, scrolledPast / content.offsetHeight),
  )

  if (scrollDepth > maxScrollDepth) {
    maxScrollDepth = scrollDepth
    if (maxScrollDepth >= threshold && !tracked) {
      trackView(maxScrollDepth)
    }
  }
}

async function maybePromptPush() {
  const PROMPT_KEY = 'push_prompt_shown'
  if (sessionStorage.getItem(PROMPT_KEY)) return
  if (!isPushSupported()) return
  if (Notification.permission !== 'default') return
  if (await isSubscribed()) return

  sessionStorage.setItem(PROMPT_KEY, '1')
  subscribeToPush()
}

onMount(() => {
  startTime = Date.now()
  window.addEventListener('scroll', updateScrollDepth, {
    passive: true,
  })
  updateScrollDepth()

  const pushTimer = setTimeout(maybePromptPush, pushPromptDelay)

  const handleUnload = () => {
    if (!tracked && maxScrollDepth > 0.1) {
      const data = JSON.stringify({
        type: 'scroll_depth',
        noteId,
        scrollDepth: maxScrollDepth,
        viewDuration: Math.floor((Date.now() - startTime) / 1000),
        language: lang,
        sessionId: getSessionId(),
      })
      navigator.sendBeacon(
        '/api/views/track.json',
        new Blob(
          [
            data,
          ],
          {
            type: 'application/json',
          },
        ),
      )
      trackEvent({
        event: 'page_exit_scroll',
        note_id: noteId,
        max_depth: Math.round(maxScrollDepth * 100),
        lang,
      })
    }
  }

  window.addEventListener('beforeunload', handleUnload)

  return () => {
    clearTimeout(pushTimer)
    window.removeEventListener('scroll', updateScrollDepth)
    window.removeEventListener('beforeunload', handleUnload)
  }
})
</script>

<!-- Invisible component - just for tracking -->
