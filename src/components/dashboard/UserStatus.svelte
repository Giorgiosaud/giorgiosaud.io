<script lang="ts">
import {
  $isLoading as isLoadingStore,
  $user as userStore,
} from '@lib/stores/auth'
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

onMount(() => {
  const unsub1 = userStore.subscribe(v => (user = v))
  const unsub2 = isLoadingStore.subscribe(v => (isLoading = v))

  // Fetch profile data
  fetch('/api/dashboard/profile.json')
    .then(res => res.json())
    .then((data: { user: User }) => {
      if (data.user) {
        profileData = {
          createdAt: data.user.createdAt?.toISOString(),
        }
      }
    })
    .catch(err => console.error('Failed to load profile:', err))

  return () => {
    unsub1()
    unsub2()
  }
})
</script>

{#if isLoading}
  <div class="status-card loading">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
  </div>
{:else if user}
  <div class="status-card" class:compact>
    {#if !compact}
      <h2>{t.title}</h2>
    {/if}

    <div class="status-grid">
      <div class="status-item">
        <span class="label">{t.role}</span>
        <span
          class="value role-badge"
          class:admin={(user as { role?: string }).role === "admin"}
        >
          {(user as { role?: string }).role === "admin" ? t.admin : t.user}
        </span>
      </div>

      <div class="status-item">
        <span class="label">{t.memberSince}</span>
        <span class="value"
          >{formatDate(
            profileData?.createdAt || user.createdAt.toISOString()
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
  .status-card {
    background: light-dark(white, hsl(0 0% 12%));
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 22%));
    border-radius: 8px;
    padding: 1.5rem;
  }

  .status-card.compact {
    padding: 1rem;
  }

  .status-card h2 {
    font-size: 1.25rem;
    margin: 0 0 1rem;
  }

  .status-grid {
    display: grid;
    gap: 1rem;
  }

  .status-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.8rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1rem;
    font-weight: 500;
  }

  .role-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    background: light-dark(hsl(210 70% 95%), hsl(210 40% 20%));
    color: light-dark(hsl(210 70% 40%), hsl(210 60% 70%));
    width: fit-content;
  }

  .role-badge.admin {
    background: light-dark(hsl(280 70% 95%), hsl(280 40% 20%));
    color: light-dark(hsl(280 70% 40%), hsl(280 60% 70%));
  }

  .profile-link {
    display: inline-block;
    margin-top: 1rem;
    color: var(--color-main);
    text-decoration: none;
    font-weight: 500;
  }

  .profile-link:hover {
    text-decoration: underline;
  }

  .no-profile {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
  }

  .loading {
    min-height: 120px;
  }

  .skeleton {
    background: light-dark(hsl(0 0% 92%), hsl(0 0% 18%));
    border-radius: 4px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-title {
    width: 50%;
    height: 1.5rem;
    margin-bottom: 1rem;
  }

  .skeleton-text {
    width: 70%;
    height: 1rem;
    margin-bottom: 0.5rem;
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
