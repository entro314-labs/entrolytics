import { Prisma, Org } from '@/generated/prisma/client';
import { ROLES } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';
import { PageResult, QueryFilters } from '@/lib/types';
import OrgFindManyArgs = Prisma.OrgFindManyArgs;

export async function findOrg(criteria: Prisma.OrgFindUniqueArgs): Promise<Org> {
  return prisma.client.org.findUnique(criteria);
}

export async function getOrg(orgId: string, options: { includeMembers?: boolean } = {}) {
  const { includeMembers } = options;

  return findOrg({
    where: {
      id: orgId,
    },
    ...(includeMembers && { include: { members: true } }),
  });
}

export async function getOrgs(
  criteria: OrgFindManyArgs,
  filters: QueryFilters,
): Promise<PageResult<Org[]>> {
  const { getSearchParameters } = prisma;
  const { search } = filters;

  const where: Prisma.OrgWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [{ name: 'contains' }]),
  };

  return prisma.pagedQuery<OrgFindManyArgs>(
    'org',
    {
      ...criteria,
      where,
    },
    filters,
  );
}

export async function getUserOrgs(userId: string, filters: QueryFilters) {
  return getOrgs(
    {
      where: {
        deletedAt: null,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            websites: {
              where: { deletedAt: null },
            },
            members: {
              where: {
                user: { deletedAt: null },
              },
            },
          },
        },
      },
    },
    filters,
  );
}

export async function createOrg(data: Prisma.OrgCreateInput, userId: string): Promise<any> {
  const { id } = data;
  const { client, transaction } = prisma;

  return transaction([
    client.org.create({
      data,
    }),
    client.orgUser.create({
      data: {
        id: uuid(),
        orgId: id,
        userId,
        role: ROLES.orgOwner,
      },
    }),
  ]);
}

export async function updateOrg(orgId: string, data: Prisma.OrgUpdateInput): Promise<Org> {
  const { client } = prisma;

  return client.org.update({
    where: {
      id: orgId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteOrg(
  orgId: string,
): Promise<Promise<[Prisma.BatchPayload, Prisma.BatchPayload, Org]>> {
  const { client, transaction } = prisma;
  const cloudMode = process.env.CLOUD_MODE;

  if (cloudMode) {
    return transaction([
      client.org.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          id: orgId,
        },
      }),
    ]);
  }

  return transaction([
    client.orgUser.deleteMany({
      where: {
        orgId,
      },
    }),
    client.org.delete({
      where: {
        id: orgId,
      },
    }),
  ]);
}
