/**
 * CSP allowlist (not wired up yet).
 * Kept as the source of external domains for a future migration to Astro's native
 * `security.csp`, which emits per-page hashes in a <meta> tag. A header-based hash CSP
 * doesn't fit Cloudflare's 2,000-char _headers limit (the site has ~236 inline-script hashes).
 */
export const cspPolicy = {
  'default-src': [
    "'self'",
  ],
  'script-src': {
    static: [
      "'self'",
    ],
    externalDomains: [
      'https://www.googletagmanager.com',
      'https://cdn.jsdelivr.net',
      'https://challenges.cloudflare.com',
      'https://static.cloudflareinsights.com',
    ],
  },
  'style-src': [
    "'self'",
    "'unsafe-inline'",
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://www.giorgiosaud.io',
    'https://platform.linkedin.com',
    'https://cc.sj-cdn.net',
    'https://developers.google.com',
    'https://avatars.githubusercontent.com',
  ],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.googletagmanager.com',
    'https://cdn.jsdelivr.net',
  ],
  'worker-src': [
    "'self'",
    'blob:',
  ],
  'frame-src': [
    'https://challenges.cloudflare.com',
  ],
  'object-src': [
    "'none'",
  ],
  'base-uri': [
    "'self'",
  ],
  'form-action': [
    "'self'",
  ],
} as const
