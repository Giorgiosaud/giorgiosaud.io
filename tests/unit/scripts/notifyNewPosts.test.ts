import { describe, expect, it, vi } from 'vitest'
import { type PostMeta, planNotifications } from '../../../scripts/notifyNewPosts'

const SITE = 'https://www.giorgiosaud.io'

const post = (slug: string, lang = 'en'): PostMeta => ({
  slug,
  title: `${slug} ${lang}`,
})

function fetchByStatus(statuses: Record<string, number | Error>) {
  return vi.fn(async (url: string | URL | Request) => {
    const slug = String(url).split('/').filter(Boolean).pop() as string
    const status = statuses[slug]
    if (status instanceof Error) throw status
    return new Response(null, { status: status ?? 500 })
  }) as unknown as typeof fetch
}

describe('planNotifications', () => {
  it('broadcasts a pair that is not live yet', async () => {
    const fetchImpl = fetchByStatus({ newone: 404 })
    const decisions = await planNotifications(
      [post('newone')],
      [post('newone', 'es')],
      new Set(),
      SITE,
      fetchImpl,
    )
    expect(decisions).toEqual([
      { action: 'broadcast', en: post('newone'), es: post('newone', 'es') },
    ])
    expect(fetchImpl).toHaveBeenCalledWith(`${SITE}/notebook/newone/`, {
      method: 'HEAD',
      redirect: 'follow',
    })
  })

  it('records a post that is already live instead of re-announcing it', async () => {
    const decisions = await planNotifications(
      [post('oldone')],
      [post('oldone', 'es')],
      new Set(),
      SITE,
      fetchByStatus({ oldone: 200 }),
    )
    expect(decisions).toEqual([
      { action: 'record', slug: 'oldone', reason: 'already live on the site' },
    ])
  })

  it('skips posts already in the manifest without a live check', async () => {
    const fetchImpl = fetchByStatus({})
    const decisions = await planNotifications(
      [post('done')],
      [post('done', 'es')],
      new Set(['done']),
      SITE,
      fetchImpl,
    )
    expect(decisions).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('skips without recording when the ES counterpart is missing', async () => {
    const decisions = await planNotifications(
      [post('enonly')],
      [],
      new Set(),
      SITE,
      fetchByStatus({ enonly: 404 }),
    )
    expect(decisions).toEqual([
      { action: 'skip', slug: 'enonly', reason: 'no ES counterpart yet' },
    ])
  })

  it('skips without recording on unexpected statuses or network errors', async () => {
    const decisions = await planNotifications(
      [post('flaky'), post('down')],
      [post('flaky', 'es'), post('down', 'es')],
      new Set(),
      SITE,
      fetchByStatus({ flaky: 503, down: new Error('ECONNRESET') }),
    )
    expect(decisions.map(d => d.action)).toEqual(['skip', 'skip'])
    expect(decisions[1]).toMatchObject({ reason: 'live check failed: ECONNRESET' })
  })
})
