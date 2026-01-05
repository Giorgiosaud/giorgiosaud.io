import { atom, computed } from 'nanostores'
import type { User, Session } from 'better-auth/types'
import { signIn, signUp, signOut, passkey } from '@lib/auth-client'

// Auth state atoms
export const $user = atom<User | null>(null)
export const $session = atom<Session | null>(null)
export const $isLoading = atom<boolean>(true)
export const $authError = atom<string | null>(null)
export const $oauthLoading = atom<'github' | 'google' | 'facebook' | null>(null)

// Computed stores
export const $isAuthenticated = computed($user, user => user !== null)
export const $isAdmin = computed(
  $user,
  user => (user as (User & { role?: string }) | null)?.role === 'admin'
)

// Initialize auth state from server
export async function initAuthState() {
  $isLoading.set(true)
  try {
    const response = await fetch('/api/auth/session.json')
    const data = await response.json()

    if (data.authenticated && data.user) {
      $user.set(data.user)
      $session.set(data.session)
    } else {
      $user.set(null)
      $session.set(null)
    }
  } catch (error) {
    console.error('Failed to initialize auth state:', error)
    $user.set(null)
    $session.set(null)
  } finally {
    $isLoading.set(false)
  }
}

// Email/password login
export async function loginWithEmail(email: string, password: string) {
  $authError.set(null)
  $isLoading.set(true)
  try {
    const result = await signIn.email({ email, password, fetchOptions: { credentials: 'include' } })
    if (result.error) {
      $authError.set(result.error.message || 'Login failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    console.error('Login error:', error)
    $authError.set(error instanceof Error ? error.message : 'Login failed. Please try again.')
    return false
  } finally {
    $isLoading.set(false)
  }
}

// Email/password signup
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  $authError.set(null)
  $isLoading.set(true)
  try {
    const result = await signUp.email({ email, password, name, fetchOptions: { credentials: 'include' } })
    if (result.error) {
      $authError.set(result.error.message || 'Sign up failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    console.error('Signup error:', error)
    $authError.set(error instanceof Error ? error.message : 'Sign up failed. Please try again.')
    return false
  } finally {
    $isLoading.set(false)
  }
}

// Passkey login
export async function loginWithPasskey() {
  $authError.set(null)
  $isLoading.set(true)
  try {
    // Use signIn.passkey() - the correct method per Better Auth docs
    const result = await signIn.passkey({
      fetchOptions: {
        credentials: 'include',
        onSuccess: async () => {
          await initAuthState()
          $isLoading.set(false)
        },
        onError: (context) => {
          console.error('Passkey authentication failed:', context.error?.message)
          $authError.set(context.error?.message || 'Passkey login failed')
          $isLoading.set(false)
        },
      },
    })
    if (result?.error) {
      $authError.set(result.error.message || 'Passkey login failed')
      $isLoading.set(false)
      return false
    }
    return true
  } catch (error) {
    console.error('Passkey login error:', error)
    $authError.set('Passkey login failed. Please try again.')
    $isLoading.set(false)
    return false
  }
}

// Register passkey for current user
export async function registerPasskey() {
  $authError.set(null)
  try {
    const result = await passkey.addPasskey()
    if (result?.error) {
      $authError.set(result.error.message || 'Failed to register passkey')
      return false
    }
    return true
  } catch (error) {
    $authError.set('Failed to register passkey. Please try again.')
    return false
  }
}

// OAuth popup login - opens provider in popup window
type OAuthProvider = 'github' | 'google' | 'facebook'

async function loginWithOAuthPopup(provider: OAuthProvider) {
  $authError.set(null)
  $oauthLoading.set(provider)

  const width = 600
  const height = 700
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  // Open popup immediately (must be synchronous to avoid popup blocker)
  const popup = window.open(
    '',
    `${provider}-oauth`,
    `width=${width},height=${height},left=${left},top=${top}`
  )

  if (!popup) {
    // Popup blocked - fall back to redirect
    $oauthLoading.set(null)
    signIn.social({ provider, callbackURL: window.location.href })
    return
  }

  // Show loading state in popup
  popup.document.write(`
    <html>
      <head>
        <title>Connecting to ${provider}...</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f8f9fa;
            color: #333;
          }
          .loader {
            width: 48px;
            height: 48px;
            border: 4px solid #e0e0e0;
            border-top-color: #333;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 1.5rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p {
            font-size: 1.1rem;
            margin: 0;
            opacity: 0.9;
          }
          .dots::after {
            content: '';
            animation: dots 1.5s steps(4, end) infinite;
          }
          @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
          }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <p>Connecting to ${provider}<span class="dots"></span></p>
      </body>
    </html>
  `)

  try {
    // Get OAuth URL from Better Auth
    const result = await signIn.social({
      provider,
      callbackURL: '/auth/callback',
      disableRedirect: true,
    })

    if (!result.data?.url) {
      popup.close()
      throw new Error('Failed to get OAuth URL')
    }

    // Navigate popup to OAuth URL
    popup.location.href = result.data.url

    let timeoutId: number | null = null

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('message', handleMessage)
      $oauthLoading.set(null)
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data.type === 'oauth-success') {
        cleanup()
        initAuthState()
      }
    }

    // Recursive setTimeout - cleaner than setInterval
    const checkPopupClosed = () => {
      if (popup.closed) {
        cleanup()
      } else {
        timeoutId = window.setTimeout(checkPopupClosed, 500)
      }
    }

    window.addEventListener('message', handleMessage)
    checkPopupClosed()
  } catch (error) {
    console.error('OAuth popup error:', error)
    $oauthLoading.set(null)
    $authError.set('Failed to start authentication')
  }
}

// Social login actions
export function loginWithGitHub() {
  loginWithOAuthPopup('github')
}

export function loginWithGoogle() {
  loginWithOAuthPopup('google')
}

export function loginWithFacebook() {
  loginWithOAuthPopup('facebook')
}

// Logout action
export async function logout() {
  try {
    await signOut()
    $user.set(null)
    $session.set(null)
    window.location.href = '/'
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}

// Clear error
export function clearAuthError() {
  $authError.set(null)
}
