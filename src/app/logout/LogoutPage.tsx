'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { setUser } from '@/store/app';

export function LogoutPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const disabled = process.env.cloudMode;

  useEffect(() => {
    async function logout() {
      if (!disabled) {
        setUser(null);
        await signOut();
        router.push('/login');
      }
    }

    logout();
  }, [disabled, router, signOut]);

  return null;
}
