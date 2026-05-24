/**
 * CSP policy directives (non-hash parts).
 * script-src hashes are injected automatically by scripts/generateCspHashes.ts at build time.
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
    // hashes injected at build time
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
