import { Column } from '@entro314labs/entro-zen'

export interface BoardProps {
  children?: React.ReactNode
}

export function Board({ children }: BoardProps) {
  return <Column>{children}</Column>
}
