import { Prisma, pixel } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'
import { PageResult, QueryFilters } from '@/lib/types'

export async function findPixel(criteria: Prisma.PixelFindUniqueArgs): Promise<pixel> {
  return prisma.client.pixel.findUnique(criteria)
}

export async function getPixel(pixelId: string): Promise<pixel> {
  return findPixel({
    where: {
      id: pixelId,
    },
  })
}

export async function getPixels(
  criteria: Prisma.PixelFindManyArgs,
  filters: QueryFilters = {}
): Promise<PageResult<pixel[]>> {
  const { search } = filters

  const where: Prisma.PixelWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [{ name: 'contains' }, { slug: 'contains' }]),
  }

  return prisma.pagedQuery('pixel', { ...criteria, where }, filters)
}

export async function getUserPixels(
  userId: string,
  filters?: QueryFilters
): Promise<PageResult<pixel[]>> {
  return getPixels(
    {
      where: {
        user_id: userId,
      },
    },
    filters
  )
}

export async function getOrgPixels(
  orgId: string,
  filters?: QueryFilters
): Promise<PageResult<pixel[]>> {
  return getPixels(
    {
      where: {
        org_id: orgId,
      },
    },
    filters
  )
}

export async function createPixel(data: Prisma.PixelUncheckedCreateInput): Promise<pixel> {
  return prisma.client.pixel.create({ data })
}

export async function updatePixel(pixelId: string, data: any): Promise<pixel> {
  return prisma.client.pixel.update({ where: { id: pixelId }, data })
}

export async function deletePixel(pixelId: string): Promise<pixel> {
  return prisma.client.pixel.delete({ where: { id: pixelId } })
}
