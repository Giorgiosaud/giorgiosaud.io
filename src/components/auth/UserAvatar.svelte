<script lang="ts">
import {
  getPermissionState,
  isPushSupported,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from '@lib/push-client'
import {
  $authError as authErrorStore,
  clearAuthError,
  initAuthState,
  $isAdmin as isAdminStore,
  $isAuthenticated as isAuthenticatedStore,
  $isLoading as isLoadingStore,
  logout,
  registerPasskey,
  $user as userStore,
} from '@lib/stores/auth'
import type { User } from 'better-auth/types'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
}

const translations = {
  en: {
    dashboard: 'Dashboard',
    profile: 'Profile',
    addPasskey: 'Add Passkey',
    passkeyAdded: 'Passkey added!',
    notifications: 'Notifications',
    notificationsOn: 'Notifications On',
    notificationsOff: 'Notifications Off',
    signOut: 'Sign Out',
    loading: 'Loading...',
  },
  es: {
    dashboard: 'Panel',
    profile: 'Perfil',
    addPasskey: 'Agregar Passkey',
    passkeyAdded: 'Passkey agregada!',
    notifications: 'Notificaciones',
    notificationsOn: 'Notificaciones On',
    notificationsOff: 'Notificaciones Off',
    signOut: 'Cerrar sesion',
    loading: 'Cargando...',
  },
}

let { lang = 'en' }: Props = $props()

let user = $state<User | null>(null)
let isAuthenticated = $state(false)
let isLoading = $state(true)
let isAdmin = $state(false)
let showMenu = $state(false)
let authError = $state<string | null>(null)
let passkeySuccess = $state(false)
let isAddingPasskey = $state(false)

// Push notification state
let pushSupported = $state(false)
let pushSubscribed = $state(false)
let pushLoading = $state(false)
let pushPermission = $state<NotificationPermission | 'unsupported'>('default')

const t = $derived(translations[lang])

const initials = $derived(
  user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?',
)

// Push user data to dataLayer when authenticated
function pushUserToDataLayer(
  userData: User | null,
  authenticated: boolean,
  admin: boolean,
) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'user_state_update',
      user_logged_in: authenticated,
      user_role: admin ? 'admin' : authenticated ? 'user' : 'guest',
      user_id: userData?.id || null,
    })
  }
}

onMount(() => {
  initAuthState()

  let lastAuthState = false
  const unsub1 = userStore.subscribe(v => (user = v))
  const unsub2 = isAuthenticatedStore.subscribe(v => {
    isAuthenticated = v
    // Push to dataLayer when auth state changes (login/logout)
    if (v !== lastAuthState) {
      lastAuthState = v
      // Small delay to ensure user data is available
      setTimeout(() => pushUserToDataLayer(user, v, isAdmin), 100)
    }
  })
  const unsub3 = isLoadingStore.subscribe(v => (isLoading = v))
  const unsub4 = isAdminStore.subscribe(v => (isAdmin = v))
  const unsub5 = authErrorStore.subscribe(v => (authError = v))

  // Initialize push notification state
  ;(async () => {
    pushSupported = isPushSupported()
    if (pushSupported) {
      pushPermission = getPermissionState()
      pushSubscribed = await isSubscribed()
    }
  })()

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.container')) {
      showMenu = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  return () => {
    unsub1()
    unsub2()
    unsub3()
    unsub4()
    unsub5()
    document.removeEventListener('click', handleClickOutside)
  }
})

async function handleAddPasskey() {
  isAddingPasskey = true
  passkeySuccess = false
  clearAuthError()
  const success = await registerPasskey()
  isAddingPasskey = false
  if (success) {
    passkeySuccess = true
    setTimeout(() => (passkeySuccess = false), 3000)
  }
}

async function handleToggleNotifications() {
  if (!pushSupported || pushLoading) return

  pushLoading = true
  try {
    if (pushSubscribed) {
      const success = await unsubscribeFromPush()
      if (success) pushSubscribed = false
    } else {
      const success = await subscribeToPush()
      if (success) {
        pushSubscribed = true
        pushPermission = getPermissionState()
      } else {
        pushPermission = getPermissionState()
      }
    }
  } finally {
    pushLoading = false
  }
}
</script>

