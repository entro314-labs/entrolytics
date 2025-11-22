import { useEffect, useMemo } from 'react'
import { Icon, Text, Row } from '@entro314labs/entro-zen'
import { LinkButton } from '@/components/common/LinkButton'
import { LoadingPanel } from '@/components/common/LoadingPanel'
import { useMessages, useNavigation, useWebsiteMetricsQuery } from '@/components/hooks'
import { Maximize } from '@/components/icons'
import { percentFilter } from '@/lib/filters'
import { ListTable, ListTableProps } from './ListTable'
import { MetricLabel } from '@/components/metrics/MetricLabel'

export interface MetricsTableProps extends ListTableProps {
  websiteId: string
  type: string
  dataFilter?: (data: any) => any
  limit?: number
  showMore?: boolean
  filterLink?: boolean
  params?: Record<string, any>
  onDataLoad?: (data: any) => void
}

export function MetricsTable({
  websiteId,
  type,
  dataFilter,
  limit,
  showMore = false,
  filterLink = true,
  params,
  onDataLoad,
  ...props
}: MetricsTableProps) {
  const { updateParams } = useNavigation()
  const { formatMessage, labels } = useMessages()
  const { data, isLoading, isFetching, error } = useWebsiteMetricsQuery(websiteId, {
    type,
    limit,
    ...params,
  })

  const filteredData = useMemo(() => {
    if (data && Array.isArray(data)) {
      let items = data as any[]

      if (dataFilter) {
        if (Array.isArray(dataFilter)) {
          items = dataFilter.reduce((arr, filter) => {
            const result = filter(arr)
            return Array.isArray(result) ? result : []
          }, items)
        } else {
          const result = dataFilter(items)
          items = Array.isArray(result) ? result : []
        }
      }

      items = percentFilter(items)

      // Ensure items is still an array after percentFilter
      if (!Array.isArray(items)) {
        console.warn('MetricsTable: percentFilter returned non-array:', items)
        return []
      }

      return items.map(({ x, y, z, ...props }, index) => ({
        label: x != null ? String(x) : `item-${index}`,
        count: typeof y === 'number' ? y : 0,
        percent: typeof z === 'number' ? z : 0,
        ...props,
      }))
    }
    return []
  }, [data, dataFilter, limit, type])

  useEffect(() => {
    if (data) {
      onDataLoad?.(data)
    }
  }, [data])

  const renderLabel = (row: any) => {
    return filterLink ? <MetricLabel type={type} data={row} /> : row.label
  }

  return (
    <LoadingPanel
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
      minHeight="400px"
    >
      <div style={{ display: 'grid', gridTemplateRows: '1fr auto', minHeight: '400px' }}>
        <div>{data && <ListTable {...props} data={filteredData} renderLabel={renderLabel} />}</div>
        <div>
          {showMore && limit && (
            <Row justifyContent="center" alignItems="flex-end">
              <LinkButton href={updateParams({ view: type })} variant="quiet">
                <Icon size="sm">
                  <Maximize />
                </Icon>
                <Text>{formatMessage(labels.more)}</Text>
              </LinkButton>
            </Row>
          )}
        </div>
      </div>
    </LoadingPanel>
  )
}
