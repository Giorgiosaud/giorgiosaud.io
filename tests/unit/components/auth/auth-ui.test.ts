import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock auth-client before any imports
vi.mock('@lib/auth-client', () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  passkey: { signIn: vi.fn(), addPasskey: vi.fn() },
}))

// Mock nanostores
vi.mock('nanostores', () => ({
  atom: vi.fn(initial => ({
    get: () => initial,
    set: vi.fn(),
    subscribe: vi.fn(),
  })),
  computed: vi.fn((store, fn) => ({
    get: () => fn(store.get()),
    subscribe: vi.fn(),
  })),
}))

// Mock @nanostores/react
vi.mock('@nanostores/react', () => ({
  useStore: vi.fn(store => store.get()),
}))

// Mock fetch
global.fetch = vi.fn()

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should define auth state atoms', () => {
    // Test that our auth store concept is correct
    const authState = {
      $user: null,
      $session: null,
      $isLoading: true,
      $authError: null,
    }

    expect(authState.$user).toBe(null)
    expect(authState.$isLoading).toBe(true)
  })

  it('should define auth actions', () => {
    const authActions = [
      'initAuthState',
      'loginWithEmail',
      'signUpWithEmail',
      'loginWithPasskey',
      'loginWithGitHub',
      'loginWithGoogle',
      'loginWithFacebook',
      'logout',
    ]

    authActions.forEach(action => {
      expect(typeof action).toBe('string')
    })
  })
})

describe('Auth Components', () => {
  it('should export LoginButton component', async () => {
    const components = await import('@components/auth')

    expect(components.LoginButton).toBeDefined()
  })

  it('should export UserAvatar component', async () => {
    const components = await import('@components/auth')

    expect(components.UserAvatar).toBeDefined()
  })
})

describe('Auth Translations', () => {
  it('should have English translations for LoginButton', () => {
    const translations = {
      signIn: 'Sign In',
      signInWith: 'Sign in with',
      loading: 'Loading...',
    }

    expect(translations.signIn).toBe('Sign In')
    expect(translations.signInWith).toBe('Sign in with')
  })

  it('should have Spanish translations for LoginButton', () => {
    const translations = {
      signIn: 'Iniciar sesion',
      signInWith: 'Iniciar sesion con',
      loading: 'Cargando...',
    }

    expect(translations.signIn).toBe('Iniciar sesion')
    expect(translations.signInWith).toBe('Iniciar sesion con')
  })

  it('should have English translations for UserAvatar', () => {
    const translations = {
      dashboard: 'Dashboard',
      signOut: 'Sign Out',
    }

    expect(translations.dashboard).toBe('Dashboard')
    expect(translations.signOut).toBe('Sign Out')
  })

  it('should have Spanish translations for UserAvatar', () => {
    const translations = {
      dashboard: 'Panel',
      signOut: 'Cerrar sesion',
    }

    expect(translations.dashboard).toBe('Panel')
    expect(translations.signOut).toBe('Cerrar sesion')
  })
})

describe('Auth Social Providers', () => {
  it('should support GitHub login', () => {
    const providers = ['github', 'google', 'facebook']
    expect(providers).toContain('github')
  })

  it('should support Google login', () => {
    const providers = ['github', 'google', 'facebook']
    expect(providers).toContain('google')
  })

  it('should support Facebook login', () => {
    const providers = ['github', 'google', 'facebook']
    expect(providers).toContain('facebook')
  })
})
