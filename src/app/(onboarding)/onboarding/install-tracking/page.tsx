'use client';

import { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function InstallTrackingPage() {
  const { websiteId, nextStep, skipOnboarding } = useOnboarding();
  const [setupToken, setSetupToken] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'cli' | 'npm' | 'script'>('cli');
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Generate CLI setup token
    async function generateToken() {
      if (!websiteId) {
        console.error('No website ID available');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/cli/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId,
            expiresInMinutes: 15,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate token');
        }

        const data = await response.json();
        setSetupToken(data.token);
        setExpiresAt(new Date(data.expiresAt));

        // Track this step
        await fetch('/api/user/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'step',
            step: 'install-tracking',
            websiteId,
          }),
        });
      } catch (error) {
        console.error('Error generating token:', error);
      } finally {
        setLoading(false);
      }
    }

    generateToken();
  }, [websiteId]);

  useEffect(() => {
    // Update countdown timer
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const cliCommand = `npx @entro314labs/entro-cli init --token ${setupToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleContinue = () => {
    nextStep();
  };

  if (loading) {
    return (
      <>
        <div className="onboarding-progress">
          <div className="progress-dots">
            <span className="progress-dot completed" />
            <span className="progress-dot completed" />
            <span className="progress-dot active" />
            <span className="progress-dot" />
          </div>
        </div>

        <div className="onboarding-card">
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
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
            <p style={{ color: 'var(--onboarding-text-secondary)' }}>Generating setup command...</p>
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
          <span className="progress-dot active" />
          <span className="progress-dot" />
        </div>
      </div>

      <div className="onboarding-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="onboarding-title">Install Tracking Code</h1>
        <p className="onboarding-subtitle">Choose your preferred installation method</p>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            borderBottom: '2px solid var(--onboarding-border)',
          }}
        >
          <button
            onClick={() => setActiveTab('cli')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'cli'
                  ? '2px solid var(--onboarding-primary)'
                  : '2px solid transparent',
              color:
                activeTab === 'cli'
                  ? 'var(--onboarding-primary)'
                  : 'var(--onboarding-text-secondary)',
              fontWeight: activeTab === 'cli' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
            }}
          >
            CLI (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('npm')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'npm'
                  ? '2px solid var(--onboarding-primary)'
                  : '2px solid transparent',
              color:
                activeTab === 'npm'
                  ? 'var(--onboarding-primary)'
                  : 'var(--onboarding-text-secondary)',
              fontWeight: activeTab === 'npm' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
            }}
          >
            NPM Package
          </button>
          <button
            onClick={() => setActiveTab('script')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === 'script'
                  ? '2px solid var(--onboarding-primary)'
                  : '2px solid transparent',
              color:
                activeTab === 'script'
                  ? 'var(--onboarding-primary)'
                  : 'var(--onboarding-text-secondary)',
              fontWeight: activeTab === 'script' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
            }}
          >
            Script Tag
          </button>
        </div>

        {/* CLI Tab */}
        {activeTab === 'cli' && (
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(20, 122, 243, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), var(--onboarding-gradient)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    background: 'var(--onboarding-gradient)',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'Geologica, sans-serif',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      margin: '0 0 0.5rem 0',
                      color: 'var(--onboarding-text-primary)',
                    }}
                  >
                    ⚡ One-Command Setup
                  </h3>
                  <p
                    style={{
                      margin: '0 0 1rem 0',
                      color: 'var(--onboarding-text-secondary)',
                      fontSize: '15px',
                      lineHeight: '1.6',
                    }}
                  >
                    Run this command in your project directory. It will automatically:
                  </p>
                  <ul
                    style={{
                      margin: '0 0 1.5rem 0',
                      padding: '0 0 0 1.25rem',
                      color: 'var(--onboarding-text-secondary)',
                      fontSize: '14px',
                      lineHeight: '1.8',
                    }}
                  >
                    <li>Detect your framework (Next.js, React, Vue, etc.)</li>
                    <li>Install the correct package</li>
                    <li>Configure environment variables</li>
                    <li>Show you how to add the tracking component</li>
                  </ul>

                  {/* Command Box */}
                  <div style={{ position: 'relative' }}>
                    <pre
                      style={{
                        background: '#18181b',
                        color: '#fafafa',
                        padding: '1rem 3rem 1rem 1rem',
                        borderRadius: '8px',
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: '14px',
                        overflow: 'x-auto',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {cliCommand}
                    </pre>
                    <button
                      onClick={handleCopy}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: copied ? '#14b8a6' : '#3f3f46',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <p
                    style={{
                      marginTop: '0.75rem',
                      fontSize: '13px',
                      color: 'var(--onboarding-text-muted)',
                    }}
                  >
                    ⏱️ Token expires in <strong>{timeRemaining}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* What happens section */}
            <div
              style={{
                background: 'var(--onboarding-bg-elevated)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h4
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  margin: '0 0 1rem 0',
                  color: 'var(--onboarding-text-primary)',
                }}
              >
                What happens when you run this?
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    step: '1',
                    title: 'Framework Detection',
                    desc: 'CLI detects your project type automatically',
                  },
                  {
                    step: '2',
                    title: 'Package Installation',
                    desc: 'Installs @entro314labs/entro-nextjs (or your framework)',
                  },
                  {
                    step: '3',
                    title: 'Environment Setup',
                    desc: 'Adds NEXT_PUBLIC_ENTROLYTICS_WEBSITE_ID to .env.local',
                  },
                  {
                    step: '4',
                    title: 'Integration Guide',
                    desc: 'Shows you the exact code to add to your app',
                  },
                ].map(item => (
                  <div
                    key={item.step}
                    style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(20, 122, 243, 0.1)',
                        color: 'var(--onboarding-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '0.25rem' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--onboarding-text-secondary)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NPM Tab */}
        {activeTab === 'npm' && (
          <div
            style={{
              animation: 'fadeInUp 0.4s ease-out',
              fontSize: '15px',
              color: 'var(--onboarding-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            <p>
              Manual installation instructions for your framework. This requires more setup but
              gives you full control.
            </p>
            <p
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'var(--onboarding-bg-elevated)',
                borderRadius: '8px',
              }}
            >
              See our{' '}
              <a
                href="https://docs.entrolytics.click"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--onboarding-primary)', textDecoration: 'underline' }}
              >
                documentation
              </a>{' '}
              for manual installation steps.
            </p>
          </div>
        )}

        {/* Script Tab */}
        {activeTab === 'script' && (
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--onboarding-text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Add this script tag to your HTML (in the {'<head>'} or before {'</body>'}):
            </p>
            <pre
              style={{
                background: '#18181b',
                color: '#fafafa',
                padding: '1rem',
                borderRadius: '8px',
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '13px',
                overflow: 'x-auto',
                margin: 0,
              }}
            >
              {`<script
  defer
  src="https://edge.entrolytics.click/script.js"
  data-website-id="${websiteId}"
></script>`}
            </pre>
          </div>
        )}

        <div className="button-group" style={{ marginTop: '2rem' }}>
          <button className="onboarding-btn-secondary" onClick={skipOnboarding}>
            I'll do this later
          </button>
          <button className="onboarding-btn-primary" onClick={handleContinue}>
            I've installed it →
          </button>
        </div>
      </div>
    </>
  );
}
