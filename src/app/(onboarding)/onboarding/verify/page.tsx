'use client';

import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function VerifyTrackingPage() {
  const { websiteId, completeOnboarding, skipOnboarding } = useOnboarding();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [eventsDetected, setEventsDetected] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [dots, setDots] = useState('.');

  useEffect(() => {
    // Animate the dots
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!websiteId) {
      console.error('No website ID available');
      return;
    }

    let pollInterval: NodeJS.Timeout;

    const checkForEvents = async () => {
      try {
        const response = await fetch(`/api/websites/${websiteId}/recent-events`);

        if (response.ok) {
          const data = await response.json();
          const count = data.events?.length || 0;

          if (count > 0 && !eventsDetected) {
            setEventsDetected(true);
            setEventCount(count);
            setChecking(false);

            // Trigger confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#147af3', '#06b6d4', '#14b8a6'],
            });

            // Track completion
            await fetch('/api/user/onboarding', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'step',
                step: 'verify',
                websiteId,
              }),
            });

            // Auto-complete after 2 seconds
            setTimeout(async () => {
              await completeOnboarding();
              router.push('/dashboard');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking for events:', error);
      }
    };

    // Initial check
    checkForEvents();

    // Poll every 3 seconds
    pollInterval = setInterval(checkForEvents, 3000);

    return () => clearInterval(pollInterval);
  }, [websiteId, eventsDetected, completeOnboarding, router]);

  const handleSkip = async () => {
    await skipOnboarding();
    router.push('/dashboard');
  };

  if (eventsDetected) {
    return (
      <>
        <div className="onboarding-progress">
          <div className="progress-dots">
            <span className="progress-dot completed" />
            <span className="progress-dot completed" />
            <span className="progress-dot completed" />
            <span className="progress-dot completed" />
          </div>
        </div>

        <div className="onboarding-card" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #147af3 0%, #06b6d4 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <h1
            className="onboarding-title"
            style={{
              background: 'var(--onboarding-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🎉 Tracking Verified!
          </h1>
          <p className="onboarding-subtitle">
            We detected {eventCount} event{eventCount !== 1 ? 's' : ''} from your website
          </p>

          <div
            style={{
              background: 'var(--onboarding-bg-elevated)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginTop: '2rem',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                color: 'var(--onboarding-text-secondary)',
                lineHeight: '1.6',
              }}
            >
              Your analytics are working perfectly! Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="onboarding-progress">
        <div className="progress-dots">
          <span className="progress-dot completed" />
          <span className="progress-dot completed" />
          <span className="progress-dot completed" />
          <span className="progress-dot active" />
        </div>
      </div>

      <div className="onboarding-card" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              borderRadius: '50%',
              border: '4px solid var(--onboarding-border)',
              borderTopColor: 'var(--onboarding-primary)',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>

        <h1 className="onboarding-title">Waiting for First Event{dots}</h1>
        <p className="onboarding-subtitle">
          Visit your website or trigger a page view to complete setup
        </p>

        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(20, 122, 243, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '2px solid rgba(20, 122, 243, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '2rem',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              marginBottom: '1rem',
              color: 'var(--onboarding-text-primary)',
            }}
          >
            💡 Quick Test Tips
          </h3>
          <ul
            style={{
              margin: 0,
              padding: '0 0 0 1.5rem',
              fontSize: '14px',
              color: 'var(--onboarding-text-secondary)',
              lineHeight: '1.8',
            }}
          >
            <li>Open your website in a new browser tab</li>
            <li>Navigate between different pages</li>
            <li>Wait a few seconds for the event to be processed</li>
            <li>Try opening in an incognito window</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--onboarding-bg-elevated)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--onboarding-text-secondary)',
          }}
        >
          <p style={{ margin: 0 }}>
            🔍 We're checking for events every 3 seconds. This page will update automatically.
          </p>
        </div>

        <button
          className="onboarding-btn-secondary"
          onClick={handleSkip}
          style={{ marginTop: '2rem' }}
        >
          Skip verification for now
        </button>
      </div>
    </>
  );
}
