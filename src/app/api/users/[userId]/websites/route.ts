import { z } from 'zod'
import { unauthorized, json } from '@/lib/response'
import { getUserWebsites } from '@/queries/prisma/website'
import { pagingParams, searchParams } from '@/lib/schema'
import { getQueryFilters, parseRequest } from '@/lib/request'

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  })

  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { userId } = await params

  // userId is now Clerk ID directly (primary key)
  // Check authorization - user can access their own data or admin can access any
  if (!auth.user.isAdmin && auth.user.id !== userId) {
    return unauthorized()
  }

  const filters = await getQueryFilters(query)

  const websites = await getUserWebsites(userId, filters)

  return json(websites)
}
