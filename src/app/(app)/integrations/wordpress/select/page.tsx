'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './WordPressSelect.module.css';

interface ConnectData {
  callback_url: string;
  site_url: string;
  site_name: string;
  state: string;
  platform: string;
  version?: string;
}

interface Website {
  websiteId: string;
  name: string;
  domain: string;
  createdAt: string;
}

export default function WordPressSelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connectData, setConnectData] = useState<ConnectData | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError('Missing connection data. Please try again from WordPress.');
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(decodeURIComponent(dataParam)) as ConnectData;
      setConnectData(data);
      fetchWebsites();
    } catch {
      setError('Invalid connection data. Please try again from WordPress.');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites');
      if (!response.ok) throw new Error('Failed to fetch websites');
      const data = await response.json();
      setWebsites(data.data || []);
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError('Failed to load your websites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWebsite = (websiteId: string) => {
    setSelectedWebsite(websiteId);
  };

  const handleConnect = async () => {
    if (!selectedWebsite || !connectData) return;

    const website = websites.find(w => w.websiteId === selectedWebsite);
    if (!website) return;

    // Build callback URL with website info
    const callbackUrl = new URL(connectData.callback_url);
    callbackUrl.searchParams.set('website_id', website.websiteId);
    callbackUrl.searchParams.set('website_name', website.name);
    callbackUrl.searchParams.set('state', connectData.state);

    // Redirect back to WordPress
    window.location.href = callbackUrl.toString();
  };

  const handleCreateAndConnect = async () => {
    if (!connectData) return;

    setCreating(true);
    try {
      // Extract domain from site_url
      const siteUrl = new URL(connectData.site_url);
      const domain = siteUrl.hostname;

      // Create new website
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: connectData.site_name || domain,
          domain: domain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create website');
      }

      const newWebsite = await response.json();

      // Build callback URL with new website info
      const callbackUrl = new URL(connectData.callback_url);
      callbackUrl.searchParams.set('website_id', newWebsite.websiteId);
      callbackUrl.searchParams.set('website_name', newWebsite.name);
      callbackUrl.searchParams.set('state', connectData.state);

      // Redirect back to WordPress
      window.location.href = callbackUrl.toString();
    } catch (err) {
      console.error('Error creating website:', err);
      setError(err instanceof Error ? err.message : 'Failed to create website');
      setCreating(false);
    }
  };

  const handleCancel = () => {
    if (!connectData) {
      router.push('/');
      return;
    }

    // Redirect back to WordPress with error
    const callbackUrl = new URL(connectData.callback_url);
    callbackUrl.searchParams.set('error', 'access_denied');
    callbackUrl.searchParams.set('error_description', 'User cancelled the connection');
    callbackUrl.searchParams.set('state', connectData.state);

    window.location.href = callbackUrl.toString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.error}>
            <h2>Connection Error</h2>
            <p>{error}</p>
            <button onClick={() => router.push('/')} className={styles.button}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Connect WordPress Site</h1>
          <p className={styles.siteInfo}>
            Connecting <strong>{connectData?.site_name}</strong>
            <br />
            <span className={styles.siteUrl}>{connectData?.site_url}</span>
          </p>
        </div>

        <div className={styles.content}>
          {websites.length > 0 ? (
            <>
              <h3>Select an existing website:</h3>
              <div className={styles.websiteList}>
                {websites.map(website => (
                  <div
                    key={website.websiteId}
                    className={`${styles.websiteItem} ${selectedWebsite === website.websiteId ? styles.selected : ''}`}
                    onClick={() => handleSelectWebsite(website.websiteId)}
                  >
                    <div className={styles.websiteInfo}>
                      <span className={styles.websiteName}>{website.name}</span>
                      <span className={styles.websiteDomain}>{website.domain}</span>
                    </div>
                    <div className={styles.radioIndicator}>
                      {selectedWebsite === website.websiteId && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.divider}>
                <span>or</span>
              </div>
            </>
          ) : null}

          <button
            onClick={handleCreateAndConnect}
            className={`${styles.button} ${styles.secondary}`}
            disabled={creating}
          >
            {creating ? 'Creating...' : `Create new website for ${connectData?.site_name}`}
          </button>
        </div>

        <div className={styles.actions}>
          <button onClick={handleCancel} className={`${styles.button} ${styles.ghost}`}>
            Cancel
          </button>
          {selectedWebsite && (
            <button onClick={handleConnect} className={styles.button}>
              Connect Selected Website
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
