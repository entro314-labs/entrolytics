import { z } from 'zod'
import { pagingParams } from '@/lib/schema'
import { getUserOrgs } from '@/queries'
import { unauthorized, json, notFound } from '@/lib/response'
import { parseRequest } from '@/lib/request'

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
  })

  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { userId } = await params

  // userId parameter should be the Clerk ID
  // Check authorization - user can access their own data or admin can access any
  if (auth.user.clerkId !== userId && !auth.user.isAdmin) {
    return unauthorized()
  }

  // Get the database user ID from the Clerk ID to find organizations
  const orgs = await getUserOrgs(auth.user.userId, query)

  return json(orgs)
}
