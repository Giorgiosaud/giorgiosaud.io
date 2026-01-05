<script lang="ts">
import {
  $authError as authErrorStore,
  clearAuthError,
  initAuthState,
  $isAuthenticated as isAuthenticatedStore,
  $isLoading as isLoadingStore,
  loginWithEmail,
  loginWithFacebook,
  loginWithGitHub,
  loginWithGoogle,
  loginWithPasskey,
  $oauthLoading as oauthLoadingStore,
  signUpWithEmail,
} from '@lib/stores/auth'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
}

type AuthMode = 'menu' | 'login' | 'signup'

interface SocialProviders {
  github: boolean
  google: boolean
  facebook: boolean
}

const translations = {
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    loading: 'Loading...',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    loginButton: 'Log In',
    signUpButton: 'Create Account',
    orContinueWith: 'or continue with',
    usePasskey: 'Use Passkey',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    back: 'Back',
  },
  es: {
    signIn: 'Iniciar sesion',
    signUp: 'Registrarse',
    loading: 'Cargando...',
    email: 'Correo electronico',
    password: 'Contrasena',
    name: 'Nombre',
    loginButton: 'Entrar',
    signUpButton: 'Crear Cuenta',
    orContinueWith: 'o continuar con',
    usePasskey: 'Usar Passkey',
    noAccount: 'No tienes cuenta?',
    haveAccount: 'Ya tienes cuenta?',
    back: 'Volver',
  },
}

let { lang = 'en' }: Props = $props()

let isAuthenticated = $state(false)
let isLoading = $state(true)
let authError = $state<string | null>(null)
let oauthLoading = $state<'github' | 'google' | 'facebook' | null>(null)
let showMenu = $state(false)
let mode = $state<AuthMode>('menu')
let email = $state('')
let password = $state('')
let name = $state('')
let containerRef: HTMLDivElement | null = null
let providers = $state<SocialProviders>({
  github: false,
  google: false,
  facebook: false,
})

const t = $derived(translations[lang])
const hasSocialProviders = $derived(
  providers.github || providers.google || providers.facebook,
)

onMount(() => {
  initAuthState()

  // Fetch available social providers
  fetch('/api/auth/providers.json')
    .then(res => res.json())
    .then((data: SocialProviders) => (providers = data))
    .catch(() => {}) // Silently fail - social buttons just won't show

  const unsub1 = isAuthenticatedStore.subscribe(v => (isAuthenticated = v))
  const unsub2 = isLoadingStore.subscribe(v => (isLoading = v))
  const unsub3 = authErrorStore.subscribe(v => (authError = v))
  const unsub4 = oauthLoadingStore.subscribe(v => (oauthLoading = v))

  const handleClickOutside = (e: MouseEvent) => {
    if (!containerRef) return
    const target = e.target as Node
    const isOutside = !containerRef.contains(target)
    if (isOutside) {
      showMenu = false
      mode = 'menu'
      clearAuthError()
    }
  }

  document.addEventListener('click', handleClickOutside)

  return () => {
    unsub1()
    unsub2()
    unsub3()
    unsub4()
    document.removeEventListener('click', handleClickOutside)
  }
})

async function handleEmailLogin(e: Event) {
  e.preventDefault()
  const success = await loginWithEmail(email, password)
  if (success) {
    showMenu = false
    mode = 'menu'
  }
}

async function handleEmailSignUp(e: Event) {
  e.preventDefault()
  const success = await signUpWithEmail(email, password, name)
  if (success) {
    showMenu = false
    mode = 'menu'
  }
}

async function handlePasskeyLogin() {
  const success = await loginWithPasskey()
  if (success) {
    showMenu = false
    mode = 'menu'
  }
}

function goBack() {
  mode = 'menu'
  clearAuthError()
}
</script>

