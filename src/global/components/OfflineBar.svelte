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
    class:offline={isOffline}
    class:online={!isOffline}
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
  .offline-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 0.5rem 1rem;
    text-align: center;
    font-size: 0.875rem;
    z-index: 9999;
    animation: slideDown 0.3s ease-out;
  }

  .offline {
    background: var(--color-warning, #f59e0b);
    color: var(--color-warning-text, #000);
  }

  .online {
    background: var(--color-success, #10b981);
    color: var(--color-success-text, #fff);
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
</style>
