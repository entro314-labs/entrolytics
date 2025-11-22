'use client'
import { useMessages, useWebsiteMetricsQuery } from '@/components/hooks'
import { ListTable } from '@/components/metrics/ListTable'
import { LoadingPanel } from '@/components/common/LoadingPanel'

export interface ListWidgetConfig {
  type?: string // path, country, browser, os, device, referrer, channel, etc.
  limit?: number
}

export interface ListWidgetProps {
  websiteId: string
  config?: ListWidgetConfig
}

const TYPE_LABELS: Record<string, string> = {
  path: 'pages',
  country: 'countries',
  browser: 'browsers',
  os: 'os',
  device: 'devices',
  referrer: 'referrers',
  channel: 'channels',
  entry: 'entryPages',
  exit: 'exitPages',
  city: 'cities',
  region: 'regions',
}

export function ListWidget({ websiteId, config }: ListWidgetProps) {
  const { formatMessage, labels } = useMessages()
  const listType = config?.type || 'path'
  const limit = config?.limit || 10

  const { data, isLoading, isFetching, error } = useWebsiteMetricsQuery(websiteId, {
    type: listType,
    limit,
  })

  const labelKey = TYPE_LABELS[listType] || listType
  const title = labels[labelKey] ? formatMessage(labels[labelKey]) : listType

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      <ListTable
        data={data}
        title={title}
        metric={formatMessage(labels.visitors)}
        itemCount={limit}
      />
    </LoadingPanel>
  )
}
