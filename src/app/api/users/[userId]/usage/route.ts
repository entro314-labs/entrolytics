import { z } from 'zod'
import { json, unauthorized } from '@/lib/response'
import { getAllUserWebsitesIncludingOrgOwner } from '@/queries/drizzle'
import { getEventUsage } from '@/queries/sql/events/getEventUsage'
import { getEventDataUsage } from '@/queries/sql/events/getEventDataUsage'
import { parseRequest, getQueryFilters } from '@/lib/request'

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
  })

  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  if (!auth.user.isAdmin) {
    return unauthorized()
  }

  const { userId } = await params
  const filters = await getQueryFilters(query)

  const websites = await getAllUserWebsitesIncludingOrgOwner(userId)

  const websiteIds = websites.map((a) => a.website.websiteId)

  const websiteEventUsage = await getEventUsage(websiteIds, filters)
  const eventDataUsage = await getEventDataUsage(websiteIds, filters)

  const websiteUsage = websites.map((a) => ({
    websiteId: a.website.websiteId,
    websiteName: a.website.name,
    websiteEventUsage:
      websiteEventUsage.find((b) => a.website.websiteId === b.websiteId)?.count || 0,
    eventDataUsage: eventDataUsage.find((b) => a.website.websiteId === b.websiteId)?.count || 0,
    deletedAt: a.website.deletedAt,
  }))

  const usage = websiteUsage.reduce(
    (acc, cv) => {
      acc.websiteEventUsage += cv.websiteEventUsage
      acc.eventDataUsage += cv.eventDataUsage

      return acc
    },
    { websiteEventUsage: 0, eventDataUsage: 0 }
  )

  const filteredWebsiteUsage = websiteUsage.filter(
    (a) => !a.deletedAt && (a.websiteEventUsage > 0 || a.eventDataUsage > 0)
  )

  return json({
    ...usage,
    websites: filteredWebsiteUsage,
  })
}
