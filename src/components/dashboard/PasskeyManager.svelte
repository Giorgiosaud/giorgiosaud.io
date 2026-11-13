<script lang="ts">
import '@be-partner-labs/ds/components/card'
import '@be-partner-labs/ds/components/input'
import '@be-partner-labs/ds/components/button'
import '@be-partner-labs/ds/components/alert'
import '@be-partner-labs/ds/components/skeleton'
import { passkey } from '@lib/auth-client'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
}

interface PasskeyItem {
  id: string
  name: string | null
  deviceType: string
  backedUp: boolean
  createdAt: string | null
}

const translations = {
  en: {
    title: 'Passkeys',
    description: 'Manage your passkeys for secure, passwordless login.',
    add: 'Add Passkey',
    adding: 'Adding...',
    namePrompt: 'Enter a name for this passkey',
    namePlaceholder: 'e.g., MacBook Touch ID',
    noPasskeys: 'No passkeys registered yet.',
    delete: 'Delete',
    deleting: 'Deleting...',
    confirmDelete: 'Are you sure you want to delete this passkey?',
    deviceType: 'Device Type',
    backedUp: 'Backed Up',
    createdAt: 'Added',
    error: 'Failed to manage passkey',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
  },
  es: {
    title: 'Llaves de Acceso',
    description:
      'Administra tus llaves de acceso para inicio de sesion seguro sin contrasena.',
    add: 'Agregar Llave',
    adding: 'Agregando...',
    namePrompt: 'Ingresa un nombre para esta llave de acceso',
    namePlaceholder: 'ej., MacBook Touch ID',
    noPasskeys: 'No hay llaves de acceso registradas.',
    delete: 'Eliminar',
    deleting: 'Eliminando...',
    confirmDelete: 'Estas seguro de que quieres eliminar esta llave de acceso?',
    deviceType: 'Tipo de Dispositivo',
    backedUp: 'Respaldado',
    createdAt: 'Agregado',
    error: 'Error al administrar llave de acceso',
    yes: 'Si',
    no: 'No',
    cancel: 'Cancelar',
  },
}

let { lang = 'en' }: Props = $props()

let passkeys = $state<PasskeyItem[]>([])
let isLoading = $state(true)
let isAdding = $state(false)
let deletingId = $state<string | null>(null)
let error = $state<string | null>(null)
let showNamePrompt = $state(false)
let newPasskeyName = $state('')

const t = $derived(translations[lang])

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

async function loadPasskeys() {
  try {
    const res = await fetch('/api/dashboard/passkeys/index.json')
    const data = await res.json()
    if (data.passkeys) {
      passkeys = data.passkeys
    }
  } catch (err) {
    console.error('Failed to load passkeys:', err)
    error = t.error
  } finally {
    isLoading = false
  }
}

onMount(() => {
  loadPasskeys()
})

function handleAddClick() {
  showNamePrompt = true
  newPasskeyName = ''
  error = null
}

async function handleAddPasskey() {
  if (!newPasskeyName.trim()) {
    error = t.namePrompt
    return
  }

  isAdding = true
  error = null
  showNamePrompt = false

  try {
    const result = await passkey.addPasskey({
      name: newPasskeyName.trim(),
    })

    if (result?.error) {
      throw new Error(result.error.message || t.error)
    }

    // Reload passkeys list
    await loadPasskeys()
    newPasskeyName = ''
  } catch (err) {
    error = err instanceof Error ? err.message : t.error
  } finally {
    isAdding = false
  }
}

async function handleDelete(id: string) {
  if (!confirm(t.confirmDelete)) return

  deletingId = id
  error = null

  try {
    const res = await fetch(`/api/dashboard/passkeys/${id}.json`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || t.error)
    }

    passkeys = passkeys.filter(p => p.id !== id)
  } catch (err) {
    error = err instanceof Error ? err.message : t.error
  } finally {
    deletingId = null
  }
}
</script>

