'use client'
import { Column, Row, Heading, Text } from '@entro314labs/entro-zen'
import { useBoard, useMessages } from '@/components/hooks'
import { BoardEditButton } from '../BoardEditButton'
import { BoardDeleteButton } from '../BoardDeleteButton'

export function BoardHeader() {
  const board = useBoard()
  const { formatMessage, labels } = useMessages()

  if (!board) {
    return null
  }

  return (
    <Row justifyContent="space-between" alignItems="flex-start">
      <Column gap="1">
        <Heading size="1">{board.name}</Heading>
        {board.description && (
          <Text color="muted">{board.description}</Text>
        )}
      </Column>
      <Row gap="2">
        <BoardEditButton boardId={board.boardId} />
        <BoardDeleteButton boardId={board.boardId} name={board.name} />
      </Row>
    </Row>
  )
}
