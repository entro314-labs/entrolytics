import { Prisma, org } from '@/generated/prisma/client'
import { ROLES } from '@/lib/constants'
import { uuid } from '@/lib/crypto'
import prisma from '@/lib/prisma'
import { PageResult, QueryFilters } from '@/lib/types'
import OrgFindManyArgs = Prisma.OrgFindManyArgs

export async function findOrg(criteria: Prisma.OrgFindUniqueArgs): Promise<org> {
  return prisma.client.org.findUnique(criteria)
}

export async function getOrg(orgId: string, options: { includeMembers?: boolean } = {}) {
  const { includeMembers } = options

  return findOrg({
    where: {
      org_id: orgId,
    },
    ...(includeMembers && { include: { members: true } }),
  })
}

export async function getOrgs(
  criteria: OrgFindManyArgs,
  filters: QueryFilters
): Promise<PageResult<org[]>> {
  const { getSearchParameters } = prisma
  const { search } = filters

  const where: Prisma.OrgWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [{ name: 'contains' }]),
  }

  return prisma.pagedQuery<OrgFindManyArgs>(
    'org',
    {
      ...criteria,
      where,
    },
    filters
  )
}

export async function getUserOrgs(userId: string, filters: QueryFilters) {
  return getOrgs(
    {
      where: {
        deleted_at: null,
        members: {
          some: { user_id: userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                user_id: true,
                display_name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            websites: {
              where: { deleted_at: null },
            },
            members: {
              where: {
                user: { deleted_at: null },
              },
            },
          },
        },
      },
    },
    filters
  )
}

export async function createOrg(data: Prisma.OrgCreateInput, userId: string): Promise<any> {
  const { id } = data
  const { client, transaction } = prisma

  return transaction([
    client.org.create({
      data,
    }),
    client.orgUser.create({
      data: {
        org_user_id: uuid(),
        org_id: id,
        user_id: userId,
        role: ROLES.orgOwner,
      },
    }),
  ])
}

export async function updateOrg(orgId: string, data: Prisma.OrgUpdateInput): Promise<org> {
  const { client } = prisma

  return client.org.update({
    where: {
      org_id: orgId,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
  })
}

export async function deleteOrg(
  orgId: string
): Promise<Promise<[Prisma.BatchPayload, Prisma.BatchPayload, org]>> {
  const { client, transaction } = prisma
  const cloudMode = process.env.CLOUD_MODE

  if (cloudMode) {
    return transaction([
      client.org.update({
        data: {
          deleted_at: new Date(),
        },
        where: {
          org_id: orgId,
        },
      }),
    ])
  }

  return transaction([
    client.orgUser.deleteMany({
      where: {
        org_id: orgId,
      },
    }),
    client.org.delete({
      where: {
        org_id: orgId,
      },
    }),
  ])
}
