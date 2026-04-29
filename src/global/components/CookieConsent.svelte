<script lang="ts">
import { onMount } from 'svelte'

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
    🍪 Cookies
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
          <button type="button" class="btn-secondary" onclick={rejectAll}>
            Reject All
          </button>
          <button type="button" class="btn-primary" onclick={acceptAll}>
            Accept All
          </button>
        </div>
      </div>
    {:else}
      <div class="settings-content">
        <h3>Cookie Preferences</h3>

        <div class="cookie-option">
          <label>
            <input type="checkbox" checked disabled />
            <span class="option-title">Necessary</span>
          </label>
          <p class="option-desc">Required for the website to function. Cannot be disabled.</p>
        </div>

        <div class="cookie-option">
          <label>
            <input type="checkbox" bind:checked={consent.analytics} />
            <span class="option-title">Analytics</span>
          </label>
          <p class="option-desc">Help us understand how visitors interact with the website.</p>
        </div>

        <div class="cookie-option">
          <label>
            <input type="checkbox" bind:checked={consent.marketing} />
            <span class="option-title">Marketing</span>
          </label>
          <p class="option-desc">Used to deliver personalized ads and track campaigns.</p>
        </div>

        <div class="settings-actions">
          <button type="button" class="btn-link" onclick={() => showSettings = false}>
            Back
          </button>
          <button type="button" class="btn-primary" onclick={saveCustom}>
            Save Preferences
          </button>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cookie-banner {
    --_font-size: clamp(0.6875rem, 1.5vw, 0.75rem);
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: min(360px, calc(100vw - 2rem));
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    font-size: var(--_font-size);
    z-index: 9998;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  :global(.light) .cookie-banner,
  :global([data-theme="light"]) .cookie-banner {
    background: #ffffff;
    color: #1e293b;
    border-color: #e2e8f0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  .banner-content, .settings-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .banner-content p {
    margin: 0;
    font-size: inherit;
    line-height: 1.5;
    color: #94a3b8;
  }

  .policy-link {
    font-size: inherit;
  }

  :global(.light) .banner-content p,
  :global([data-theme="light"]) .banner-content p {
    color: #64748b;
  }

  .banner-actions, .settings-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .settings-content h3 {
    margin: 0;
    font-size: calc(var(--_font-size) * 1.2);
    color: #f1f5f9;
  }

  :global(.light) .settings-content h3,
  :global([data-theme="light"]) .settings-content h3 {
    color: #0f172a;
  }

  .cookie-option {
    margin-bottom: 0.5rem;
    padding: 0.625rem;
    background: #0f172a;
    border-radius: 6px;
  }

  :global(.light) .cookie-option,
  :global([data-theme="light"]) .cookie-option {
    background: #f1f5f9;
  }

  .cookie-option label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #e2e8f0;
  }

  :global(.light) .cookie-option label,
  :global([data-theme="light"]) .cookie-option label {
    color: #1e293b;
  }

  .option-title {
    font-weight: 500;
    font-size: 0.875rem;
  }

  .option-desc {
    margin: 0.25rem 0 0 1.5rem;
    font-size: inherit;
    color: #64748b;
  }

  .btn-primary {
    padding: 0.3rem 0.75rem;
    background: var(--color-main);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: inherit;
    font-weight: 500;
  }

  .btn-secondary {
    padding: 0.3rem 0.75rem;
    background: #334155;
    color: #e2e8f0;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: inherit;
  }

  :global(.light) .btn-secondary,
  :global([data-theme="light"]) .btn-secondary {
    background: #e2e8f0;
    color: #1e293b;
  }

  .btn-link {
    padding: 0.3rem 0.375rem;
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: inherit;
    text-decoration: underline;
  }

  :global(.light) .btn-link,
  :global([data-theme="light"]) .btn-link {
    color: #64748b;
  }

  .btn-primary:hover { opacity: 0.9; }
  .btn-secondary:hover { opacity: 0.85; }

  .policy-link {
    color: #7dd3fc;
    text-decoration: underline;
  }

  :global(.light) .policy-link,
  :global([data-theme="light"]) .policy-link {
    color: #0369a1;
  }

  .manage-btn {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: #1e293b;
    color: #94a3b8;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 0.375rem 0.625rem;
    font-size: 0.6875rem;
    cursor: pointer;
    z-index: 9997;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .manage-btn:hover { opacity: 1; }

  :global(.light) .manage-btn,
  :global([data-theme="light"]) .manage-btn {
    background: #f8fafc;
    color: #64748b;
    border-color: #e2e8f0;
  }
</style>
