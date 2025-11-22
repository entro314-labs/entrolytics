import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create Neon connection with optimized configuration
const sql = neon(process.env.DATABASE_URL, {
  // Optimize for analytics workloads
  fullResults: true,
  // Enable array mode for better performance with analytics queries
  arrayMode: false,
})

// Create Drizzle instance with optimized configuration
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

// Re-export schema and types
export * from './schema'
export { sql }

// Database type constants (keeping compatibility with existing code)
export const DRIZZLE = 'drizzle'
export const POSTGRESQL = 'postgresql'
export const MYSQL = 'mysql'
export const CLICKHOUSE = 'clickhouse'
export const KAFKA = 'kafka'
export const KAFKA_PRODUCER = 'kafka-producer'

// Fixes issue with converting bigint values
BigInt.prototype['toJSON'] = function () {
  return Number(this)
}

export function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = url && url.split(':')[0]

  if (type === 'postgres') {
    return POSTGRESQL
  }

  return type
}

export async function runQuery(queries: any) {
  if (process.env.CLICKHOUSE_URL) {
    if (queries[KAFKA]) {
      return queries[KAFKA]()
    }

    return queries[CLICKHOUSE]()
  }

  const dbType = getDatabaseType()

  if (dbType === POSTGRESQL || dbType === MYSQL) {
    // Use Drizzle for all PostgreSQL/MySQL queries
    if (queries[DRIZZLE]) {
      return queries[DRIZZLE]()
    }

    throw new Error(
      `Drizzle query not implemented. Available query types: ${Object.keys(queries).join(', ')}`
    )
  }
}

export function notImplemented() {
  throw new Error('Not implemented.')
}
