import { Prisma, user } from '@/generated/prisma/client'
import { ROLES } from '@/lib/constants'
import prisma from '@/lib/prisma'
import { PageResult, Role, QueryFilters } from '@/lib/types'
import { getRandomChars } from '@/lib/crypto'
import UserFindManyArgs = Prisma.UserFindManyArgs

export interface GetUserOptions {
  showDeleted?: boolean
}

async function findUser(
  criteria: Prisma.UserFindUniqueArgs,
  options: GetUserOptions = {}
): Promise<user> {
  const { showDeleted = false } = options

  return prisma.client.user.findUnique({
    ...criteria,
    where: {
      ...criteria.where,
      ...(!showDeleted && { deleted_at: null }),
    },
    select: {
      user_id: true,
      email: true,
      first_name: true,
      last_name: true,
      image_url: true,
      display_name: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  })
}

export async function getUser(userId: string, options: GetUserOptions = {}) {
  return findUser(
    {
      where: {
        user_id: userId,
      },
    },
    options
  )
}

export async function getUserByClerkId(clerkId: string, options: GetUserOptions = {}) {
  return findUser(
    {
      where: {
        clerk_id: clerkId,
      },
    },
    options
  )
}

export async function getUserByEmail(email: string, options: GetUserOptions = {}) {
  const { showDeleted = false } = options

  return prisma.client.user.findFirst({
    where: {
      email,
      ...(!showDeleted && { deleted_at: null }),
    },
    select: {
      user_id: true,
      email: true,
      first_name: true,
      last_name: true,
      image_url: true,
      display_name: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  })
}

export async function getUsers(
  criteria: UserFindManyArgs,
  filters: QueryFilters = {}
): Promise<PageResult<user[]>> {
  const { search } = filters

  const where: Prisma.UserWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [
      { email: 'contains' },
      { first_name: 'contains' },
      { last_name: 'contains' },
      { display_name: 'contains' },
    ]),
    deleted_at: null,
  }

  return prisma.pagedQuery(
    'user',
    {
      ...criteria,
      where,
    },
    {
      orderBy: 'created_at',
      sortDescending: true,
      ...filters,
    }
  )
}

export async function createUser(data: {
  user_id: string
  clerk_id: string
  email: string
  first_name?: string
  last_name?: string
  image_url?: string
  display_name?: string
  role: Role
}): Promise<{
  user_id: string
  email: string
  display_name: string
  role: string
}> {
  return prisma.client.user.create({
    data,
    select: {
      user_id: true,
      email: true,
      display_name: true,
      role: true,
    },
  })
}

export async function updateUser(userId: string, data: Prisma.UserUpdateInput): Promise<user> {
  return prisma.client.user.update({
    where: {
      user_id: userId,
    },
    data,
    select: {
      user_id: true,
      email: true,
      first_name: true,
      last_name: true,
      image_url: true,
      display_name: true,
      role: true,
      created_at: true,
    },
  })
}

export async function deleteUser(
  userId: string
): Promise<
  [
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    Prisma.BatchPayload,
    User,
  ]
> {
  const { client, transaction } = prisma
  const cloudMode = process.env.CLOUD_MODE

  const websites = await client.website.findMany({
    where: { userId },
  })

  let websiteIds = []

  if (websites.length > 0) {
    websiteIds = websites.map((a) => a.id)
  }

  const orgs = await client.org.findMany({
    where: {
      orgUser: {
        some: {
          userId,
          role: ROLES.orgOwner,
        },
      },
    },
  })

  const orgIds = orgs.map((a) => a.id)

  if (cloudMode) {
    return transaction([
      client.website.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: { id: { in: websiteIds } },
      }),
      client.user.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          id: userId,
        },
      }),
    ])
  }

  return transaction([
    client.eventData.deleteMany({
      where: { websiteId: { in: websiteIds } },
    }),
    client.sessionData.deleteMany({
      where: { websiteId: { in: websiteIds } },
    }),
    client.websiteEvent.deleteMany({
      where: { websiteId: { in: websiteIds } },
    }),
    client.session.deleteMany({
      where: { websiteId: { in: websiteIds } },
    }),
    client.orgUser.deleteMany({
      where: {
        OR: [
          {
            orgId: {
              in: orgIds,
            },
          },
          {
            userId,
          },
        ],
      },
    }),
    client.org.deleteMany({
      where: {
        id: {
          in: orgIds,
        },
      },
    }),
    client.report.deleteMany({
      where: {
        OR: [
          {
            websiteId: {
              in: websiteIds,
            },
          },
          {
            userId,
          },
        ],
      },
    }),
    client.website.deleteMany({
      where: { id: { in: websiteIds } },
    }),
    client.user.delete({
      where: {
        id: userId,
      },
    }),
  ])
}
