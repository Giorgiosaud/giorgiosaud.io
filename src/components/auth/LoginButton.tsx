import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'
import {
  $isAuthenticated,
  $isLoading,
  $authError,
  initAuthState,
  loginWithEmail,
  signUpWithEmail,
  loginWithPasskey,
  loginWithGitHub,
  loginWithGoogle,
  loginWithFacebook,
  clearAuthError,
} from '@lib/stores/auth'
import styles from './LoginButton.module.css'

interface Props {
  lang?: 'en' | 'es'
}

type AuthMode = 'menu' | 'login' | 'signup'

const translations = {
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signInWith: 'Sign in with',
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
    signInWith: 'Iniciar sesion con',
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

export default function LoginButton({ lang = 'en' }: Props) {
  const isAuthenticated = useStore($isAuthenticated)
  const isLoading = useStore($isLoading)
  const authError = useStore($authError)
  const [showMenu, setShowMenu] = useState(false)
  const [mode, setMode] = useState<AuthMode>('menu')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const t = translations[lang]

  useEffect(() => {
    initAuthState()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(`.${styles.container}`)) {
        setShowMenu(false)
        setMode('menu')
        clearAuthError()
      }
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  // Don't render if authenticated (UserAvatar will show instead)
  if (isAuthenticated) {
    return <div className={styles.hidden} aria-hidden="true" />
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <span className={styles.loading}>{t.loading}</span>
      </div>
    )
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await loginWithEmail(email, password)
    if (success) {
      setShowMenu(false)
      setMode('menu')
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await signUpWithEmail(email, password, name)
    if (success) {
      setShowMenu(false)
      setMode('menu')
    }
  }

  const handlePasskeyLogin = async () => {
    const success = await loginWithPasskey()
    if (success) {
      setShowMenu(false)
      setMode('menu')
    }
  }

  const renderMenu = () => (
    <div className={styles.menu} role="menu">
      <button
        type="button"
        className={styles.menuItem}
        onClick={() => setMode('login')}
        role="menuitem"
      >
        <EmailIcon />
        <span>{t.signIn}</span>
      </button>
      <button
        type="button"
        className={styles.menuItem}
        onClick={handlePasskeyLogin}
        role="menuitem"
      >
        <PasskeyIcon />
        <span>{t.usePasskey}</span>
      </button>
      <div className={styles.divider}>
        <span>{t.orContinueWith}</span>
      </div>
      <button
        type="button"
        className={styles.menuItem}
        onClick={loginWithGitHub}
        role="menuitem"
      >
        <GitHubIcon />
        <span>GitHub</span>
      </button>
      <button
        type="button"
        className={styles.menuItem}
        onClick={loginWithGoogle}
        role="menuitem"
      >
        <GoogleIcon />
        <span>Google</span>
      </button>
      <button
        type="button"
        className={styles.menuItem}
        onClick={loginWithFacebook}
        role="menuitem"
      >
        <FacebookIcon />
        <span>Facebook</span>
      </button>
    </div>
  )

  const renderLoginForm = () => (
    <div className={styles.menu}>
      <form onSubmit={handleEmailLogin} className={styles.form}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => {
            setMode('menu')
            clearAuthError()
          }}
        >
          <BackIcon /> {t.back}
        </button>

        {authError && <div className={styles.error}>{authError}</div>}

        <label className={styles.label}>
          {t.email}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            required
            autoComplete="email"
          />
        </label>

        <label className={styles.label}>
          {t.password}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.input}
            required
            autoComplete="current-password"
            minLength={8}
          />
        </label>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? t.loading : t.loginButton}
        </button>

        <p className={styles.switchMode}>
          {t.noAccount}{' '}
          <button type="button" onClick={() => setMode('signup')}>
            {t.signUp}
          </button>
        </p>
      </form>
    </div>
  )

  const renderSignUpForm = () => (
    <div className={styles.menu}>
      <form onSubmit={handleEmailSignUp} className={styles.form}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => {
            setMode('menu')
            clearAuthError()
          }}
        >
          <BackIcon /> {t.back}
        </button>

        {authError && <div className={styles.error}>{authError}</div>}

        <label className={styles.label}>
          {t.name}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.input}
            required
            autoComplete="name"
          />
        </label>

        <label className={styles.label}>
          {t.email}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            required
            autoComplete="email"
          />
        </label>

        <label className={styles.label}>
          {t.password}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.input}
            required
            autoComplete="new-password"
            minLength={8}
          />
        </label>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? t.loading : t.signUpButton}
        </button>

        <p className={styles.switchMode}>
          {t.haveAccount}{' '}
          <button type="button" onClick={() => setMode('login')}>
            {t.signIn}
          </button>
        </p>
      </form>
    </div>
  )

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setShowMenu(!showMenu)}
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        {t.signIn}
      </button>

      {showMenu && (
        <>
          {mode === 'menu' && renderMenu()}
          {mode === 'login' && renderLoginForm()}
          {mode === 'signup' && renderSignUpForm()}
        </>
      )}
    </div>
  )
}

function EmailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function PasskeyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}
