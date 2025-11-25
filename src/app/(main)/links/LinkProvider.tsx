'use client';
import { Loading } from '@entro314labs/entro-zen';
import { createContext, type ReactNode } from 'react';
import { useLinkQuery } from '@/components/hooks';

export const LinkContext = createContext(null);

export function LinkProvider({ linkId, children }: { linkId?: string; children: ReactNode }) {
  const { data: link, isLoading, isFetching } = useLinkQuery(linkId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!link) {
    return null;
  }

  return <LinkContext.Provider value={link}>{children}</LinkContext.Provider>;
}
