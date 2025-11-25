import type { Metadata } from 'next';
import { LogoutPage } from './LogoutPage';

export default function () {
  if (process.env.DISABLE_LOGIN) {
    return null;
  }

  return <LogoutPage />;
}

export const metadata: Metadata = {
  title: 'Logout',
};
