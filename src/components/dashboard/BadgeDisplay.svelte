<script lang="ts">
import '@be-partner-labs/ds/components/skeleton'
import { userStore } from '@lib/stores/auth'
import type { User } from 'better-auth/types'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: string
}

const translations = {
  en: {
    noBadges: 'No badges earned yet.',
    earnedOn: 'Earned on',
  },
  es: {
    noBadges: 'Aun no has ganado insignias.',
    earnedOn: 'Ganado el',
  },
}

let { lang = 'en' }: Props = $props()

let user = $state<User | null>(null)
let badges = $state<Badge[]>([])
let isLoading = $state(true)

const t = $derived(translations[lang])

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

onMount(() => {
  const unsub = userStore.subscribe(v => (user = v))

  // TODO: Fetch user badges from API when endpoint is available
  // For now, just mark as loaded
  isLoading = false

  return () => unsub()
})
</script>

<div class="badges-container">
  {#if isLoading}
    <div class="loading" aria-busy="true">
      <div class="bp-skeleton skeleton-badge"></div>
      <div class="bp-skeleton skeleton-badge"></div>
      <div class="bp-skeleton skeleton-badge"></div>
    </div>
  {:else if badges.length === 0}
    <p class="no-badges">{t.noBadges}</p>
  {:else}
    <div class="badge-grid">
      {#each badges as badge (badge.id)}
        <!-- Per-badge color comes from data, so it can only be passed inline -->
        <div class="badge-item" style="--site-badge-item-border-color: {badge.color}">
          <div class="badge-icon" aria-hidden="true">{badge.icon}</div>
          <div class="badge-info">
            <span class="badge-name">{badge.name}</span>
            <span class="badge-description">{badge.description}</span>
            <span class="badge-earned"
              >{t.earnedOn} {formatDate(badge.earnedAt)}</span
            >
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .badges-container {
    min-height: 100px;
  }

  .no-badges {
    text-align: center;
    color: var(--bp-color-text-muted);
    padding: var(--bp-space-8);
    background: var(--bp-color-bg-subtle);
    border: 1px dashed var(--bp-color-border);
    border-radius: var(--bp-radius-lg);
  }

  .badge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--bp-space-4);
  }

  .badge-item {
    --_border-color: var(--site-badge-item-border-color, var(--site-color-accent));

    display: flex;
    align-items: center;
    gap: var(--bp-space-4);
    padding: var(--bp-space-4);
    background: var(--bp-color-bg-elevated);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-lg);
    border-left: 4px solid var(--_border-color);
  }

  .badge-icon {
    font-size: var(--bp-text-3xl);
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bp-color-bg-subtle);
    border-radius: var(--bp-radius-full);
    flex-shrink: 0;
  }

  .badge-info {
    display: flex;
    flex-direction: column;
    gap: var(--bp-space-1);
    min-width: 0;
  }

  .badge-name {
    font-weight: var(--bp-font-weight-semibold);
    font-size: var(--bp-text-base);
  }

  .badge-description {
    font-size: var(--bp-text-sm);
    color: var(--bp-color-text-muted);
  }

  .badge-earned {
    font-size: var(--bp-text-xs);
    color: var(--bp-color-text-muted);
  }

  .loading {
    display: flex;
    gap: var(--bp-space-4);
    flex-wrap: wrap;
  }

  .skeleton-badge {
    width: 280px;
    height: 80px;
  }
</style>
