'use client';

import { OnboardingProvider } from '@/contexts/OnboardingContext';
import '@/styles/onboarding.css';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <div className="onboarding-container">
        <div className="onboarding-background">
          <div className="gradient-mesh" />
          <div className="grid-pattern" />
        </div>
        <div className="onboarding-content">{children}</div>
      </div>
    </OnboardingProvider>
  );
}
