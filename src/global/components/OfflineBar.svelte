<script lang="ts">
import { onMount } from 'svelte'

let isOffline = $state(false)
let showBar = $state(false)

onMount(() => {
  isOffline = !navigator.onLine

  const handleOnline = () => {
    isOffline = false
    showBar = true
    // Hide the "back online" message after 3 seconds
    setTimeout(() => {
      showBar = false
    }, 3000)
  }

  const handleOffline = () => {
    isOffline = true
    showBar = true
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Show bar if starting offline
  if (isOffline) {
    showBar = true
  }

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
})
</script>

{#if showBar}
  <div
    class="offline-bar"
    data-state={isOffline ? "offline" : "online"}
    role="alert"
  >
    {#if isOffline}
      <span>You're offline. Some features may not work.</span>
    {:else}
      <span>You're back online!</span>
    {/if}
  </div>
{/if}

<style>
  /* Opaque tint over the elevated surface so it stays readable in both themes */
  .offline-bar {
    --_accent: var(--bp-color-warning);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: var(--bp-space-2) var(--bp-space-4);
    text-align: center;
    font-size: var(--bp-text-sm);
    z-index: 9999;
    background: color-mix(in srgb, var(--_accent) 18%, var(--bp-color-bg-elevated));
    color: var(--bp-color-text);
    border-bottom: 2px solid var(--_accent);
    animation: slideDown var(--bp-duration-slow) var(--bp-ease);
  }

  .offline-bar[data-state="online"] {
    --_accent: var(--bp-color-success);
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .offline-bar {
      animation: none;
    }
  }
</style>