{#if isAuthenticated}
  <div class="hidden" aria-hidden="true"></div>
{:else if isLoading}
  <div class="container">
    <span class="loading">{t.loading}</span>
  </div>
{:else}
  <div class="container" bind:this={containerRef}>
    <button
      type="button"
      class="button"
      onclick={() => (showMenu = !showMenu)}
      aria-expanded={showMenu}
      aria-haspopup="true"
    >
      {t.signIn}
    </button>

    {#if showMenu}
      {#if mode === "menu"}
        <div
          class="menu"
          role="menu"
          onclick={(e) => e.stopPropagation()}
          tabindex="-1"
        >
          <button
            type="button"
            class="menu-item"
            onclick={() => (mode = "login")}
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>{t.signIn}</span>
          </button>
          <button
            type="button"
            class="menu-item"
            onclick={handlePasskeyLogin}
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
            <span>{t.usePasskey}</span>
          </button>
          {#if hasSocialProviders}
            <div class="divider"><span>{t.orContinueWith}</span></div>
            {#if providers.github}
              <button
                type="button"
                class="menu-item"
                onclick={loginWithGitHub}
                role="menuitem"
                disabled={oauthLoading !== null}
              >
                {#if oauthLoading === "github"}
                  <span class="spinner" aria-hidden="true"></span>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                {/if}
                <span>GitHub</span>
              </button>
            {/if}
            {#if providers.google}
              <button
                type="button"
                class="menu-item"
                onclick={loginWithGoogle}
                role="menuitem"
                disabled={oauthLoading !== null}
              >
                {#if oauthLoading === "google"}
                  <span class="spinner" aria-hidden="true"></span>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                {/if}
                <span>Google</span>
              </button>
            {/if}
            {#if providers.facebook}
              <button
                type="button"
                class="menu-item"
                onclick={loginWithFacebook}
                role="menuitem"
                disabled={oauthLoading !== null}
              >
                {#if oauthLoading === "facebook"}
                  <span class="spinner" aria-hidden="true"></span>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                {/if}
                <span>Facebook</span>
              </button>
            {/if}
          {/if}
        </div>
      {:else if mode === "login"}
        <div class="menu" onclick={(e) => e.stopPropagation()}>
          <form onsubmit={handleEmailLogin} class="form">
            <button type="button" class="back-button" onclick={goBack}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              {t.back}
            </button>

            {#if authError}
              <div class="error">{authError}</div>
            {/if}

            <label class="label">
              {t.email}
              <input
                type="email"
                bind:value={email}
                class="input"
                required
                autocomplete="email"
              />
            </label>

            <label class="label">
              {t.password}
              <input
                type="password"
                bind:value={password}
                class="input"
                required
                autocomplete="current-password"
                minlength="8"
              />
            </label>

            <button type="submit" class="submit-button" disabled={isLoading}>
              {isLoading ? t.loading : t.loginButton}
            </button>

            <p class="switch-mode">
              {t.noAccount}
              <button type="button" onclick={() => (mode = "signup")}
                >{t.signUp}</button
              >
            </p>
          </form>
        </div>
      {:else if mode === "signup"}
        <div class="menu" onclick={(e) => e.stopPropagation()}>
          <form onsubmit={handleEmailSignUp} class="form">
            <button type="button" class="back-button" onclick={goBack}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              {t.back}
            </button>

            {#if authError}
              <div class="error">{authError}</div>
            {/if}

            <label class="label">
              {t.name}
              <input
                type="text"
                bind:value={name}
                class="input"
                required
                autocomplete="name"
              />
            </label>

            <label class="label">
              {t.email}
              <input
                type="email"
                bind:value={email}
                class="input"
                required
                autocomplete="email"
              />
            </label>

            <label class="label">
              {t.password}
              <input
                type="password"
                bind:value={password}
                class="input"
                required
                autocomplete="new-password"
                minlength="8"
              />
            </label>

            <button type="submit" class="submit-button" disabled={isLoading}>
              {isLoading ? t.loading : t.signUpButton}
            </button>

            <p class="switch-mode">
              {t.haveAccount}
              <button type="button" onclick={() => (mode = "login")}
                >{t.signIn}</button
              >
            </p>
          </form>
        </div>
      {/if}
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

  .loading {
    font-size: 0.9rem;
    color: light-dark(hsl(0 0% 40%), hsl(0 0% 60%));
  }

  .button {
    padding: 0.5rem 1rem;
    background: var(--color-main);
    color: var(--color-light);
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .button:hover {
    opacity: 0.9;
  }

  .menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    min-width: 280px;
    background: light-dark(white, hsl(0 0% 15%));
    border: 1px solid light-dark(hsl(0 0% 85%), hsl(0 0% 25%));
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 0.5rem;
    z-index: 100;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;
    color: inherit;
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

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid light-dark(hsl(0 0% 85%), hsl(0 0% 30%));
    border-top-color: var(--color-main);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: light-dark(hsl(0 0% 85%), hsl(0 0% 30%));
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    padding: 0;
    font-size: 0.85rem;
    color: light-dark(hsl(0 0% 40%), hsl(0 0% 60%));
    cursor: pointer;
    margin-bottom: 0.5rem;
  }

  .back-button:hover {
    color: var(--color-main);
  }

  .error {
    padding: 0.5rem;
    background: hsl(0 80% 95%);
    border: 1px solid hsl(0 70% 80%);
    border-radius: 4px;
    color: hsl(0 70% 40%);
    font-size: 0.85rem;
  }

  .label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .input {
    padding: 0.5rem;
    border: 1px solid light-dark(hsl(0 0% 80%), hsl(0 0% 30%));
    border-radius: 4px;
    font-size: 0.95rem;
    background: light-dark(white, hsl(0 0% 10%));
    color: inherit;
  }

  .input:focus {
    outline: 2px solid var(--color-main);
    outline-offset: 1px;
  }

  .submit-button {
    padding: 0.6rem 1rem;
    background: var(--color-main);
    color: var(--color-light);
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch-mode {
    font-size: 0.85rem;
    text-align: center;
    color: light-dark(hsl(0 0% 40%), hsl(0 0% 60%));
    margin: 0;
  }

  .switch-mode button {
    background: none;
    border: none;
    color: var(--color-main);
    cursor: pointer;
    font-size: inherit;
    padding: 0;
  }

  .switch-mode button:hover {
    text-decoration: underline;
  }
</style>
