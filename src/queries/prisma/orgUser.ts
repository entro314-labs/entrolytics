import { Prisma, org_user } from '@/generated/prisma/client'
import { uuid } from '@/lib/crypto'
import prisma from '@/lib/prisma'
import { PageResult, QueryFilters } from '@/lib/types'
import OrgUserFindManyArgs = Prisma.OrgUserFindManyArgs

export async function findOrgUser(criteria: Prisma.OrgUserFindUniqueArgs): Promise<org_user> {
  return prisma.client.orgUser.findUnique(criteria)
}

export async function getOrgUser(orgId: string, userId: string): Promise<org_user> {
  return prisma.client.orgUser.findFirst({
    where: {
      org_id: orgId,
      user_id: userId,
    },
  })
}

export async function getOrgUsers(
  criteria: OrgUserFindManyArgs,
  filters?: QueryFilters
): Promise<PageResult<org_user[]>> {
  const { search } = filters

  const where: Prisma.OrgUserWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [
      { user: { display_name: 'contains' } },
      { user: { email: 'contains' } },
    ]),
  }

  return prisma.pagedQuery(
    'orgUser',
    {
      ...criteria,
      where,
    },
    filters
  )
}

export async function createOrgUser(userId: string, orgId: string, role: string): Promise<org_user> {
  return prisma.client.orgUser.create({
    data: {
      org_user_id: uuid(),
      user_id: userId,
      org_id: orgId,
      role,
    },
  })
}

export async function updateOrgUser(
  orgUserId: string,
  data: Prisma.OrgUserUpdateInput
): Promise<org_user> {
  return prisma.client.orgUser.update({
    where: {
      id: orgUserId,
    },
    data,
  })
}

export async function deleteOrgUser(orgId: string, userId: string): Promise<Prisma.BatchPayload> {
  return prisma.client.orgUser.deleteMany({
    where: {
      org_id: orgId,
      user_id: userId,
    },
  })
}
