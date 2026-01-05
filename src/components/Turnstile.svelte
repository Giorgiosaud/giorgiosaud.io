<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  interface Props {
    siteKey: string
    onVerify: (token: string) => void
    onError?: () => void
    onExpire?: () => void
    theme?: 'light' | 'dark' | 'auto'
    size?: 'normal' | 'compact' | 'invisible'
  }

  let {
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'auto',
    size = 'normal'
  }: Props = $props()

  let container: HTMLDivElement
  let widgetId: string | null = null

  onMount(() => {
    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = renderWidget
      document.head.appendChild(script)
    } else {
      renderWidget()
    }
  })

  onDestroy(() => {
    if (widgetId && window.turnstile) {
      window.turnstile.remove(widgetId)
    }
  })

  function renderWidget() {
    if (!window.turnstile || !container) return

    widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      theme,
      size,
      callback: (token: string) => {
        onVerify(token)
      },
      'error-callback': () => {
        onError?.()
      },
      'expired-callback': () => {
        onExpire?.()
      },
    })
  }

  export function reset() {
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId)
    }
  }
</script>

<div bind:this={container} class="turnstile-container"></div>

<style>
  .turnstile-container {
    display: flex;
    justify-content: center;
    margin-block: 0.5rem;
  }
</style>
