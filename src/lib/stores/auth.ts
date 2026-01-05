import { passkey, signIn, signOut, signUp } from '@lib/auth-client'
import type { Session, User } from 'better-auth/types'
import { atom, computed } from 'nanostores'

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
    const result = await signIn.email({
      email,
      password,
      fetchOptions: {
        credentials: 'include',
      },
    })
    if (result.error) {
      $authError.set(result.error.message || 'Login failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    console.error('Login error:', error)
    $authError.set(
      error instanceof Error
        ? error.message
        : 'Login failed. Please try again.',
    )
    return false
  } finally {
    $isLoading.set(false)
  }
}

// Email/password signup
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
) {
  $authError.set(null)
  $isLoading.set(true)
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
      $authError.set(result.error.message || 'Sign up failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    console.error('Signup error:', error)
    $authError.set(
      error instanceof Error
        ? error.message
        : 'Sign up failed. Please try again.',
    )
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
        onError: context => {
          console.error(
            'Passkey authentication failed:',
            context.error?.message,
          )
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

// OAuth redirect login - redirects to provider and back
type OAuthProvider = 'github' | 'google' | 'facebook'

function loginWithOAuthRedirect(provider: OAuthProvider) {
  $authError.set(null)
  $oauthLoading.set(provider)
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
