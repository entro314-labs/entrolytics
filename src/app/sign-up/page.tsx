'use client';

import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: 'var(--base2)'
    }}>
      <SignUp 
        appearance={{
          elements: {
            rootBox: {
              margin: '0 auto'
            }
          }
        }}
        fallbackRedirectUrl="/"
        signInUrl="/login"
      />
    </div>
  );
}