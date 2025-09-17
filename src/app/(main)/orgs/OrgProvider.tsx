'use client'
import { createContext, ReactNode } from 'react'
import { useOrgQuery } from '@/components/hooks'
import { Loading } from '@entro314labs/entro-zen'

export const OrgContext = createContext(null)

export function OrgProvider({ orgId, children }: { orgId?: string; children: ReactNode }) {
  const { data: org, isLoading, isFetching } = useOrgQuery(orgId)

  if (isFetching && isLoading) {
    return <Loading position="page" />
  }

  if (!org) {
    return null
  }

  return <OrgContext.Provider value={org}>{children}</OrgContext.Provider>
}
