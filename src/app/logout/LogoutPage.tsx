'use client';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setUser } from '@/store/app';

export function LogoutPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const disabled = process.env.EDGE_MODE;

  useEffect(() => {
    async function logout() {
      if (!disabled) {
        setUser(null);
        await signOut();
        router.push('/sign-in');
      }
    }

    logout();
  }, [disabled, router, signOut]);

  return null;
}
