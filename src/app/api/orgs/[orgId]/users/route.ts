import { z } from 'zod'
import { unauthorized, json, badRequest } from '@/lib/response'
import { canAddUserToOrg, canViewOrg } from '@/validations'
import { getQueryFilters, parseRequest } from '@/lib/request'
import { pagingParams, orgRoleParam, searchParams } from '@/lib/schema'
import { createOrgUser, getOrgUser, getOrgUsers } from '@/queries'

export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  })

  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { orgId } = await params

  if (!(await canViewOrg(auth, orgId))) {
    return unauthorized('You must be the owner of this org.')
  }

  const filters = await getQueryFilters(query)

  const users = await getOrgUsers({ orgId }, filters)

  return json(users)
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const schema = z.object({
    userId: z.string().uuid(),
    role: orgRoleParam,
  })

  const { auth, body, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { orgId } = await params

  if (!(await canAddUserToOrg(auth))) {
    return unauthorized()
  }

  const { userId, role } = body

  const orgUser = await getOrgUser(orgId, userId)

  if (orgUser) {
    return badRequest('User is already a member of the Org.')
  }

  const users = await createOrgUser(userId, orgId, role)

  return json(users)
}
