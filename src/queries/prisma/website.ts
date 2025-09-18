import { Prisma, website } from '@/generated/prisma/client'
import redis from '@/lib/redis'
import prisma from '@/lib/prisma'
import { PageResult, QueryFilters } from '@/lib/types'
import { ROLES } from '@/lib/constants'

export async function findWebsite(criteria: Prisma.WebsiteFindUniqueArgs): Promise<website> {
  return prisma.client.website.findUnique(criteria)
}

export async function getWebsite(websiteId: string) {
  return findWebsite({
    where: {
      website_id: websiteId,
    },
  })
}

export async function getSharedWebsite(shareId: string) {
  return findWebsite({
    where: {
      share_id: shareId,
      deleted_at: null,
    },
  })
}

export async function getWebsites(
  criteria: Prisma.WebsiteFindManyArgs,
  filters: QueryFilters
): Promise<PageResult<website[]>> {
  const { search } = filters
  const { getSearchParameters, pagedQuery } = prisma

  const where: Prisma.WebsiteWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [
      {
        name: 'contains',
      },
      { domain: 'contains' },
    ]),
    deleted_at: null,
  }

  return pagedQuery('website', { ...criteria, where }, filters)
}

export async function getAllWebsites(userId: string) {
  return prisma.client.website.findMany({
    where: {
      OR: [
        { user_id: userId },
        {
          org: {
            deleted_at: null,
            orgUser: {
              some: {
                user_id: userId,
              },
            },
          },
        },
      ],
      deleted_at: null,
    },
  })
}

export async function getAllUserWebsitesIncludingOrgOwner(userId: string) {
  return prisma.client.website.findMany({
    where: {
      OR: [
        { user_id: userId },
        {
          org: {
            deleted_at: null,
            orgUser: {
              some: {
                role: ROLES.orgOwner,
                user_id: userId,
              },
            },
          },
        },
      ],
    },
  })
}

export async function getUserWebsites(
  userId: string,
  filters?: QueryFilters
): Promise<PageResult<website[]>> {
  return getWebsites(
    {
      where: {
        user_id: userId,
      },
      include: {
        user: {
          select: {
            display_name: true,
            email: true,
            user_id: true,
          },
        },
      },
    },
    {
      orderBy: 'name',
      ...filters,
    }
  )
}

export async function getOrgWebsites(
  orgId: string,
  filters?: QueryFilters
): Promise<PageResult<website[]>> {
  return getWebsites(
    {
      where: {
        org_id: orgId,
      },
      include: {
        createUser: {
          select: {
            user_id: true,
            display_name: true,
            email: true,
          },
        },
      },
    },
    filters
  )
}

export async function createWebsite(
  data: Prisma.WebsiteCreateInput | Prisma.WebsiteUncheckedCreateInput
): Promise<website> {
  return prisma.client.website.create({
    data,
  })
}

export async function updateWebsite(
  websiteId: string,
  data: Prisma.WebsiteUpdateInput | Prisma.WebsiteUncheckedUpdateInput
): Promise<website> {
  return prisma.client.website.update({
    where: {
      website_id: websiteId,
    },
    data,
  })
}

export async function resetWebsite(
  websiteId: string
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, website]> {
  const { client, transaction } = prisma
  const cloudMode = !!process.env.cloudMode

  return transaction([
    client.eventData.deleteMany({
      where: { website_id: websiteId },
    }),
    client.sessionData.deleteMany({
      where: { website_id: websiteId },
    }),
    client.websiteEvent.deleteMany({
      where: { website_id: websiteId },
    }),
    client.session.deleteMany({
      where: { website_id: websiteId },
    }),
    client.website.update({
      where: { website_id: websiteId },
      data: {
        reset_at: new Date(),
      },
    }),
  ]).then(async (data) => {
    if (cloudMode) {
      await redis.client.set(`website:${websiteId}`, data[3])
    }

    return data
  })
}

export async function deleteWebsite(
  websiteId: string
): Promise<[Prisma.BatchPayload, Prisma.BatchPayload, website]> {
  const { client, transaction } = prisma
  const cloudMode = !!process.env.CLOUD_MODE

  return transaction([
    client.eventData.deleteMany({
      where: { website_id: websiteId },
    }),
    client.sessionData.deleteMany({
      where: { website_id: websiteId },
    }),
    client.websiteEvent.deleteMany({
      where: { website_id: websiteId },
    }),
    client.session.deleteMany({
      where: { website_id: websiteId },
    }),
    client.report.deleteMany({
      where: {
        websiteId,
      },
    }),
    cloudMode
      ? client.website.update({
          data: {
            deletedAt: new Date(),
          },
          where: { website_id: websiteId },
        })
      : client.website.delete({
          where: { website_id: websiteId },
        }),
  ]).then(async (data) => {
    if (cloudMode) {
      await redis.client.del(`website:${websiteId}`)
    }

    return data
  })
}
