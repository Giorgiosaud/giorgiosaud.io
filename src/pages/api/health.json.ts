import type { APIRoute } from 'astro'
import { db } from '@db'
import { sql } from 'drizzle-orm'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    // Test database connection with a simple query
    const result = await db.execute(sql`SELECT NOW() as time`)
    const time = result.rows[0]?.time

    return Response.json({
      status: 'ok',
      database: 'connected',
      serverTime: time,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      {
        status: 'error',
        database: 'disconnected',
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