{#if !isAuthenticated}
  <div class="hidden" aria-hidden="true"></div>
{:else if isLoading}
  <div class="container">
    <div class="avatar-placeholder"></div>
  </div>
{:else}
  <div class="container">
    <button
      type="button"
      class="avatar"
      onclick={() => (showMenu = !showMenu)}
      aria-expanded={showMenu}
      aria-haspopup="true"
      title={user?.name ?? "User"}
    >
      {#if user?.image}
        <img
          src={user.image}
          alt={user.name ?? "User avatar"}
          class="avatar-image"
        />
      {:else}
        <span class="initials">{initials}</span>
      {/if}
    </button>

    {#if showMenu}
      <div class="menu" role="menu">
        <div class="user-info">
          <span class="user-name">{user?.name}</span>
          <span class="user-email">{user?.email}</span>
        </div>

        <div class="divider"></div>

        {#if isAdmin}
          <a href="/admin" class="menu-item" role="menuitem">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>{t.dashboard}</span>
          </a>
        {/if}

        <button
          type="button"
          class="menu-item"
          onclick={handleAddPasskey}
          disabled={isAddingPasskey}
          role="menuitem"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"
            />
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
          <span>
            {#if isAddingPasskey}
              ...
            {:else if passkeySuccess}
              {t.passkeyAdded}
            {:else}
              {t.addPasskey}
            {/if}
          </span>
        </button>

        {#if authError}
          <div class="error">{authError}</div>
        {/if}

        {#if pushSupported && pushPermission !== "denied"}
          <button
            type="button"
            class="menu-item"
            class:active={pushSubscribed}
            onclick={handleToggleNotifications}
            disabled={pushLoading}
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              {#if pushSubscribed}
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              {:else}
                <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
                <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                <line x1="1" y1="1" x2="23" y2="23" />
              {/if}
            </svg>
            <span>
              {#if pushLoading}
                ...
              {:else if pushSubscribed}
                {t.notificationsOn}
              {:else}
                {t.notificationsOff}
              {/if}
            </span>
          </button>
        {/if}

        <div class="divider"></div>

        <button
          type="button"
          class="menu-item"
          onclick={logout}
          role="menuitem"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{t.signOut}</span>
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .hidden {
    display: none;
  }

  .container {
    position: relative;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--color-main);
    background: light-dark(hsl(0 0% 95%), hsl(0 0% 20%));
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }

  .avatar:hover {
    transform: scale(1.05);
  }

  .avatar-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: light-dark(hsl(0 0% 90%), hsl(0 0% 25%));
    animation: pulse 1.5s ease-in-out infinite;
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

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .initials {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-main);
  }

  .menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    min-width: 220px;
    background: light-dark(white, hsl(0 0% 15%));
    border: 1px solid light-dark(hsl(0 0% 85%), hsl(0 0% 25%));
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 0.5rem;
    z-index: 100;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.75rem;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .user-email {
    font-size: 0.8rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
  }

  .divider {
    height: 1px;
    background: light-dark(hsl(0 0% 90%), hsl(0 0% 25%));
    margin: 0.5rem 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    color: inherit;
    text-decoration: none;
    text-align: left;
    transition: background-color 0.2s;
  }

  .menu-item:hover:not(:disabled) {
    background: light-dark(hsl(0 0% 95%), hsl(0 0% 20%));
  }

  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-item.active {
    color: light-dark(hsl(142 70% 35%), hsl(142 50% 55%));
  }

  .error {
    padding: 0.5rem 0.75rem;
    background: hsl(0 80% 95%);
    border: 1px solid hsl(0 70% 80%);
    border-radius: 4px;
    color: hsl(0 70% 40%);
    font-size: 0.8rem;
    margin: 0.25rem 0;
  }
</style>
