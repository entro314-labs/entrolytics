import type { Metadata } from 'next';
import { Suspense } from 'react';

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}

export const metadata: Metadata = {
  title: 'Connect Integration | Entrolytics',
};
