import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingLayout } from '@/components/marketing';
import contentStyles from '@/components/marketing/ContentPage.module.css';
import styles from './changelog.module.css';

export const metadata: Metadata = {
  title: 'Changelog | Entrolytics',
  description: "See what's new in Entrolytics. Track new features, improvements, and fixes.",
};

const releases = [
  {
    version: '2.4.0',
    date: 'November 2024',
    tag: 'Latest',
    changes: [
      {
        type: 'feature',
        title: 'Custom Dashboards',
        description:
          'Create personalized dashboards with drag-and-drop widgets. Save and share your custom views.',
      },
      {
        type: 'feature',
        title: 'Revenue Tracking',
        description:
          'Track purchases and revenue with e-commerce integrations. Attribute revenue to campaigns and sources.',
      },
      {
        type: 'improvement',
        title: 'Faster Dashboard Loading',
        description: 'Optimized queries and caching for 40% faster dashboard load times.',
      },
      {
        type: 'fix',
        title: 'Timezone Handling',
        description: 'Fixed edge cases in timezone conversion for international users.',
      },
    ],
  },
  {
    version: '2.3.0',
    date: 'October 2024',
    tag: null,
    changes: [
      {
        type: 'feature',
        title: 'Funnel Analysis',
        description:
          'Track user journeys through multi-step funnels. Identify where users drop off and optimize conversion.',
      },
      {
        type: 'feature',
        title: 'API v2',
        description:
          'New REST API with improved performance, better documentation, and GraphQL support.',
      },
      {
        type: 'improvement',
        title: 'Real-time Updates',
        description: 'Dashboard now updates in real-time without manual refresh.',
      },
      {
        type: 'improvement',
        title: 'Mobile Dashboard',
        description: 'Completely redesigned mobile experience for on-the-go analytics.',
      },
    ],
  },
  {
    version: '2.2.0',
    date: 'September 2024',
    tag: null,
    changes: [
      {
        type: 'feature',
        title: 'Team Collaboration',
        description: 'Invite team members, set permissions, and collaborate on analytics.',
      },
      {
        type: 'feature',
        title: 'Conversion Pixels',
        description:
          'Track conversions across marketing channels with lightweight conversion pixels.',
      },
      {
        type: 'improvement',
        title: 'Data Export',
        description: 'Export data in CSV, JSON, and Excel formats with scheduled exports.',
      },
      {
        type: 'fix',
        title: 'Safari Tracking',
        description: 'Improved compatibility with Safari ITP for more accurate tracking.',
      },
    ],
  },
  {
    version: '2.1.0',
    date: 'August 2024',
    tag: null,
    changes: [
      {
        type: 'feature',
        title: 'Link Tracking',
        description: 'Create and track short links for campaigns. UTM parameter support included.',
      },
      {
        type: 'feature',
        title: 'Email Reports',
        description: 'Scheduled email reports with customizable frequency and recipients.',
      },
      {
        type: 'improvement',
        title: 'Bot Detection',
        description: 'Enhanced bot filtering to ensure more accurate traffic data.',
      },
    ],
  },
  {
    version: '2.0.0',
    date: 'July 2024',
    tag: 'Major Release',
    changes: [
      {
        type: 'feature',
        title: 'New Dashboard',
        description: 'Completely redesigned dashboard with improved visualizations and navigation.',
      },
      {
        type: 'feature',
        title: 'Custom Events',
        description: 'Track custom events and user interactions with flexible event tracking.',
      },
      {
        type: 'feature',
        title: 'Goals & Conversions',
        description: 'Set up goals and track conversions with attribution modeling.',
      },
      {
        type: 'improvement',
        title: 'Performance',
        description: 'Sub-50ms global latency with edge computing architecture.',
      },
      {
        type: 'improvement',
        title: 'Privacy',
        description: 'Enhanced privacy features with improved IP hashing and data minimization.',
      },
    ],
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return styles.typeFeature;
    case 'improvement':
      return styles.typeImprovement;
    case 'fix':
      return styles.typeFix;
    default:
      return '';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'feature':
      return 'New';
    case 'improvement':
      return 'Improved';
    case 'fix':
      return 'Fixed';
    default:
      return type;
  }
};

export default function ChangelogPage() {
  return (
    <MarketingLayout>
      <div className={contentStyles.page}>
        <div className={contentStyles.container}>
          <header className={styles.header}>
            <span className={contentStyles.badge}>Updates</span>
            <h1 className={styles.title}>Changelog</h1>
            <p className={styles.subtitle}>
              Stay up to date with the latest features, improvements, and fixes.
            </p>
            <div className={styles.subscribeBox}>
              <p>Get notified when we release new features</p>
              <a
                href="https://github.com/entro314-labs/entrolytics/releases"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.subscribeButton}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Watch on GitHub
              </a>
            </div>
          </header>

          <div className={styles.timeline}>
            {releases.map((release, index) => (
              <article key={release.version} className={styles.release}>
                <div className={styles.releaseHeader}>
                  <div className={styles.versionInfo}>
                    <h2 className={styles.version}>v{release.version}</h2>
                    {release.tag && (
                      <span
                        className={`${styles.tag} ${release.tag === 'Latest' ? styles.tagLatest : styles.tagMajor}`}
                      >
                        {release.tag}
                      </span>
                    )}
                  </div>
                  <time className={styles.date}>{release.date}</time>
                </div>

                <ul className={styles.changesList}>
                  {release.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className={styles.changeItem}>
                      <span className={`${styles.changeType} ${getTypeColor(change.type)}`}>
                        {getTypeLabel(change.type)}
                      </span>
                      <div className={styles.changeContent}>
                        <h3 className={styles.changeTitle}>{change.title}</h3>
                        <p className={styles.changeDescription}>{change.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {index < releases.length - 1 && <div className={styles.divider} />}
              </article>
            ))}
          </div>

          <div className={styles.moreUpdates}>
            <p>Looking for older updates?</p>
            <a
              href="https://github.com/entro314-labs/entrolytics/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              View full release history on GitHub →
            </a>
          </div>

          <section className={styles.ctaSection}>
            <h2>Ready to try the latest features?</h2>
            <p>Start your free trial and experience Entrolytics today.</p>
            <div className={styles.ctaButtons}>
              <Link href="/sign-up" className="marketing-btn-primary">
                Start Free Trial
              </Link>
              <a
                href="https://docs.entrolytics.click"
                target="_blank"
                rel="noopener noreferrer"
                className="marketing-btn-secondary"
              >
                Read Documentation
              </a>
            </div>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
