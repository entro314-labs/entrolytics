import { z } from 'zod'
import { parseRequest } from '@/lib/request'
import { json, unauthorized } from '@/lib/response'
import { pagingParams, searchParams } from '@/lib/schema'
import { canViewAllWebsites } from '@/validations'
import { getWebsites } from '@/queries/drizzle'
import { ROLES } from '@/lib/constants'

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  })

  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  if (!(await canViewAllWebsites(auth))) {
    return unauthorized()
  }

  const websites = await getWebsites({}, query)

  return json(websites)
}
