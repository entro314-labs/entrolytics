'use client'
import { PageBody } from '@/components/common/PageBody'
import { BoardProvider } from '../BoardProvider'
import { BoardHeader } from './BoardHeader'
import { Panel } from '@/components/common/Panel'
import { Column, Grid, Text, Row } from '@entro314labs/entro-zen'
import { useMessages, useBoardWidgetsQuery, useBoard } from '@/components/hooks'
import { LayoutDashboard } from 'lucide-react'
import { Widget, WidgetAddButton } from './widgets'
import { LoadingPanel } from '@/components/common/LoadingPanel'

function BoardWidgets() {
  const board = useBoard()
  const { formatMessage, labels } = useMessages()
  const { data: widgets, isLoading, isFetching, error } = useBoardWidgetsQuery(board?.boardId)

  const hasWidgets = widgets && widgets.length > 0

  return (
    <Column gap="4">
      <Row justifyContent="flex-end">
        <WidgetAddButton boardId={board?.boardId} />
      </Row>

      <LoadingPanel data={widgets} isLoading={isLoading} isFetching={isFetching} error={error}>
        {hasWidgets ? (
          <Grid columns="repeat(auto-fit, minmax(400px, 1fr))" gap="4">
            {widgets.map((widget: any) => (
              <Widget key={widget.widgetId} widget={widget} />
            ))}
          </Grid>
        ) : (
          <Panel>
            <Column gap="6" alignItems="center" justifyContent="center" minHeight="400px">
              <LayoutDashboard size={48} strokeWidth={1} />
              <Text color="muted">{formatMessage(labels.boardPlaceholder)}</Text>
            </Column>
          </Panel>
        )}
      </LoadingPanel>
    </Column>
  )
}

export function Board({ boardId }: { boardId: string }) {
  return (
    <BoardProvider boardId={boardId}>
      <Grid width="100%" height="100%">
        <Column margin="2">
          <PageBody gap>
            <BoardHeader />
            <BoardWidgets />
          </PageBody>
        </Column>
      </Grid>
    </BoardProvider>
  )
}
