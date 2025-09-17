import { canDeleteOrgUser, canUpdateOrg } from '@/validations'
import { parseRequest } from '@/lib/request'
import { badRequest, json, ok, unauthorized } from '@/lib/response'
import { deleteOrgUser, getOrgUser, updateOrgUser } from '@/queries'
import { z } from 'zod'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  const { auth, error } = await parseRequest(request)

  if (error) {
    return error()
  }

  const { orgId, userId } = await params

  if (!(await canUpdateOrg(auth, orgId))) {
    return unauthorized('You must be the owner of this org.')
  }

  const orgUser = await getOrgUser(orgId, userId)

  return json(orgUser)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  const schema = z.object({
    role: z.string().regex(/org-member|org-view-only|org-manager/),
  })

  const { auth, body, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  const { orgId, userId } = await params

  if (!(await canUpdateOrg(auth, orgId))) {
    return unauthorized('You must be the owner of this org.')
  }

  const orgUser = await getOrgUser(orgId, userId)

  if (!orgUser) {
    return badRequest('The User does not exists on this org.')
  }

  const user = await updateOrgUser(orgUser.id, body)

  return json(user)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  const { auth, error } = await parseRequest(request)

  if (error) {
    return error()
  }

  const { orgId, userId } = await params

  if (!(await canDeleteOrgUser(auth, orgId, userId))) {
    return unauthorized('You must be the owner of this org.')
  }

  const orgUser = await getOrgUser(orgId, userId)

  if (!orgUser) {
    return badRequest('The User does not exists on this org.')
  }

  await deleteOrgUser(orgId, userId)

  return ok()
}
