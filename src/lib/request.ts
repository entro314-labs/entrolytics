import { headers } from 'next/headers';
import { z } from 'zod/v4';
import { getCurrentUser, parseShareToken } from '@/lib/auth';
import { DEFAULT_PAGE_SIZE, FILTER_COLUMNS, ROLE_PERMISSIONS } from '@/lib/constants';
import { getAllowedUnits, getMinimumUnit, maxDate, parseDateRange } from '@/lib/date';
import { fetchWebsite } from '@/lib/load';
import { filtersArrayToObject } from '@/lib/params';
import { badRequest, unauthorized } from '@/lib/response';
import type { QueryFilters } from '@/lib/types';
import { getWebsiteSegment } from '@/queries/drizzle';

/**
 * Get permissions (grant array) for a user based on their platform and org roles
 * Implements Clerk RBAC with proper permission mapping
 */
function getGrantsFromRoles(platformRole: string, orgRole?: string): string[] {
  const platformPermissions = ROLE_PERMISSIONS[platformRole] || [];

  // If user has org role, add org-specific permissions
  if (orgRole) {
    const orgPermissions = ROLE_PERMISSIONS[orgRole] || [];
    // Combine platform and org permissions, remove duplicates
    return Array.from(new Set([...platformPermissions, ...orgPermissions]));
  }

  return platformPermissions;
}

export async function parseRequest(
  request: Request,
  schema?: any,
  options?: { skipAuth: boolean },
): Promise<any> {
  // Handle build-time scenarios where request or request.url might be undefined
  if (
    !request ||
    !request.url ||
    typeof request.url !== 'string' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    return { url: null, query: {}, body: {}, auth: null, error: null };
  }

  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  let body = await getJsonBody(request);
  let error: () => void | undefined;
  let auth = null;

  if (schema) {
    const isGet = request.method === 'GET';
    const result = schema.safeParse(isGet ? query : body);

    if (!result.success) {
      error = () => badRequest(z.treeifyError(result.error));
    } else if (isGet) {
      query = result.data;
    } else {
      body = result.data;
    }
  }

  if (!options?.skipAuth && !error) {
    // Skip auth during build time
    if (request && request.url && typeof request.url === 'string') {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        error = () => unauthorized();
        auth = null;
      } else {
        // Get user permissions based on platform and org roles
        const grant = getGrantsFromRoles(currentUser.role, currentUser.orgRole || undefined);

        // Parse share token from headers if present
        const headersList = await headers();
        const shareToken = parseShareToken(headersList);

        // Wrap user in Auth interface structure
        auth = {
          user: currentUser,
          clerkUserId: currentUser.clerkId,
          grant,
          shareToken,
        };
      }
    }
  }
  // When skipAuth is true, auth remains null but no error is set

  return { url, query, body, auth, error };
}

export async function getJsonBody(request: Request) {
  try {
    if (!request || typeof request.clone !== 'function') {
      return {};
    }
    return await request.clone().json();
  } catch {
    return {};
  }
}

export function getRequestDateRange(query: Record<string, string>) {
  const { startAt, endAt, unit, timezone } = query;

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);

  return {
    startDate,
    endDate,
    timezone,
    unit: getAllowedUnits(startDate, endDate).includes(unit)
      ? unit
      : getMinimumUnit(startDate, endDate),
  };
}

export function getRequestFilters(query: Record<string, any>) {
  const result: Record<string, any> = {};

  for (const key of Object.keys(FILTER_COLUMNS)) {
    const value = query[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

export async function setWebsiteDate(websiteId: string, data: Record<string, any>) {
  const website = await fetchWebsite(websiteId);

  if (website?.resetAt) {
    data.startDate = maxDate(data.startDate, new Date(website.resetAt));
  }

  return data;
}

export async function getQueryFilters(
  params: Record<string, any>,
  websiteId?: string,
): Promise<QueryFilters> {
  const dateRange = getRequestDateRange(params);
  const filters = getRequestFilters(params);

  if (websiteId) {
    await setWebsiteDate(websiteId, dateRange);

    if (params.segment) {
      const segmentParams = (await getWebsiteSegment(websiteId, params.segment))
        ?.parameters as Record<string, any>;

      Object.assign(filters, filtersArrayToObject(segmentParams.filters));
    }

    if (params.cohort) {
      const cohortParams = (await getWebsiteSegment(websiteId, params.cohort))
        ?.parameters as Record<string, any>;

      const { startDate, endDate } = parseDateRange(cohortParams.dateRange);

      const cohortFilters = cohortParams.filters.map(({ name, ...props }) => ({
        ...props,
        name: `cohort_${name}`,
      }));

      cohortFilters.push({
        name: `cohort_${cohortParams.action.type}`,
        operator: 'eq',
        value: cohortParams.action.value,
      });

      Object.assign(filters, {
        ...filtersArrayToObject(cohortFilters),
        cohort_startDate: startDate,
        cohort_endDate: endDate,
      });
    }
  }

  return {
    ...dateRange,
    ...filters,
    page: params?.page,
    pageSize: params?.pageSize ? params?.pageSize || DEFAULT_PAGE_SIZE : undefined,
    orderBy: params?.orderBy,
    sortDescending: params?.sortDescending,
    search: params?.search,
    compare: params?.compare,
  };
}
