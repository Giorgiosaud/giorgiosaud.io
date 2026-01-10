<script lang="ts">
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

onMount(async () => {
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
  <div class="profile-editor loading">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-input"></div>
    <div class="skeleton skeleton-input"></div>
    <div class="skeleton skeleton-textarea"></div>
    <div class="skeleton skeleton-input"></div>
  </div>
{:else}
  <form class="profile-editor" onsubmit={handleSubmit}>
    <h2>{t.title}</h2>

    <div class="form-group">
      <label for="displayName">{t.displayName}</label>
      <input
        type="text"
        id="displayName"
        bind:value={displayName}
        placeholder={t.displayNamePlaceholder}
        maxlength="100"
      />
    </div>

    <div class="form-group">
      <label for="username">{t.username}</label>
      <input
        type="text"
        id="username"
        bind:value={username}
        placeholder={t.usernamePlaceholder}
        pattern="[a-zA-Z0-9_]+"
        minlength="3"
        maxlength="30"
      />
      <small class="help-text">
        {t.usernameHelp.replace("{username}", username || "username")}
      </small>
    </div>

    <div class="form-group">
      <label for="bio">{t.bio}</label>
      <textarea
        id="bio"
        bind:value={bio}
        placeholder={t.bioPlaceholder}
        rows="4"
        maxlength="500"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="website">{t.website}</label>
      <input
        type="url"
        id="website"
        bind:value={website}
        placeholder={t.websitePlaceholder}
      />
    </div>

    {#if saveError}
      <div class="error">{saveError}</div>
    {/if}

    {#if saveSuccess}
      <div class="success">{t.saved}</div>
    {/if}

    <button type="submit" class="save-button" disabled={isSaving}>
      {isSaving ? t.saving : t.save}
    </button>
  </form>
{/if}

<style>
  .profile-editor {
    background: light-dark(white, hsl(0 0% 12%));
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 22%));
    border-radius: 8px;
    padding: 1.5rem;
  }

  .profile-editor h2 {
    font-size: 1.25rem;
    margin: 0 0 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid light-dark(hsl(0 0% 85%), hsl(0 0% 30%));
    border-radius: 6px;
    background: light-dark(white, hsl(0 0% 15%));
    font-size: 1rem;
    color: inherit;
    transition: border-color 0.2s;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-main);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .help-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
  }

  .save-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: var(--color-main);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .save-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .success {
    padding: 0.75rem;
    background: hsl(142 70% 95%);
    border: 1px solid hsl(142 50% 70%);
    border-radius: 6px;
    color: hsl(142 60% 30%);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .loading {
    min-height: 400px;
  }

  .skeleton {
    background: light-dark(hsl(0 0% 92%), hsl(0 0% 18%));
    border-radius: 4px;
    animation: pulse 1.5s ease-in-out infinite;
    margin-bottom: 1rem;
  }

  .skeleton-title {
    width: 40%;
    height: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .skeleton-input {
    width: 100%;
    height: 2.75rem;
  }

  .skeleton-textarea {
    width: 100%;
    height: 6rem;
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
