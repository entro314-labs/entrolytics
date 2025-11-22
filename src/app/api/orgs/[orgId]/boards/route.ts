import { z } from 'zod'
import { unauthorized, json } from '@/lib/response'
import { canViewOrg } from '@/validations'
import { getQueryFilters, parseRequest } from '@/lib/request'
import { pagingParams, searchParams } from '@/lib/schema'
import { getOrgBoards } from '@/queries/drizzle'

export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  })
  const { orgId } = await params
  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  if (!(await canViewOrg(auth, orgId))) {
    return unauthorized()
  }

  const filters = await getQueryFilters(query)

  const boards = await getOrgBoards(orgId, filters)

  return json(boards)
}
