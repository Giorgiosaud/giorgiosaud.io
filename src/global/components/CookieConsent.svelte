<script lang="ts">
  import { onMount } from 'svelte'

  const CONSENT_KEY = 'cookie_consent'
  const CONSENT_VERSION = '1' // Bump this to re-ask consent

  type ConsentState = {
    necessary: boolean
    analytics: boolean
    marketing: boolean
    version: string
    timestamp: number
  }

  let showBanner = $state(false)
  let showSettings = $state(false)
  let consent = $state<ConsentState>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    version: CONSENT_VERSION,
    timestamp: 0,
  })

  onMount(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConsentState
        // Re-ask if version changed
        if (parsed.version !== CONSENT_VERSION) {
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

  function saveConsent(state: ConsentState) {
    state.timestamp = Date.now()
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
    applyConsent(state)
    showBanner = false
    showSettings = false
  }

  function acceptAll() {
    saveConsent({
      ...consent,
      analytics: true,
      marketing: true,
    })
  }

  function rejectAll() {
    saveConsent({
      ...consent,
      analytics: false,
      marketing: false,
    })
  }

  function saveCustom() {
    saveConsent(consent)
  }

  // Declare global types
  declare global {
    interface Window {
      dataLayer: unknown[]
      gtag: (...args: unknown[]) => void
    }
  }
</script>

{#if showBanner}
  <div class="cookie-banner" role="dialog" aria-label="Cookie consent">
    {#if !showSettings}
      <div class="banner-content">
        <p>
          We use cookies to enhance your experience. By continuing, you agree to our use of cookies.
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
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-surface, #fff);
    border-top: 1px solid var(--color-border, #ddd);
    padding: 1rem;
    z-index: 9998;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  }

  .banner-content, .settings-content {
    max-width: 900px;
    margin: 0 auto;
  }

  .banner-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .banner-content p {
    margin: 0;
    flex: 1;
    min-width: 200px;
  }

  .banner-actions, .settings-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .settings-content h3 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
  }

  .cookie-option {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--color-background, #f9f9f9);
    border-radius: 4px;
  }

  .cookie-option label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .option-title {
    font-weight: 500;
  }

  .option-desc {
    margin: 0.25rem 0 0 1.5rem;
    font-size: 0.875rem;
    color: var(--color-muted, #666);
  }

  .btn-primary {
    padding: 0.5rem 1rem;
    background: var(--color-main);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-secondary {
    padding: 0.5rem 1rem;
    background: var(--color-surface, #e5e5e5);
    color: var(--color-text, #333);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .btn-link {
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    color: var(--color-main);
    cursor: pointer;
    font-size: 0.875rem;
    text-decoration: underline;
  }

  .btn-primary:hover, .btn-secondary:hover {
    opacity: 0.9;
  }

  @media (max-width: 600px) {
    .banner-content {
      flex-direction: column;
      text-align: center;
    }

    .banner-actions {
      justify-content: center;
      width: 100%;
    }
  }
</style>
