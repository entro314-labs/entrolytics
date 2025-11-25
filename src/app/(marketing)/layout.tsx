import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  // This layout wraps all marketing pages
  // The actual MarketingLayout component with Navbar/Footer
  // is used at the page level for more flexibility
  return <>{children}</>;
}
