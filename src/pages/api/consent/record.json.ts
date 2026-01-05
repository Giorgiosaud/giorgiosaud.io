import { db } from '@db'
import { consentRecords } from '@db/schema'
import type { APIRoute } from 'astro'

export const prerender = false

// Hash IP address for privacy (one-way hash)
async function hashIP(ip: string): Promise<string> {
  // Add a salt to prevent rainbow table attacks
  const salt = 'gdpr-consent-salt-v1'
  const data = new TextEncoder().encode(ip + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get client IP from various headers
function getClientIP(request: Request): string | null {
  // Check common headers (Vercel, Cloudflare, etc.)
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-vercel-forwarded-for',
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }

  return null
}

// POST /api/consent/record.json - Record GDPR consent
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { sessionId, analytics, marketing, version, actionType } = body

    // Validate required fields
    if (!sessionId || typeof sessionId !== 'string') {
      return Response.json(
        {
          error: 'Session ID required',
        },
        {
          status: 400,
        },
      )
    }

    if (!version || typeof version !== 'string') {
      return Response.json(
        {
          error: 'Consent version required',
        },
        {
          status: 400,
        },
      )
    }

    if (
      !actionType ||
      ![
        'accept_all',
        'reject_all',
        'custom',
      ].includes(actionType)
    ) {
      return Response.json(
        {
          error: 'Valid action type required',
        },
        {
          status: 400,
        },
      )
    }

    // Get and hash IP
    const clientIP = getClientIP(request)
    const ipHash = clientIP ? await hashIP(clientIP) : null

    // Record the consent
    await db.insert(consentRecords).values({
      sessionId,
      ipHash,
      consentAnalytics: analytics === true,
      consentMarketing: marketing === true,
      consentVersion: version,
      actionType,
      userAgent: request.headers.get('user-agent') || null,
    })

    return Response.json(
      {
        success: true,
      },
      {
        status: 201,
      },
    )
  } catch (error) {
    console.error('Failed to record consent:', error)
    return Response.json(
      {
        error: 'Failed to record consent',
      },
      {
        status: 500,
      },
    )
  }
}
