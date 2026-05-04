import { passkey, signIn, signOut, signUp } from '@lib/auth-client'
import type { Session, User } from 'better-auth/types'
import { atom, computed } from 'nanostores'

// Auth state atoms
export const userStore = atom<User | null>(null)
export const sessionStore = atom<Session | null>(null)
export const isLoadingStore = atom<boolean>(true)
export const authErrorStore = atom<string | null>(null)
export const oauthLoadingStore = atom<'github' | 'google' | 'facebook' | null>(
  null,
)

// Computed stores
export const isAuthenticatedStore = computed(userStore, user => user !== null)
export const isAdminStore = computed(
  userStore,
  user =>
    (
      user as
        | (User & {
            role?: string
          })
        | null
    )?.role === 'admin',
)

// Initialize auth state from server
export async function initAuthState() {
  isLoadingStore.set(true)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch('/api/auth/session.json', {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const data = await response.json()

    if (data.authenticated && data.user) {
      userStore.set(data.user)
      sessionStore.set(data.session)
    } else {
      userStore.set(null)
      sessionStore.set(null)
    }
  } catch (error) {
    console.error('Failed to initialize auth state:', error)
    userStore.set(null)
    sessionStore.set(null)
  } finally {
    isLoadingStore.set(false)
  }
}

// Email/password login
export async function loginWithEmail(email: string, password: string) {
  authErrorStore.set(null)
  isLoadingStore.set(true)
  try {
    const result = await signIn.email({
      email,
      password,
      fetchOptions: {
        credentials: 'include',
      },
    })
    if (result.error) {
      authErrorStore.set(result.error.message || 'Login failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    console.error('Login error:', error)
    authErrorStore.set(
      error instanceof Error
        ? error.message
        : 'Login failed. Please try again.',
    )
    return false
  } finally {
    isLoadingStore.set(false)
  }
}

// Email/password signup
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
) {
  authErrorStore.set(null)
  isLoadingStore.set(true)
  try {
    const result = await signUp.email({
      email,
      password,
      name,
      fetchOptions: {
        credentials: 'include',
      },
    })
    if (result.error) {
      authErrorStore.set(result.error.message || 'Sign up failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    console.error('Signup error:', error)
    authErrorStore.set(
      error instanceof Error
        ? error.message
        : 'Sign up failed. Please try again.',
    )
    return false
  } finally {
    isLoadingStore.set(false)
  }
}

// Passkey login
export async function loginWithPasskey() {
  authErrorStore.set(null)
  isLoadingStore.set(true)
  try {
    // Use signIn.passkey() - the correct method per Better Auth docs
    const result = await signIn.passkey({
      fetchOptions: {
        credentials: 'include',
        onSuccess: async () => {
          await initAuthState()
          isLoadingStore.set(false)
        },
        onError: context => {
          console.error(
            'Passkey authentication failed:',
            context.error?.message,
          )
          authErrorStore.set(context.error?.message || 'Passkey login failed')
          isLoadingStore.set(false)
        },
      },
    })
    if (result?.error) {
      authErrorStore.set(result.error.message || 'Passkey login failed')
      isLoadingStore.set(false)
      return false
    }
    return true
  } catch (error) {
    console.error('Passkey login error:', error)
    authErrorStore.set('Passkey login failed. Please try again.')
    isLoadingStore.set(false)
    return false
  }
}

// Register passkey for current user
export async function registerPasskey(name?: string) {
  authErrorStore.set(null)
  try {
    const result = await passkey.addPasskey({
      name,
    })
    if (result?.error) {
      authErrorStore.set(result.error.message || 'Failed to register passkey')
      return false
    }
    return true
  } catch (_error) {
    authErrorStore.set('Failed to register passkey. Please try again.')
    return false
  }
}

// OAuth redirect login - redirects to provider and back
type OAuthProvider = 'github' | 'google' | 'facebook'

function loginWithOAuthRedirect(provider: OAuthProvider) {
  authErrorStore.set(null)
  oauthLoadingStore.set(provider)
  // Redirect to OAuth provider, return to current page after auth
  signIn.social({
    provider,
    callbackURL: window.location.pathname,
  })
}

// Social login actions
export function loginWithGitHub() {
  loginWithOAuthRedirect('github')
}

export function loginWithGoogle() {
  loginWithOAuthRedirect('google')
}

export function loginWithFacebook() {
  loginWithOAuthRedirect('facebook')
}

// Logout action
export async function logout() {
  try {
    await signOut()
    userStore.set(null)
    sessionStore.set(null)
    window.location.href = '/'
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}

// Clear error
export function clearAuthError() {
  authErrorStore.set(null)
}
