'use client'

import { useBreakpoint } from '@entro314labs/entro-zen'

export function useMobile() {
  const breakpoint = useBreakpoint()
  const isMobile = ['xs', 'sm', 'md'].includes(breakpoint)
  const isPhone = ['xs', 'sm'].includes(breakpoint)

  return { breakpoint, isMobile, isPhone }
}
