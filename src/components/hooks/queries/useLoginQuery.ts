import { useApp, setUser } from '@/store/app';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

const selector = (state: { user: any }) => state.user;

export function useLoginQuery() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const user = useApp(selector);

  useEffect(() => {
    if (isClerkLoaded && isSignedIn && clerkUser && !user) {
      // Transform Clerk user to app user format
      const appUser = {
        id: clerkUser.id,
        username: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role: 'user', // Default role, could be enhanced with Clerk metadata
      };
      setUser(appUser);
    } else if (isClerkLoaded && !isSignedIn && user) {
      setUser(null);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser, user]);

  return { 
    user, 
    setUser, 
    isLoading: !isClerkLoaded,
    error: null,
  };
}
