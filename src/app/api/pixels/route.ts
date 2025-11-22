import { z } from 'zod'
import { canCreateOrgWebsite, canCreateWebsite } from '@/validations'
import { json, unauthorized } from '@/lib/response'
import { uuid } from '@/lib/crypto'
import { getQueryFilters, parseRequest } from '@/lib/request'
import { pagingParams, searchParams } from '@/lib/schema'
import { createPixel, getUserPixels } from '@/queries/drizzle'

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

  const links = await getUserPixels(auth.user.userId, filters)

  return json(links)
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    slug: z.string().max(100),
    orgId: z.string().nullable().optional(),
    id: z.string().uuid().nullable().optional(),
  })

  const { auth, body, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { id, name, slug, orgId } = body

  if ((orgId && !(await canCreateOrgWebsite(auth, orgId))) || !(await canCreateWebsite(auth))) {
    return unauthorized()
  }

  const data: any = {
    id: id ?? uuid(),
    name,
    slug,
    org_id: orgId,
  }

  if (!orgId) {
    data.user_id = auth.user.userId
  }

  const result = await createPixel(data)

  return json(result)
}
