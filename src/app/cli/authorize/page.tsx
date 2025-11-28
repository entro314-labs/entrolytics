'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, Suspense } from 'react';

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [status, setStatus] = useState<'loading' | 'authorizing' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  const port = searchParams.get('port');

  useEffect(() => {
    if (!authLoaded || !userLoaded) return;

    // Not signed in - redirect to sign in
    if (!isSignedIn) {
      const returnUrl = `/cli/authorize?port=${port}`;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Signed in - generate auth code and redirect back to CLI
    const authorizeCliSession = async () => {
      setStatus('authorizing');

      try {
        const response = await fetch('/api/cli/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ port }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Authorization failed');
        }

        const { code } = await response.json();

        // Redirect to CLI callback
        setStatus('success');
        window.location.href = `http://localhost:${port}?code=${code}`;
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    if (port) {
      authorizeCliSession();
    } else {
      setStatus('error');
      setError('Missing callback port');
    }
  }, [authLoaded, userLoaded, isSignedIn, port, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Entrolytics CLI Authorization
        </h1>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        )}

        {status === 'authorizing' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-gray-600 dark:text-gray-300">
              Authorizing CLI for <strong>{user?.primaryEmailAddress?.emailAddress}</strong>...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-green-500 text-5xl">✓</div>
            <p className="text-gray-600 dark:text-gray-300">
              Authorization successful! You can close this window and return to your terminal.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-500 text-5xl">✗</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Please close this window and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CliAuthorizePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <AuthorizeContent />
    </Suspense>
  );
}
