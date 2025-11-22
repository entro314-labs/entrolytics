'use client'
import { createContext, ReactNode } from 'react'
import { useBoardQuery } from '@/components/hooks'
import { Loading } from '@entro314labs/entro-zen'

export const BoardContext = createContext(null)

export function BoardProvider({ boardId, children }: { boardId?: string; children: ReactNode }) {
  const { data: board, isLoading, isFetching } = useBoardQuery(boardId)

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />
  }

  if (!board) {
    return null
  }

  return <BoardContext.Provider value={board}>{children}</BoardContext.Provider>
}
