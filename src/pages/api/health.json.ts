import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    // Lazy import to catch module initialization errors
    const { db } = await import('@db')
    const { sql } = await import('drizzle-orm')

    // Test database connection with a simple query
    const result = await db.execute(sql`SELECT NOW() as time`)
    const time = result[0]?.time

    return Response.json({
      status: 'ok',
      database: 'connected',
      serverTime: time,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return Response.json(
      {
        status: 'error',
        database: 'disconnected',
        error: message,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      },
    )
  }
}
