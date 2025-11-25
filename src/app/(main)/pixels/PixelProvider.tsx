'use client';
import { Loading } from '@entro314labs/entro-zen';
import { createContext, type ReactNode } from 'react';
import { usePixelQuery } from '@/components/hooks';

export const PixelContext = createContext(null);

export function PixelProvider({ pixelId, children }: { pixelId?: string; children: ReactNode }) {
  const { data: pixel, isLoading, isFetching } = usePixelQuery(pixelId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!pixel) {
    return null;
  }

  return <PixelContext.Provider value={pixel}>{children}</PixelContext.Provider>;
}
