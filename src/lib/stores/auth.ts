import { atom, computed } from 'nanostores'
import type { User, Session } from 'better-auth/types'
import { signIn, signUp, signOut, passkey } from '@lib/auth-client'

// Auth state atoms
export const $user = atom<User | null>(null)
export const $session = atom<Session | null>(null)
export const $isLoading = atom<boolean>(true)
export const $authError = atom<string | null>(null)

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
    const result = await signIn.email({ email, password })
    if (result.error) {
      $authError.set(result.error.message || 'Login failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    $authError.set('Login failed. Please try again.')
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
    const result = await signUp.email({ email, password, name })
    if (result.error) {
      $authError.set(result.error.message || 'Sign up failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    $authError.set('Sign up failed. Please try again.')
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
    const result = await passkey.signIn()
    if (result?.error) {
      $authError.set(result.error.message || 'Passkey login failed')
      return false
    }
    await initAuthState()
    return true
  } catch (error) {
    $authError.set('Passkey login failed. Please try again.')
    return false
  } finally {
    $isLoading.set(false)
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

// Social login actions
export function loginWithGitHub() {
  window.location.href = '/api/auth/sign-in/social?provider=github'
}

export function loginWithGoogle() {
  window.location.href = '/api/auth/sign-in/social?provider=google'
}

export function loginWithFacebook() {
  window.location.href = '/api/auth/sign-in/social?provider=facebook'
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
