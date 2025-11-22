'use client'
import { PageBody } from '@/components/common/PageBody'
import { Column } from '@entro314labs/entro-zen'
import { PageHeader } from '@/components/common/PageHeader'
import { BoardAddButton } from './BoardAddButton'
import { useMessages, useNavigation } from '@/components/hooks'
import { BoardsDataTable } from './BoardsDataTable'
import { Panel } from '@/components/common/Panel'

export function BoardsPage() {
  const { formatMessage, labels } = useMessages()
  const { orgId } = useNavigation()

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.boards)}>
          <BoardAddButton orgId={orgId} />
        </PageHeader>
        <Panel>
          <BoardsDataTable />
        </Panel>
      </Column>
    </PageBody>
  )
}
