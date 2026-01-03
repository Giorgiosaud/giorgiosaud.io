import type { APIRoute } from 'astro'
import { db } from '@db'
import { sql } from 'drizzle-orm'

export const GET: APIRoute = async () => {
  try {
    // Test database connection with a simple query
    const result = await db.execute(sql`SELECT NOW() as time`)
    const time = result.rows[0]?.time

    return new Response(
      JSON.stringify({
        status: 'ok',
        database: 'connected',
        serverTime: time,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        status: 'error',
        database: 'disconnected',
        error: message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
