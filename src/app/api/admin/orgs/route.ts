import { z } from 'zod'
import { parseRequest } from '@/lib/request'
import { json, unauthorized } from '@/lib/response'
import { pagingParams, searchParams } from '@/lib/schema'
import { canViewAllOrgs } from '@/validations'
import { getOrgs } from '@/queries'

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  })

  const { auth, query, error } = await parseRequest(request, schema)

  if (error) {
    return error()
  }

  if (!(await canViewAllOrgs(auth))) {
    return unauthorized()
  }

  const orgs = await getOrgs(
    {
      include: {
        _count: {
          select: {
            members: true,
            websites: true,
          },
        },
        members: {
          select: {
            user: {
              omit: {
                password: true,
              },
            },
          },
          where: {
            role: 'org-owner',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
    query
  )

  return json(orgs)
}
