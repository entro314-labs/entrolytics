import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingLayout } from '@/components/marketing';
import contentStyles from '@/components/marketing/ContentPage.module.css';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Us | Entrolytics',
  description:
    'Learn about Entrolytics - the privacy-first analytics platform built for the modern web. Our mission is to provide powerful insights while respecting user privacy.',
};

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className={contentStyles.page}>
        <div className={contentStyles.containerWide}>
          <header className={styles.heroSection}>
            <span className={contentStyles.badge}>About Us</span>
            <h1 className={styles.heroTitle}>
              Analytics that respect
              <span className={styles.gradient}> everyone</span>
            </h1>
            <p className={styles.heroSubtitle}>
              We believe you shouldn't have to choose between understanding your users and
              respecting their privacy. Entrolytics delivers both.
            </p>
          </header>

          <section className={styles.missionSection}>
            <div className={styles.missionContent}>
              <h2>Our Mission</h2>
              <p>
                The web analytics industry has long forced a false choice: either use invasive
                tracking tools that erode user trust, or fly blind without data. We founded
                Entrolytics to prove there's a better way.
              </p>
              <p>
                Our mission is to empower website owners with the insights they need to grow, while
                treating every visitor's privacy as sacrosanct. We believe privacy isn't just a
                feature—it's a fundamental right.
              </p>
            </div>
            <div className={styles.missionStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Cookies used</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{'<50ms'}</span>
                <span className={styles.statLabel}>Global response time</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>GDPR compliant</span>
              </div>
            </div>
          </section>

          <section className={styles.valuesSection}>
            <h2>Our Values</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3>Privacy First</h3>
                <p>
                  Privacy isn't an afterthought—it's built into every line of code. We collect only
                  what's necessary and never sell data.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3>Performance</h3>
                <p>
                  Speed matters. Our edge-first architecture ensures analytics never slow down your
                  site—sub-50ms response times globally.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Transparency</h3>
                <p>
                  Open about how we work. Clear pricing, honest communication, and straightforward
                  data practices you can trust.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3>Customer Focus</h3>
                <p>
                  Built by developers, for developers. We listen to feedback and ship features that
                  solve real problems.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.storySection}>
            <div className={styles.storyContent}>
              <h2>Our Story</h2>
              <p>
                Entrolytics started from a simple frustration: existing analytics tools either
                harvested too much data or provided too little insight. We wanted a tool that would
                respect our users while giving us the metrics we needed to grow.
              </p>
              <p>
                We built Entrolytics for ourselves first—a privacy-respecting analytics platform
                that doesn't compromise on features. When we realized others faced the same
                challenge, we decided to share it with the world.
              </p>
              <p>
                Today, Entrolytics helps thousands of websites understand their traffic without
                compromising visitor privacy. We're just getting started.
              </p>
            </div>
          </section>

          <section className={styles.techSection}>
            <h2>Built Different</h2>
            <div className={styles.techGrid}>
              <div className={styles.techItem}>
                <h4>Edge Computing</h4>
                <p>
                  Data processed at the edge, closest to your users, for minimal latency and maximum
                  performance.
                </p>
              </div>
              <div className={styles.techItem}>
                <h4>Cookie-Free Tracking</h4>
                <p>
                  No cookies, no consent banners needed for analytics. Better UX for your visitors.
                </p>
              </div>
              <div className={styles.techItem}>
                <h4>First-Party Data</h4>
                <p>
                  All data stays on your domain. No third-party tracking, no data sharing, full
                  control.
                </p>
              </div>
              <div className={styles.techItem}>
                <h4>EU Data Centers</h4>
                <p>
                  Process and store data in EU data centers for GDPR compliance and data
                  sovereignty.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.ctaSection}>
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of websites using privacy-first analytics. No credit card required.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/sign-up" className="marketing-btn-primary">
                Start Free Trial
              </Link>
              <Link href="/contact" className="marketing-btn-secondary">
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