<div class="bp-card passkey-manager">
  <div class="header">
    <div>
      <h2>{t.title}</h2>
      <p class="description">{t.description}</p>
    </div>
    <button
      type="button"
      class="bp-btn bp-btn--sm"
      onclick={handleAddClick}
      disabled={isAdding}
    >
      {isAdding ? t.adding : t.add}
    </button>
  </div>

  {#if showNamePrompt}
    <div class="bp-field name-prompt">
      <label class="bp-field__label" for="passkey-name">{t.namePrompt}</label>
      <input
        class="bp-input"
        id="passkey-name"
        type="text"
        bind:value={newPasskeyName}
        placeholder={t.namePlaceholder}
        autofocus
        onkeydown={(e) => e.key === "Enter" && handleAddPasskey()}
      />
      <div class="prompt-actions">
        <button type="button" class="bp-btn bp-btn--sm" onclick={handleAddPasskey} disabled={isAdding}>
          {t.add}
        </button>
        <button
          type="button"
          class="bp-btn bp-btn--sm bp-btn--secondary"
          onclick={() => (showNamePrompt = false)}
        >
          {t.cancel}
        </button>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="bp-alert bp-alert--error" role="alert">
      <div class="bp-alert__content">
        <p class="bp-alert__title">{error}</p>
      </div>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading" aria-busy="true">
      <div class="bp-skeleton skeleton-item"></div>
      <div class="bp-skeleton skeleton-item"></div>
    </div>
  {:else if passkeys.length === 0}
    <p class="no-passkeys">{t.noPasskeys}</p>
  {:else}
    <ul class="passkey-list">
      {#each passkeys as pk (pk.id)}
        <li class="passkey-item">
          <div class="passkey-info">
            <span class="passkey-name">{pk.name || "Passkey"}</span>
            <div class="passkey-details">
              <span class="detail">
                <span class="detail-label">{t.deviceType}:</span>
                {pk.deviceType}
              </span>
              <span class="detail">
                <span class="detail-label">{t.backedUp}:</span>
                {pk.backedUp ? t.yes : t.no}
              </span>
              <span class="detail">
                <span class="detail-label">{t.createdAt}:</span>
                {formatDate(pk.createdAt)}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="bp-btn bp-btn--sm bp-btn--secondary delete-button"
            onclick={() => handleDelete(pk.id)}
            disabled={deletingId === pk.id}
          >
            {deletingId === pk.id ? t.deleting : t.delete}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--bp-space-4);
  }

  .header h2 {
    font-size: var(--bp-text-xl);
    margin: 0;
  }

  .description {
    font-size: var(--bp-text-sm);
    color: var(--bp-color-text-muted);
    margin: var(--bp-space-2) 0 0;
  }

  .name-prompt {
    background: var(--bp-color-bg-subtle);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-md);
    padding: var(--bp-space-4);
  }

  .prompt-actions {
    display: flex;
    gap: var(--bp-space-2);
  }

  .no-passkeys {
    text-align: center;
    color: var(--bp-color-text-muted);
    padding: var(--bp-space-8);
  }

  .passkey-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .passkey-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--bp-space-4);
    padding: var(--bp-space-4);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-md);
    margin-bottom: var(--bp-space-2);
  }

  .passkey-info {
    flex: 1;
    min-width: 0;
  }

  .passkey-name {
    font-weight: var(--bp-font-weight-semibold);
    display: block;
    margin-bottom: var(--bp-space-2);
  }

  .passkey-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--bp-space-3);
    font-size: var(--bp-text-xs);
    color: var(--bp-color-text-muted);
  }

  .detail-label {
    font-weight: var(--bp-font-weight-medium);
  }

  /* Outline danger: secondary button recolored through its public tokens */
  .delete-button {
    --btn-background: transparent;
    --btn-color: var(--bp-color-error);
    --btn-border: 1px solid var(--bp-color-error);
  }

  .delete-button:hover {
    --btn-background: var(--bp-color-error-surface);
    --btn-color: #fff;
  }

  .loading {
    padding: var(--bp-space-4) 0;
  }

  .skeleton-item {
    height: 80px;
    margin-bottom: var(--bp-space-2);
  }
</style>
