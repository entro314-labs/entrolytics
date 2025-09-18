import { Prisma, link } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'
import { PageResult, QueryFilters } from '@/lib/types'

export async function findLink(criteria: Prisma.LinkFindUniqueArgs): Promise<link> {
  return prisma.client.link.findUnique(criteria)
}

export async function getLink(linkId: string): Promise<link> {
  return findLink({
    where: {
      id: linkId,
    },
  })
}

export async function getLinks(
  criteria: Prisma.LinkFindManyArgs,
  filters: QueryFilters = {}
): Promise<PageResult<link[]>> {
  const { search } = filters
  const { getSearchParameters, pagedQuery } = prisma

  const where: Prisma.LinkWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [
      { name: 'contains' },
      { url: 'contains' },
      { slug: 'contains' },
    ]),
  }

  return pagedQuery('link', { ...criteria, where }, filters)
}

export async function getUserLinks(
  userId: string,
  filters?: QueryFilters
): Promise<PageResult<link[]>> {
  return getLinks(
    {
      where: {
        user_id: userId,
        deleted_at: null,
      },
    },
    filters
  )
}

export async function getOrgLinks(
  orgId: string,
  filters?: QueryFilters
): Promise<PageResult<link[]>> {
  return getLinks(
    {
      where: {
        org_id: orgId,
      },
    },
    filters
  )
}

export async function createLink(data: Prisma.LinkUncheckedCreateInput): Promise<link> {
  return prisma.client.link.create({ data })
}

export async function updateLink(linkId: string, data: any): Promise<link> {
  return prisma.client.link.update({ where: { id: linkId }, data })
}

export async function deleteLink(linkId: string): Promise<link> {
  return prisma.client.link.delete({ where: { id: linkId } })
}
