<script lang="ts">
import {
  getPermissionState,
  isPushSupported,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from '@lib/push-client'
import {
  authErrorStore,
  clearAuthError,
  initAuthState,
  isAdminStore,
  isAuthenticatedStore,
  isLoadingStore,
  logout,
  registerPasskey,
  userStore,
} from '@lib/stores/auth'
import type { User } from 'better-auth/types'
import { onMount } from 'svelte'
import '@be-partner-labs/ds/components/alert'
import '@be-partner-labs/ds/components/skeleton'

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

let authError = $state<string | null>(null)
let showMenu = $state(false)
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

function pushUserToDataLayer(
  userData: {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
    emailVerified: boolean
    name: string
    image?: string | null | undefined
  } | null,
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
  async function initNotifications() {
    pushSupported = isPushSupported()
    if (pushSupported) {
      pushPermission = getPermissionState()
      pushSubscribed = await isSubscribed()
    }
  }
  initNotifications()

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
    <div class="bp-skeleton bp-skeleton--circle avatar-placeholder" aria-hidden="true"></div>
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

        <div class="divider" role="separator"></div>

        {#if isAdmin}
          <a href="/admin" class="menu-item" role="menuitem">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>{t.dashboard}</span>
          </a>
          <a href="/admin/notifications" class="menu-item" role="menuitem">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              <line x1="1" y1="1" x2="5" y2="5" class="hidden" />
            </svg>
            <span>{t.notifications}</span>
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
          <div class="bp-alert bp-alert--error menu-alert" role="alert">
            <div class="bp-alert__content">
              <p class="bp-alert__body">{authError}</p>
            </div>
          </div>
        {/if}

        {#if pushSupported && pushPermission !== "denied"}
          <button
            type="button"
            class="menu-item"
            onclick={handleToggleNotifications}
            disabled={pushLoading}
            role="menuitemcheckbox"
            aria-checked={pushSubscribed}
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

        <div class="divider" role="separator"></div>

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
    border-radius: var(--bp-radius-full);
    border: 2px solid var(--site-color-accent);
    background: var(--bp-color-bg-subtle);
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--bp-duration-fast) var(--bp-ease);
  }

  .avatar:hover {
    transform: scale(1.05);
  }

  .avatar:focus-visible {
    outline: none;
    box-shadow: var(--bp-focus-ring);
  }

  .avatar-placeholder {
    width: 36px;
    height: 36px;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .initials {
    font-size: var(--bp-text-sm);
    font-weight: var(--bp-font-weight-semibold);
    color: var(--site-color-accent);
  }

  .menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--bp-space-2);
    min-width: 220px;
    background: var(--bp-color-bg-elevated);
    color: var(--bp-color-text);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-lg);
    box-shadow: var(--bp-shadow-lg);
    padding: var(--bp-space-2);
    z-index: 100;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    padding: var(--bp-space-2) var(--bp-space-3);
  }

  .user-name {
    font-weight: var(--bp-font-weight-semibold);
    font-size: var(--bp-text-sm);
  }

  .user-email {
    font-size: var(--bp-text-xs);
    color: var(--bp-color-text-muted);
  }

  .divider {
    height: 1px;
    background: var(--bp-color-border);
    margin: var(--bp-space-2) 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: var(--bp-space-3);
    width: 100%;
    padding: var(--bp-space-2) var(--bp-space-3);
    background: none;
    border: none;
    border-radius: var(--bp-radius-md);
    font-size: var(--bp-text-sm);
    cursor: pointer;
    color: inherit;
    text-decoration: none;
    text-align: left;
    transition: background-color var(--bp-duration-fast) var(--bp-ease);
  }

  .menu-item:hover:not(:disabled) {
    background: var(--bp-color-bg-subtle);
  }

  .menu-item:focus-visible {
    outline: none;
    box-shadow: var(--bp-focus-ring);
  }

  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-item[aria-checked="true"] {
    color: var(--bp-color-success);
  }

  .menu-alert {
    margin: var(--bp-space-1) 0;
  }
</style>
