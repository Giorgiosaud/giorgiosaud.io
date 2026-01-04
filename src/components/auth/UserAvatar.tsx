import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'
import {
  $user,
  $isAuthenticated,
  $isLoading,
  $isAdmin,
  initAuthState,
  logout,
} from '@lib/stores/auth'
import styles from './UserAvatar.module.css'

interface Props {
  lang?: 'en' | 'es'
}

const translations = {
  en: {
    dashboard: 'Dashboard',
    profile: 'Profile',
    signOut: 'Sign Out',
    loading: 'Loading...',
  },
  es: {
    dashboard: 'Panel',
    profile: 'Perfil',
    signOut: 'Cerrar sesion',
    loading: 'Cargando...',
  },
}

export default function UserAvatar({ lang = 'en' }: Props) {
  const user = useStore($user)
  const isAuthenticated = useStore($isAuthenticated)
  const isLoading = useStore($isLoading)
  const isAdmin = useStore($isAdmin)
  const [showMenu, setShowMenu] = useState(false)
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
      }
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  // Don't render if not authenticated (LoginButton will show instead)
  // Return empty div instead of null to avoid SSR issues
  if (!isAuthenticated) {
    return <div className={styles.hidden} aria-hidden="true" />
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.avatarPlaceholder} />
      </div>
    )
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.avatar}
        onClick={() => setShowMenu(!showMenu)}
        aria-expanded={showMenu}
        aria-haspopup="true"
        title={user?.name ?? 'User'}
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? 'User avatar'}
            className={styles.avatarImage}
          />
        ) : (
          <span className={styles.initials}>{initials}</span>
        )}
      </button>

      {showMenu && (
        <div className={styles.menu} role="menu">
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>

          <div className={styles.divider} />

          {isAdmin && (
            <a href="/admin" className={styles.menuItem} role="menuitem">
              <DashboardIcon />
              <span>{t.dashboard}</span>
            </a>
          )}

          <button
            type="button"
            className={styles.menuItem}
            onClick={logout}
            role="menuitem"
          >
            <SignOutIcon />
            <span>{t.signOut}</span>
          </button>
        </div>
      )}
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
