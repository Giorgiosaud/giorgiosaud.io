<script lang="ts">
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

<div class="passkey-manager">
  <div class="header">
    <div>
      <h2>{t.title}</h2>
      <p class="description">{t.description}</p>
    </div>
    <button
      type="button"
      class="add-button"
      onclick={handleAddClick}
      disabled={isAdding}
    >
      {isAdding ? t.adding : t.add}
    </button>
  </div>

  {#if showNamePrompt}
    <div class="name-prompt">
      <input
        type="text"
        bind:value={newPasskeyName}
        placeholder={t.namePlaceholder}
        autofocus
        onkeydown={(e) => e.key === "Enter" && handleAddPasskey()}
      />
      <div class="prompt-actions">
        <button type="button" onclick={handleAddPasskey} disabled={isAdding}>
          {t.add}
        </button>
        <button
          type="button"
          class="cancel"
          onclick={() => (showNamePrompt = false)}
        >
          {t.cancel}
        </button>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if isLoading}
    <div class="loading">
      <div class="skeleton skeleton-item"></div>
      <div class="skeleton skeleton-item"></div>
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
            class="delete-button"
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
  .passkey-manager {
    background: light-dark(white, hsl(0 0% 12%));
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 22%));
    border-radius: 8px;
    padding: 1.5rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .header h2 {
    font-size: 1.25rem;
    margin: 0;
  }

  .description {
    font-size: 0.9rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
    margin: 0.5rem 0 0;
  }

  .add-button {
    padding: 0.5rem 1rem;
    background: var(--color-main);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
  }

  .add-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .add-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .name-prompt {
    background: light-dark(hsl(0 0% 97%), hsl(0 0% 15%));
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 25%));
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .name-prompt input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid light-dark(hsl(0 0% 85%), hsl(0 0% 30%));
    border-radius: 6px;
    background: light-dark(white, hsl(0 0% 18%));
    font-size: 1rem;
    color: inherit;
    margin-bottom: 0.75rem;
  }

  .prompt-actions {
    display: flex;
    gap: 0.5rem;
  }

  .prompt-actions button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .prompt-actions button:first-child {
    background: var(--color-main);
    color: white;
  }

  .prompt-actions button.cancel {
    background: light-dark(hsl(0 0% 90%), hsl(0 0% 25%));
    color: inherit;
  }

  .error {
    padding: 0.75rem;
    background: hsl(0 80% 95%);
    border: 1px solid hsl(0 70% 80%);
    border-radius: 6px;
    color: hsl(0 70% 40%);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .no-passkeys {
    text-align: center;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
    padding: 2rem;
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
    gap: 1rem;
    padding: 1rem;
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 25%));
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  .passkey-info {
    flex: 1;
    min-width: 0;
  }

  .passkey-name {
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
  }

  .passkey-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.8rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
  }

  .detail-label {
    font-weight: 500;
  }

  .delete-button {
    padding: 0.5rem 0.75rem;
    background: transparent;
    color: hsl(0 70% 50%);
    border: 1px solid hsl(0 70% 50%);
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .delete-button:hover:not(:disabled) {
    background: hsl(0 70% 50%);
    color: white;
  }

  .delete-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    padding: 1rem 0;
  }

  .skeleton {
    background: light-dark(hsl(0 0% 92%), hsl(0 0% 18%));
    border-radius: 6px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-item {
    height: 80px;
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
