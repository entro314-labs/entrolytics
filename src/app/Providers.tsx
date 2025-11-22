'use client'
import { useEffect } from 'react'
import { IntlProvider } from 'react-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ZenProvider, RouterProvider } from '@entro314labs/entro-zen'
import { ClerkProvider } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useLocale } from '@/components/hooks'
import 'chartjs-adapter-date-fns'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
})

function MessagesProvider({ children }) {
  const { locale, messages, dir } = useLocale()

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', locale)
  }, [locale, dir])

  return (
    <IntlProvider locale={locale} messages={messages[locale]} onError={() => null}>
      {children}
    </IntlProvider>
  )
}

export function Providers({ children }) {
  const router = useRouter()

  return (
    <ClerkProvider dynamic>
      <ZenProvider>
        <RouterProvider navigate={router.push}>
          <MessagesProvider>
            <QueryClientProvider client={client}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </QueryClientProvider>
          </MessagesProvider>
        </RouterProvider>
      </ZenProvider>
    </ClerkProvider>
  )
}
