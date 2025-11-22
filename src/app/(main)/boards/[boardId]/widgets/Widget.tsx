'use client'
import { Column, Row, Text, Heading } from '@entro314labs/entro-zen'
import { Panel } from '@/components/common/Panel'
import { StatsWidget } from './StatsWidget'
import { ChartWidget } from './ChartWidget'
import { ListWidget } from './ListWidget'
import { MapWidget } from './MapWidget'
import { HeatmapWidget } from './HeatmapWidget'
import { WidgetDeleteButton } from './WidgetDeleteButton'

export interface WidgetData {
  widgetId: string
  boardId: string
  websiteId: string
  type: 'stats' | 'chart' | 'list' | 'map' | 'heatmap'
  title?: string
  config?: any
  position: number
}

export interface WidgetProps {
  widget: WidgetData
  websiteName?: string
}

export function Widget({ widget, websiteName }: WidgetProps) {
  const { widgetId, boardId, websiteId, type, title, config } = widget

  const renderWidget = () => {
    switch (type) {
      case 'stats':
        return <StatsWidget websiteId={websiteId} />
      case 'chart':
        return <ChartWidget websiteId={websiteId} />
      case 'list':
        return <ListWidget websiteId={websiteId} config={config} />
      case 'map':
        return <MapWidget websiteId={websiteId} />
      case 'heatmap':
        return <HeatmapWidget websiteId={websiteId} />
      default:
        return <Text color="muted">Unknown widget type</Text>
    }
  }

  return (
    <Panel>
      <Column gap="4">
        <Row justifyContent="space-between" alignItems="center">
          <Column gap="1">
            {title && <Heading size="3">{title}</Heading>}
            {websiteName && (
              <Text size="2" color="muted">
                {websiteName}
              </Text>
            )}
          </Column>
          <WidgetDeleteButton widgetId={widgetId} boardId={boardId} title={title} />
        </Row>
        {renderWidget()}
      </Column>
    </Panel>
  )
}
