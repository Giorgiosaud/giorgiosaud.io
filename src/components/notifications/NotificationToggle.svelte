<script lang="ts">
import {
  getPermissionState,
  isPushSupported,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from '@lib/push-client'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
}

const translations = {
  en: {
    enable: 'Enable notifications',
    disable: 'Disable notifications',
    notSupported: 'Not supported',
    denied: 'Blocked',
    enabling: 'Enabling...',
    disabling: 'Disabling...',
    tooltip: 'Get notified when someone replies to your comments',
    deniedTooltip: 'Notifications blocked. Enable in browser settings.',
  },
  es: {
    enable: 'Activar notificaciones',
    disable: 'Desactivar notificaciones',
    notSupported: 'No soportado',
    denied: 'Bloqueadas',
    enabling: 'Activando...',
    disabling: 'Desactivando...',
    tooltip: 'Recibe notificaciones cuando alguien responda a tus comentarios',
    deniedTooltip:
      'Notificaciones bloqueadas. Activa en configuracion del navegador.',
  },
}

let { lang = 'en' }: Props = $props()

let supported = $state(false)
let permission = $state<NotificationPermission | 'unsupported'>('default')
let subscribed = $state(false)
let loading = $state(true)
let actionLoading = $state(false)

const t = $derived(translations[lang])

onMount(async () => {
  supported = isPushSupported()
  if (supported) {
    permission = getPermissionState()
    subscribed = await isSubscribed()
  }
  loading = false
})

async function handleToggle() {
  if (!supported || actionLoading) return

  actionLoading = true
  try {
    if (subscribed) {
      const success = await unsubscribeFromPush()
      if (success) subscribed = false
    } else {
      const success = await subscribeToPush()
      if (success) {
        subscribed = true
        permission = getPermissionState()
      } else {
        permission = getPermissionState()
      }
    }
  } finally {
    actionLoading = false
  }
}
</script>

{#if loading}
  <div class="notification-toggle loading" aria-hidden="true">
    <span class="icon">🔔</span>
  </div>
{:else if !supported}
  <div class="notification-toggle disabled" title={t.notSupported}>
    <span class="icon">🔕</span>
    <span class="label">{t.notSupported}</span>
  </div>
{:else if permission === 'denied'}
  <div class="notification-toggle disabled" title={t.deniedTooltip}>
    <span class="icon">🚫</span>
    <span class="label">{t.denied}</span>
  </div>
{:else}
  <button
    type="button"
    class="notification-toggle"
    class:active={subscribed}
    onclick={handleToggle}
    disabled={actionLoading}
    title={t.tooltip}
  >
    <span class="icon">{subscribed ? '🔔' : '🔕'}</span>
    <span class="label">
      {#if actionLoading}
        {subscribed ? t.disabling : t.enabling}
      {:else}
        {subscribed ? t.disable : t.enable}
      {/if}
    </span>
  </button>
{/if}

<style>
  .notification-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid light-dark(hsl(0 0% 80%), hsl(0 0% 30%));
    border-radius: 6px;
    background: light-dark(white, hsl(0 0% 15%));
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .notification-toggle:hover:not(:disabled):not(.disabled) {
    border-color: var(--color-main);
  }

  .notification-toggle.active {
    background: light-dark(hsl(142 70% 95%), hsl(142 40% 20%));
    border-color: light-dark(hsl(142 70% 50%), hsl(142 40% 40%));
  }

  .notification-toggle.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .notification-toggle.loading {
    opacity: 0.5;
  }

  .notification-toggle:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .icon {
    font-size: 1rem;
  }

  .label {
    color: inherit;
  }
</style>
