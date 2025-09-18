import prisma from '@/lib/prisma'
import { Prisma, segment } from '@/generated/prisma/client'
import { PageResult, QueryFilters } from '@/lib/types'

async function findSegment(criteria: Prisma.SegmentFindUniqueArgs): Promise<segment> {
  return prisma.client.segment.findUnique(criteria)
}

export async function getSegment(segmentId: string): Promise<segment> {
  return findSegment({
    where: {
      segment_id: segmentId,
    },
  })
}

export async function getSegments(
  criteria: Prisma.SegmentFindManyArgs,
  filters: QueryFilters
): Promise<PageResult<segment[]>> {
  const { search } = filters
  const { getSearchParameters, pagedQuery } = prisma

  const where: Prisma.SegmentWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [
      {
        name: 'contains',
      },
    ]),
  }

  return pagedQuery('segment', { ...criteria, where }, filters)
}

export async function getWebsiteSegment(websiteId: string, segmentId: string): Promise<segment> {
  return prisma.client.segment.findFirst({
    where: { segment_id: segmentId, website_id: websiteId },
  })
}

export async function getWebsiteSegments(
  websiteId: string,
  type: string,
  filters?: QueryFilters
): Promise<PageResult<segment[]>> {
  return getSegments(
    {
      where: {
        website_id: websiteId,
        type,
      },
    },
    filters
  )
}

export async function createSegment(data: Prisma.SegmentUncheckedCreateInput): Promise<segment> {
  return prisma.client.Segment.create({ data })
}

export async function updateSegment(
  SegmentId: string,
  data: Prisma.SegmentUpdateInput
): Promise<segment> {
  return prisma.client.Segment.update({ where: { id: SegmentId }, data })
}

export async function deleteSegment(SegmentId: string): Promise<segment> {
  return prisma.client.Segment.delete({ where: { id: SegmentId } })
}
