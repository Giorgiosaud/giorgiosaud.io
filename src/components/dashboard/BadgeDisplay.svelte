<script lang="ts">
import { $user as userStore } from '@lib/stores/auth'
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
    <div class="loading">
      <div class="skeleton skeleton-badge"></div>
      <div class="skeleton skeleton-badge"></div>
      <div class="skeleton skeleton-badge"></div>
    </div>
  {:else if badges.length === 0}
    <p class="no-badges">{t.noBadges}</p>
  {:else}
    <div class="badge-grid">
      {#each badges as badge (badge.id)}
        <div class="badge-item" style="--badge-color: {badge.color}">
          <div class="badge-icon">{badge.icon}</div>
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
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
    padding: 2rem;
    background: light-dark(hsl(0 0% 98%), hsl(0 0% 12%));
    border: 1px dashed light-dark(hsl(0 0% 85%), hsl(0 0% 25%));
    border-radius: 8px;
  }

  .badge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .badge-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: light-dark(white, hsl(0 0% 12%));
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 22%));
    border-radius: 8px;
    border-left: 4px solid var(--badge-color, var(--color-main));
  }

  .badge-icon {
    font-size: 2rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: light-dark(hsl(0 0% 97%), hsl(0 0% 15%));
    border-radius: 50%;
    flex-shrink: 0;
  }

  .badge-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .badge-name {
    font-weight: 600;
    font-size: 1rem;
  }

  .badge-description {
    font-size: 0.85rem;
    color: light-dark(hsl(0 0% 40%), hsl(0 0% 60%));
  }

  .badge-earned {
    font-size: 0.75rem;
    color: light-dark(hsl(0 0% 55%), hsl(0 0% 50%));
  }

  .loading {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .skeleton {
    background: light-dark(hsl(0 0% 92%), hsl(0 0% 18%));
    border-radius: 8px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-badge {
    width: 280px;
    height: 80px;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
