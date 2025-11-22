import { z } from 'zod'
import { getRandomChars } from '@/lib/crypto'
import { unauthorized, json } from '@/lib/response'
import { canCreateOrg, canViewAllOrgs } from '@/validations'
import { uuid } from '@/lib/crypto'
import { parseRequest, getQueryFilters } from '@/lib/request'
import { createOrg, getOrgs, getUserOrgs } from '@/queries/drizzle'
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

  // If user is admin, return all orgs, otherwise return user's orgs
  if (await canViewAllOrgs(auth)) {
    const orgs = await getOrgs({}, filters)
    return json(orgs)
  } else {
    const orgs = await getUserOrgs(auth?.user?.userId, filters)
    return json(orgs)
  }
}

export async function POST(request: Request) {
  try {
    const schema = z.object({
      name: z.string().max(50),
    })

    const { auth, body, error } = await parseRequest(request, schema)

    if (error) {
      return error()
    }

    if (!(await canCreateOrg(auth))) {
      return unauthorized()
    }

    const { name } = body

    const result = await createOrg(
      {
        id: uuid(),
        name,
        access_code: `org_${getRandomChars(16)}`,
      },
      auth.user.userId
    )

    // createOrg returns [newOrg, newOrgUser], we want just the org
    const [org] = result

    return json(org)
  } catch (err) {
    console.error('Error creating org:', err)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
