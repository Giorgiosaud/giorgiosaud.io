<script lang="ts">
import '@be-partner-labs/ds/components/card'
import '@be-partner-labs/ds/components/input'
import '@be-partner-labs/ds/components/button'
import '@be-partner-labs/ds/components/alert'
import '@be-partner-labs/ds/components/skeleton'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
}

const translations = {
  en: {
    title: 'Edit Profile',
    displayName: 'Display Name',
    displayNamePlaceholder: 'Enter your display name',
    username: 'Username',
    usernamePlaceholder: 'Choose a unique username',
    usernameHelp: 'Your public profile will be available at /@{username}',
    bio: 'Bio',
    bioPlaceholder: 'Tell us about yourself',
    website: 'Website',
    websitePlaceholder: 'https://yourwebsite.com',
    save: 'Save Changes',
    saving: 'Saving...',
    saved: 'Profile saved!',
    error: 'Failed to save profile',
  },
  es: {
    title: 'Editar Perfil',
    displayName: 'Nombre para Mostrar',
    displayNamePlaceholder: 'Ingresa tu nombre para mostrar',
    username: 'Nombre de Usuario',
    usernamePlaceholder: 'Elige un nombre de usuario unico',
    usernameHelp: 'Tu perfil publico estara disponible en /@{username}',
    bio: 'Biografia',
    bioPlaceholder: 'Cuentanos sobre ti',
    website: 'Sitio Web',
    websitePlaceholder: 'https://tusitio.com',
    save: 'Guardar Cambios',
    saving: 'Guardando...',
    saved: 'Perfil guardado!',
    error: 'Error al guardar perfil',
  },
}

let { lang = 'en' }: Props = $props()

let displayName = $state('')
let username = $state('')
let bio = $state('')
let website = $state('')
let isLoading = $state(true)
let isSaving = $state(false)
let saveSuccess = $state(false)
let saveError = $state<string | null>(null)

const t = $derived(translations[lang])

onMount(() => {
  async function GetProfile() {
    try {
      const res = await fetch('/api/dashboard/profile.json')
      const data = await res.json()

      if (data.user) {
        username = data.user.displayUsername || data.user.username || ''
      }
      if (data.profile) {
        displayName = data.profile.displayName || ''
        bio = data.profile.bio || ''
        website = data.profile.website || ''
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      isLoading = false
    }
  }
  GetProfile()
})

async function handleSubmit(e: Event) {
  e.preventDefault()
  isSaving = true
  saveSuccess = false
  saveError = null

  try {
    const res = await fetch('/api/dashboard/profile.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName,
        username,
        bio,
        website,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || t.error)
    }

    saveSuccess = true
    setTimeout(() => (saveSuccess = false), 3000)
  } catch (err) {
    saveError = err instanceof Error ? err.message : t.error
  } finally {
    isSaving = false
  }
}
</script>

{#if isLoading}
  <div class="bp-card profile-editor loading" aria-busy="true">
    <div class="bp-skeleton bp-skeleton--heading skeleton-title"></div>
    <div class="bp-skeleton skeleton-input"></div>
    <div class="bp-skeleton skeleton-input"></div>
    <div class="bp-skeleton skeleton-textarea"></div>
    <div class="bp-skeleton skeleton-input"></div>
  </div>
{:else}
  <form class="bp-card profile-editor" onsubmit={handleSubmit}>
    <h2>{t.title}</h2>

    <div class="bp-field">
      <label class="bp-field__label" for="displayName">{t.displayName}</label>
      <input
        class="bp-input"
        type="text"
        id="displayName"
        bind:value={displayName}
        placeholder={t.displayNamePlaceholder}
        maxlength="100"
      />
    </div>

    <div class="bp-field">
      <label class="bp-field__label" for="username">{t.username}</label>
      <input
        class="bp-input"
        type="text"
        id="username"
        aria-describedby="username-help"
        bind:value={username}
        placeholder={t.usernamePlaceholder}
        pattern="[a-zA-Z0-9_]+"
        minlength="3"
        maxlength="30"
      />
      <small class="bp-field__hint" id="username-help">
        {t.usernameHelp.replace("{username}", username || "username")}
      </small>
    </div>

    <div class="bp-field">
      <label class="bp-field__label" for="bio">{t.bio}</label>
      <textarea
        class="bp-input"
        id="bio"
        bind:value={bio}
        placeholder={t.bioPlaceholder}
        rows="4"
        maxlength="500"
      ></textarea>
    </div>

    <div class="bp-field">
      <label class="bp-field__label" for="website">{t.website}</label>
      <input
        class="bp-input"
        type="url"
        id="website"
        bind:value={website}
        placeholder={t.websitePlaceholder}
      />
    </div>

    {#if saveError}
      <div class="bp-alert bp-alert--error" role="alert">
        <div class="bp-alert__content">
          <p class="bp-alert__title">{saveError}</p>
        </div>
      </div>
    {/if}

    {#if saveSuccess}
      <div class="bp-alert bp-alert--success" role="status">
        <div class="bp-alert__content">
          <p class="bp-alert__title">{t.saved}</p>
        </div>
      </div>
    {/if}

    <button type="submit" class="bp-btn save-button" disabled={isSaving}>
      {isSaving ? t.saving : t.save}
    </button>
  </form>
{/if}

<style>
  .profile-editor h2 {
    font-size: var(--bp-text-xl);
    margin: 0 0 var(--bp-space-2);
  }

  .save-button {
    width: 100%;
  }

  .loading {
    min-height: 400px;
  }

  .skeleton-input {
    width: 100%;
    height: 2.75rem;
  }

  .skeleton-textarea {
    width: 100%;
    height: 6rem;
  }
</style>
