import { BoardContext } from '@/app/(main)/boards/BoardProvider'
import { useContext } from 'react'

export function useBoard() {
  return useContext(BoardContext)
}
