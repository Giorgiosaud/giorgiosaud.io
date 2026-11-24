<script lang="ts">
import { onMount } from 'svelte'
import '@be-partner-labs/ds/components/button'
import '@be-partner-labs/ds/components/checkbox'

const CONSENT_KEY = 'cookie_consent'
const CONSENT_SESSION_KEY = 'consent_session_id'
const CONSENT_VERSION = '1' // Bump this to re-ask consent
const CONSENT_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000 // 12 months

type ConsentState = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  version: string
  timestamp: number
}

type ActionType = 'accept_all' | 'reject_all' | 'custom'

let showBanner = $state(false)
let showSettings = $state(false)
let consent = $state<ConsentState>({
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  timestamp: 0,
})

// Get or create session ID for consent tracking
function getSessionId(): string {
  let sessionId = localStorage.getItem(CONSENT_SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(CONSENT_SESSION_KEY, sessionId)
  }
  return sessionId
}

// Record consent to server for GDPR audit trail
async function recordConsentToServer(
  state: ConsentState,
  actionType: ActionType,
) {
  try {
    await fetch('/api/consent/record.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        analytics: state.analytics,
        marketing: state.marketing,
        version: state.version,
        actionType,
      }),
    })
  } catch (error) {
    // Silent fail - don't block user experience
    console.error('Failed to record consent:', error)
  }
}

onMount(() => {
  const stored = localStorage.getItem(CONSENT_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as ConsentState
      const expired = Date.now() - (parsed.timestamp || 0) > CONSENT_EXPIRY_MS
      if (parsed.version !== CONSENT_VERSION || expired) {
        showBanner = true
      } else {
        consent = parsed
        applyConsent(consent)
      }
    } catch {
      showBanner = true
    }
  } else {
    showBanner = true
  }

  // Expose re-open function globally so footer/other UI can trigger it
  window.__openCookieSettings = () => {
    showBanner = true
    showSettings = false
  }
})

function applyConsent(state: ConsentState) {
  // Push consent to dataLayer for GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'consent_update',
      consent_analytics: state.analytics,
      consent_marketing: state.marketing,
    })
  }

  // Update gtag consent mode if available
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied',
    })
  }
}

function saveConsent(state: ConsentState, actionType: ActionType) {
  state.timestamp = Date.now()
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
  applyConsent(state)
  // Record to server for GDPR compliance (async, non-blocking)
  recordConsentToServer(state, actionType)
  showBanner = false
  showSettings = false
}

function acceptAll() {
  saveConsent(
    {
      ...consent,
      analytics: true,
      marketing: true,
    },
    'accept_all',
  )
}

function rejectAll() {
  saveConsent(
    {
      ...consent,
      analytics: false,
      marketing: false,
    },
    'reject_all',
  )
}

function saveCustom() {
  saveConsent(consent, 'custom')
}

// Declare global types
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    __openCookieSettings: () => void
  }
}
</script>

