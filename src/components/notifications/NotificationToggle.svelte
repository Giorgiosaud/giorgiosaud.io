<script lang="ts">
import '@be-partner-labs/ds/components/button'
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
    <span class="icon" aria-hidden="true">🔕</span>
    <span class="label">{t.notSupported}</span>
  </div>
{:else if permission === 'denied'}
  <div class="notification-toggle disabled" title={t.deniedTooltip}>
    <span class="icon" aria-hidden="true">🚫</span>
    <span class="label">{t.denied}</span>
  </div>
{:else}
  <button
    type="button"
    class="bp-btn bp-btn--sm bp-btn--secondary notification-button"
    data-subscribed={subscribed ? 'true' : undefined}
    aria-busy={actionLoading ? 'true' : undefined}
    onclick={handleToggle}
    disabled={actionLoading}
    title={t.tooltip}
  >
    <span class="icon" aria-hidden="true">{subscribed ? '🔔' : '🔕'}</span>
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
  /* Status chip shown while loading / when push is unavailable (not a control) */
  .notification-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--bp-space-2);
    padding: var(--bp-space-2) var(--bp-space-3);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-md);
    background: var(--bp-color-bg-subtle);
    color: var(--bp-color-text-muted);
    font-size: var(--bp-text-sm);
  }

  .notification-toggle.disabled {
    cursor: not-allowed;
  }

  .notification-toggle.loading {
    opacity: 0.5;
  }

  /* Subscribed: tinted success through the button's public tokens */
  .notification-button[data-subscribed='true'] {
    --btn-background: color-mix(in srgb, var(--bp-color-success) 12%, transparent);
    --btn-border: 1px solid var(--bp-color-success);
  }

  .notification-button[aria-busy='true'] {
    cursor: wait;
  }

  .icon {
    font-size: var(--bp-text-base);
  }
</style>
