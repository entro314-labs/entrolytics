import { ReactNode } from 'react'
import { Row, Text, Icon, DataTable, DataColumn, MenuItem } from '@entro314labs/entro-zen'
import { useMessages, useNavigation } from '@/components/hooks'
import { MenuButton } from '@/components/input/MenuButton'
import { Eye, SquarePen } from '@/components/icons'
import Link from 'next/link'

export interface WebsitesTableProps {
  data: Record<string, any>[]
  showActions?: boolean
  allowEdit?: boolean
  allowView?: boolean
  orgId?: string
  children?: ReactNode
}

export function WebsitesTable({
  data = [],
  showActions,
  allowEdit,
  allowView,
  children,
}: WebsitesTableProps) {
  const { formatMessage, labels } = useMessages()
  const { renderUrl, pathname } = useNavigation()
  const isSettings = pathname.includes('/settings')

  // Defensive guards
  if (!data || !Array.isArray(data) || data.length === 0) {
    return children || null
  }

  // Additional safety check for data integrity
  const safeData = data.filter(item => {
    const website = item?.website || item
    return website && (website.websiteId || website.id)
  })

  if (safeData.length === 0) {
    return children || null
  }

  return (
    <DataTable
      data={safeData}
      rowKey={(row: any) => {
        const id = row.website?.websiteId || row.websiteId
        if (!id) {
          console.warn('WebsitesTable: Missing websiteId for row:', row)
          return `fallback-${JSON.stringify(row).slice(0, 50)}`
        }
        return id
      }}
      aria-label="Websites list"
      role="table"
    >
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => {
          const website = row.website || row
          const websiteId = website.websiteId
          const name = website.name

          return (
            <Link href={renderUrl(`${isSettings ? '/settings' : ''}/websites/${websiteId}`, false)}>
              {name}
            </Link>
          )
        }}
      </DataColumn>
      <DataColumn id="domain" label={formatMessage(labels.domain)}>
        {(row: any) => {
          const website = row.website || row
          return website.domain
        }}
      </DataColumn>
      {showActions && (
        <DataColumn id="action" label=" " align="end">
          {(row: any) => {
            const website = row.website || row
            const websiteId = website.websiteId

            return (
              <MenuButton>
                {allowView && (
                  <MenuItem href={renderUrl(`/websites/${websiteId}`)}>
                    <Row alignItems="center" gap>
                      <Icon data-test="link-button-view">
                        <Eye />
                      </Icon>
                      <Text>{formatMessage(labels.view)}</Text>
                    </Row>
                  </MenuItem>
                )}
                {allowEdit && (
                  <MenuItem href={renderUrl(`/websites/${websiteId}/settings`)}>
                    <Row alignItems="center" gap>
                      <Icon data-test="link-button-edit">
                        <SquarePen />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Row>
                  </MenuItem>
                )}
              </MenuButton>
            )
          }}
        </DataColumn>
      )}
    </DataTable>
  )
}
