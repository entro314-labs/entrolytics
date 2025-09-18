import { uuid } from '@/lib/crypto'
import { DRIZZLE, runQuery, db, revenue } from '@/lib/db'

export interface SaveRevenueArgs {
  websiteId: string
  sessionId: string
  eventId: string
  eventName: string
  currency: string
  revenue: number
  createdAt: Date
}

export async function saveRevenue(data: SaveRevenueArgs) {
  return runQuery({
    [DRIZZLE]: () => relationalQuery(data),
  })
}

async function relationalQuery(data: SaveRevenueArgs) {
  const { websiteId, sessionId, eventId, eventName, currency, revenue, createdAt } = data

  await db.insert(revenue).values({
    revenueId: uuid(),
    websiteId,
    sessionId,
    eventId,
    eventName,
    currency,
    revenue,
    createdAt,
  })
}
