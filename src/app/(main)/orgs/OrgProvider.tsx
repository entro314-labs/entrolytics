'use client';
import { Loading } from '@entro314labs/entro-zen';
import { createContext, type ReactNode } from 'react';
import { useOrgQuery } from '@/components/hooks';

export const OrgContext = createContext(null);

export function OrgProvider({ orgId, children }: { orgId?: string; children: ReactNode }) {
  const { data: org, isLoading, isFetching } = useOrgQuery(orgId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!org) {
    return null;
  }

  return <OrgContext.Provider value={org}>{children}</OrgContext.Provider>;
}
