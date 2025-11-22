'use client'
import { OrgProvider } from '@/app/(main)/orgs/OrgProvider'
import { OrgSettings } from '@/app/(main)/orgs/[orgId]/OrgSettings'

export function OrgSettingsPage({ orgId }: { orgId: string }) {
  return (
    <OrgProvider orgId={orgId}>
      <OrgSettings orgId={orgId} />
    </OrgProvider>
  )
}