{#if !showBanner}
  <button type="button" class="manage-btn" onclick={() => { showBanner = true; showSettings = false }}>
    <span aria-hidden="true">🍪</span> Cookies
  </button>
{/if}

{#if showBanner}
  <div class="cookie-banner" role="dialog" aria-label="Cookie consent">
    {#if !showSettings}
      <div class="banner-content">
        <p>
          We use cookies to enhance your experience. Read our <a href="/privacy-policy" class="policy-link">Privacy Policy</a> to learn more.
        </p>
        <div class="banner-actions">
          <button type="button" class="btn-link" onclick={() => showSettings = true}>
            Customize
          </button>
          <button type="button" class="bp-btn bp-btn--secondary bp-btn--sm" onclick={rejectAll}>
            Reject All
          </button>
          <button type="button" class="bp-btn bp-btn--sm" onclick={acceptAll}>
            Accept All
          </button>
        </div>
      </div>
    {:else}
      <div class="settings-content">
        <h3>Cookie Preferences</h3>

        <div class="cookie-option">
          <label class="bp-checkbox">
            <input class="bp-checkbox__input" type="checkbox" checked disabled />
            <span class="option-title">Necessary</span>
          </label>
          <p class="option-desc">Required for the website to function. Cannot be disabled.</p>
        </div>

        <div class="cookie-option">
          <label class="bp-checkbox">
            <input class="bp-checkbox__input" type="checkbox" bind:checked={consent.analytics} />
            <span class="option-title">Analytics</span>
          </label>
          <p class="option-desc">Help us understand how visitors interact with the website.</p>
        </div>

        <div class="cookie-option">
          <label class="bp-checkbox">
            <input class="bp-checkbox__input" type="checkbox" bind:checked={consent.marketing} />
            <span class="option-title">Marketing</span>
          </label>
          <p class="option-desc">Used to deliver personalized ads and track campaigns.</p>
        </div>

        <div class="settings-actions">
          <button type="button" class="btn-link" onclick={() => showSettings = false}>
            Back
          </button>
          <button type="button" class="bp-btn bp-btn--sm" onclick={saveCustom}>
            Save Preferences
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cookie-banner {
    position: fixed;
    bottom: var(--bp-space-6);
    right: var(--bp-space-6);
    width: min(360px, calc(100vw - 2rem));
    background: var(--bp-color-bg-elevated);
    color: var(--bp-color-text);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-lg);
    padding: var(--bp-space-4) var(--bp-space-5);
    font-size: var(--bp-text-xs);
    z-index: 9998;
    box-shadow: var(--bp-shadow-xl);
  }

  .banner-content,
  .settings-content {
    display: flex;
    flex-direction: column;
    gap: var(--bp-space-3);
  }

  .banner-content p {
    margin: 0;
    font-size: inherit;
    line-height: var(--bp-leading-normal);
    color: var(--bp-color-text-muted);
  }

  .policy-link {
    font-size: inherit;
    color: var(--site-color-accent);
    text-decoration: underline;
  }

  .banner-actions,
  .settings-actions {
    display: flex;
    gap: var(--bp-space-2);
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
  }

  .settings-content h3 {
    margin: 0;
    font-size: var(--bp-text-sm);
    color: var(--bp-color-text);
  }

  .cookie-option {
    margin-bottom: var(--bp-space-2);
    padding: var(--bp-space-3);
    background: var(--bp-color-bg-subtle);
    border-radius: var(--bp-radius-md);
  }

  .option-title {
    font-weight: var(--bp-font-weight-medium);
    font-size: var(--bp-text-sm);
  }

  .option-desc {
    margin: var(--bp-space-1) 0 0 var(--bp-space-6);
    font-size: inherit;
    color: var(--bp-color-text-muted);
  }

  .btn-link {
    padding: var(--bp-space-1) var(--bp-space-2);
    background: none;
    border: none;
    color: var(--bp-color-text-muted);
    cursor: pointer;
    font-size: var(--bp-text-sm);
    text-decoration: underline;
    border-radius: var(--bp-radius-sm);
  }

  .btn-link:hover {
    color: var(--site-color-accent);
  }

  .btn-link:focus-visible,
  .manage-btn:focus-visible {
    outline: none;
    box-shadow: var(--bp-focus-ring);
  }

  .manage-btn {
    position: fixed;
    bottom: var(--bp-space-4);
    right: var(--bp-space-4);
    background: var(--bp-color-bg-elevated);
    color: var(--bp-color-text-muted);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-md);
    padding: var(--bp-space-1) var(--bp-space-3);
    font-size: var(--bp-text-xs);
    cursor: pointer;
    z-index: 9997;
    opacity: 0.7;
    transition: opacity var(--bp-duration-fast) var(--bp-ease);
  }

  .manage-btn:hover,
  .manage-btn:focus-visible {
    opacity: 1;
  }

  @media (width < 48rem) {
    .cookie-banner {
      bottom: calc(4.5rem + 1rem);
      right: var(--bp-space-3);
      width: calc(100vw - 1.5rem);
    }

    .manage-btn {
      bottom: calc(4.5rem + 0.5rem);
    }
  }
</style>
