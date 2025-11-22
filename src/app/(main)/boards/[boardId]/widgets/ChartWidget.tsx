'use client'
import { useDateRange, useWebsitePageviewsQuery } from '@/components/hooks'
import { PageviewsChart } from '@/components/metrics/PageviewsChart'
import { LoadingPanel } from '@/components/common/LoadingPanel'

export interface ChartWidgetProps {
  websiteId: string
}

export function ChartWidget({ websiteId }: ChartWidgetProps) {
  const { dateRange } = useDateRange()
  const { data, isLoading, isFetching, error } = useWebsitePageviewsQuery({ websiteId })

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && (
        <PageviewsChart
          data={data}
          unit={dateRange.unit}
          minDate={new Date(dateRange.startDate)}
          maxDate={new Date(dateRange.endDate)}
        />
      )}
    </LoadingPanel>
  )
}
