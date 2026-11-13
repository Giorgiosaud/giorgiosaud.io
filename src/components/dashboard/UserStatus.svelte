<script lang="ts">
import '@be-partner-labs/ds/components/card'
import '@be-partner-labs/ds/components/badge'
import '@be-partner-labs/ds/components/skeleton'
import { isLoadingStore, userStore } from '@lib/stores/auth'
import type { User } from 'better-auth/types'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
  compact?: boolean
}

const translations = {
  en: {
    title: 'Account Status',
    role: 'Role',
    memberSince: 'Member Since',
    viewProfile: 'View Public Profile',
    noProfile: 'Set up your username to enable your public profile.',
    admin: 'Admin',
    user: 'User',
  },
  es: {
    title: 'Estado de la Cuenta',
    role: 'Rol',
    memberSince: 'Miembro Desde',
    viewProfile: 'Ver Perfil Publico',
    noProfile:
      'Configura tu nombre de usuario para habilitar tu perfil publico.',
    admin: 'Admin',
    user: 'Usuario',
  },
}

let { lang = 'en', compact = false }: Props = $props()

let user = $state<User | null>(null)
let isLoading = $state(true)
let profileData = $state<{
  username?: string | null
  displayUsername?: string | null
  createdAt?: string
} | null>(null)

const t = $derived(translations[lang])
const isAdmin = $derived(
  (
    user as unknown as {
      role?: string
    }
  )?.role === 'admin',
)

// Format date for display
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
</script>

{#if isLoading}
  <div class="bp-card status-card loading" aria-busy="true">
    <div class="bp-skeleton bp-skeleton--heading"></div>
    <div class="bp-skeleton bp-skeleton--text skeleton-text"></div>
    <div class="bp-skeleton bp-skeleton--text skeleton-text"></div>
  </div>
{:else if user}
  <div class="bp-card status-card" class:compact>
    {#if !compact}
      <h2>{t.title}</h2>
    {/if}

    <div class="status-grid">
      <div class="status-item">
        <span class="label">{t.role}</span>
        <span
          class="bp-badge role-badge"
          class:bp-badge--primary={isAdmin}
          class:bp-badge--neutral={!isAdmin}>{isAdmin ? t.admin : t.user}</span
        >
      </div>

      <div class="status-item">
        <span class="label">{t.memberSince}</span>
        <span class="value"
          >{formatDate(
            profileData?.createdAt || user.createdAt.toISOString(),
          )}</span
        >
      </div>
    </div>

    {#if profileData?.username}
      <a
        href={`/@${profileData.displayUsername || profileData.username}`}
        class="profile-link"
      >
        {t.viewProfile}
      </a>
    {:else if !compact}
      <p class="no-profile">{t.noProfile}</p>
    {/if}
  </div>
{/if}

<style>
  .status-card.compact {
    --card-padding: var(--bp-space-4);
  }

  .status-card h2 {
    font-size: var(--bp-text-xl);
    margin: 0;
  }

  .status-grid {
    display: grid;
    gap: var(--bp-space-4);
  }

  .status-item {
    display: flex;
    flex-direction: column;
    gap: var(--bp-space-1);
  }

  .label {
    font-size: var(--bp-text-xs);
    color: var(--bp-color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: var(--bp-text-base);
    font-weight: var(--bp-font-weight-medium);
  }

  .role-badge {
    width: fit-content;
  }

  .profile-link {
    display: inline-block;
    color: var(--site-color-accent);
    text-decoration: none;
    font-weight: var(--bp-font-weight-medium);
  }

  .profile-link:hover {
    text-decoration: underline;
  }

  .no-profile {
    margin: 0;
    font-size: var(--bp-text-sm);
    color: var(--bp-color-text-muted);
  }

  .loading {
    min-height: 120px;
  }

  .skeleton-text {
    width: 70%;
  }
</style>
