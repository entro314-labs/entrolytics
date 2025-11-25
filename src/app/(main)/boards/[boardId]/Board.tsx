'use client';
import { Column, Grid, Row, Text } from '@entro314labs/entro-zen';
import { LayoutDashboard } from 'lucide-react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';
import { useBoard, useBoardWidgetsQuery, useMessages } from '@/components/hooks';
import { BoardProvider } from '../BoardProvider';
import { BoardHeader } from './BoardHeader';
import { Widget, WidgetAddButton } from './widgets';

function BoardWidgets() {
  const board = useBoard();
  const { formatMessage, labels } = useMessages();
  const { data: widgets, isLoading, isFetching, error } = useBoardWidgetsQuery(board?.boardId);

  const hasWidgets = widgets && widgets.length > 0;

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
  );
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
  );
}
