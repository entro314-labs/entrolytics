'use client';

import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function OnboardingRootPage() {
  const { goToStep, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to the first step
      goToStep('welcome');
    }
  }, [isLoading, goToStep]);

  if (isLoading) {
    return (
      <div className="onboarding-card">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div
            className="spin"
            style={{
              width: '40px',
              height: '40px',
              margin: '0 auto 1rem',
              border: '3px solid var(--onboarding-border)',
              borderTopColor: 'var(--onboarding-primary)',
              borderRadius: '50%',
            }}
          />
          <p style={{ color: 'var(--onboarding-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
