import { Prisma, report } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'
import { PageResult, QueryFilters } from '@/lib/types'
import ReportFindManyArgs = Prisma.ReportFindManyArgs

async function findReport(criteria: Prisma.ReportFindUniqueArgs): Promise<report> {
  return prisma.client.report.findUnique(criteria)
}

export async function getReport(reportId: string): Promise<report> {
  return findReport({
    where: {
      report_id: reportId,
    },
  })
}

export async function getReports(
  criteria: ReportFindManyArgs,
  filters: QueryFilters = {}
): Promise<PageResult<report[]>> {
  const { search } = filters

  const where: Prisma.ReportWhereInput = {
    ...criteria.where,
    ...prisma.getSearchParameters(search, [
      { name: 'contains' },
      { description: 'contains' },
      { type: 'contains' },
      {
        user: {
          display_name: 'contains',
        },
      },
      {
        user: {
          email: 'contains',
        },
      },
      {
        website: {
          name: 'contains',
        },
      },
      {
        website: {
          domain: 'contains',
        },
      },
    ]),
  }

  return prisma.pagedQuery('report', { ...criteria, where }, filters)
}

export async function getUserReports(
  userId: string,
  filters?: QueryFilters
): Promise<PageResult<report[]>> {
  return getReports(
    {
      where: {
        userId,
      },
      include: {
        website: {
          select: {
            domain: true,
            userId: true,
          },
        },
      },
    },
    filters
  )
}

export async function getWebsiteReports(
  websiteId: string,
  filters: QueryFilters = {}
): Promise<PageResult<report[]>> {
  return getReports(
    {
      where: {
        websiteId,
      },
    },
    filters
  )
}

export async function createReport(data: Prisma.ReportUncheckedCreateInput): Promise<report> {
  return prisma.client.report.create({ data })
}

export async function updateReport(reportId: string, data: any): Promise<report> {
  return prisma.client.report.update({ where: { id: reportId }, data })
}

export async function deleteReport(reportId: string): Promise<report> {
  return prisma.client.report.delete({ where: { id: reportId } })
}
