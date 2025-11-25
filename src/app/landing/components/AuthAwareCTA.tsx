'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface AuthAwareCTAProps {
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function AuthAwareCTA({ className, variant = 'primary' }: AuthAwareCTAProps) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    // Loading state - show a skeleton or disabled button
    return (
      <div
        className={className}
        style={{
          opacity: 0.5,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        }}
      >
        Loading...
      </div>
    );
  }

  if (isSignedIn) {
    // User is authenticated - redirect to dashboard
    return (
      <Link href="/websites" className={className}>
        Go to Dashboard
      </Link>
    );
  }

  // User is not authenticated - show sign up/sign in based on variant
  if (variant === 'primary') {
    return (
      <Link href="/sign-up" className={className}>
        Get Started Free
      </Link>
    );
  }

  return (
    <Link href="/sign-in" className={className}>
      Sign In
    </Link>
  );
}
