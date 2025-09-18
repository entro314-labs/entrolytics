import { z } from 'zod'
import { canCreateOrgWebsite, canCreateWebsite, canViewAllWebsites } from '@/validations'
import { json, unauthorized } from '@/lib/response'
import { uuid } from '@/lib/crypto'
import { parseRequest, getQueryFilters } from '@/lib/request'
import { createWebsite, getWebsites, getUserWebsites } from '@/queries'
import { pagingParams, searchParams } from '@/lib/schema'

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  })

  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const filters = await getQueryFilters(query)

  // If user is admin, return all websites, otherwise return user's websites
  if (await canViewAllWebsites(auth)) {
    const websites = await getWebsites({}, filters)
    return json(websites)
  } else {
    const websites = await getUserWebsites(auth?.user?.userId, filters)
    return json(websites)
  }
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    domain: z.string().max(500),
    shareId: z.string().max(50).nullable().optional(),
    orgId: z.string().nullable().optional(),
    id: z.string().uuid().nullable().optional(),
  })

  const { auth, body, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { id, name, domain, shareId, orgId } = body

  if ((orgId && !(await canCreateOrgWebsite(auth, orgId))) || !(await canCreateWebsite(auth))) {
    return unauthorized()
  }

  const data: any = {
    website_id: id ?? uuid(),
    created_by: auth.user.userId,
    name,
    domain,
    share_id: shareId,
    org_id: orgId,
  }

  if (!orgId) {
    data.user_id = auth.user.userId
  }

  const website = await createWebsite(data)

  return json(website)
}
