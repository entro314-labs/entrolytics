'use client'
import { ReactNode } from 'react'
import { AlertBanner, Loading, Column, ColumnProps } from '@entro314labs/entro-zen'
import { useMessages } from '@/components/hooks'

export function PageBody({
  maxWidth = '1320px',
  error,
  isLoading,
  children,
  ...props
}: {
  maxWidth?: string
  error?: unknown
  isLoading?: boolean
  children?: ReactNode
} & ColumnProps) {
  const { formatMessage, messages } = useMessages()

  if (error) {
    return <AlertBanner title={formatMessage(messages.error)} variant="error" />
  }

  if (isLoading) {
    return <Loading placement="absolute" />
  }

  return (
    <Column
      {...props}
      width="100%"
      paddingBottom="6"
      paddingX={{ xs: '3', md: '6' }}
      maxWidth={maxWidth}
      style={{ margin: '0 auto' }}
    >
      {children}
    </Column>
  )
}
