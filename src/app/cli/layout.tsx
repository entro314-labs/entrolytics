import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CLI Authorization - Entrolytics',
  description: 'Authorize Entrolytics CLI to access your account',
};

export default function CliLayout({ children }: { children: React.ReactNode }) {
  return children;
}
