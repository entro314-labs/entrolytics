import { Suspense } from 'react';
import { Metadata } from 'next';

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}

export const metadata: Metadata = {
  title: 'Connect Integration | Entrolytics',
};
