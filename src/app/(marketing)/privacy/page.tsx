import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingLayout } from '@/components/marketing';
import styles from '@/components/marketing/ContentPage.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | Entrolytics',
  description:
    'Learn how Entrolytics collects, uses, and protects your data. Our privacy-first approach ensures your information is handled with care.',
};

export default function PrivacyPolicyPage() {
  return (
    <MarketingLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.subtitle}>
              Your privacy matters to us. This policy explains how we collect, use, and protect your
              personal information.
            </p>
            <div className={styles.meta}>
              <span className={styles.metaItem}>Last updated: November 2024</span>
              <span className={styles.metaItem}>Effective: November 2024</span>
            </div>
          </header>

          <div className={styles.content}>
            <h2 id="introduction">1. Introduction</h2>
            <p>
              Entrolytics ("we," "our," or "us") is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our analytics platform and related services.
            </p>
            <p>
              We designed Entrolytics with privacy at its core. Unlike traditional analytics
              platforms, we prioritize data minimization and user privacy while still providing
              powerful insights to website owners.
            </p>

            <h2 id="data-collection">2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <p>When you create an account or use our services, you may provide:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> Email address, name, and password when you
                register
              </li>
              <li>
                <strong>Payment Information:</strong> Billing details processed securely through our
                payment providers
              </li>
              <li>
                <strong>Website Information:</strong> Domain names and website details you add to
                track
              </li>
              <li>
                <strong>Communications:</strong> Messages you send to our support team
              </li>
            </ul>

            <h3>2.2 Analytics Data We Collect</h3>
            <p>
              For websites using our tracking script, we collect the following{' '}
              <strong>privacy-respecting</strong> analytics:
            </p>
            <ul>
              <li>
                <strong>Page Views:</strong> Pages visited on your tracked websites
              </li>
              <li>
                <strong>Referrer Information:</strong> Where visitors came from
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, screen size
                (generalized)
              </li>
              <li>
                <strong>Geographic Location:</strong> Country and region (no precise location)
              </li>
              <li>
                <strong>Custom Events:</strong> Events you configure to track
              </li>
            </ul>

            <h3>2.3 What We Don't Collect</h3>
            <p>
              We are committed to privacy-first analytics. We <strong>do not</strong> collect:
            </p>
            <ul>
              <li>Personal identifying information (PII) from your website visitors</li>
              <li>IP addresses (they are hashed and never stored in raw form)</li>
              <li>Cookies for tracking (cookie-free tracking by default)</li>
              <li>Cross-site tracking data</li>
              <li>Advertising identifiers</li>
              <li>Fingerprinting data</li>
            </ul>

            <h2 id="data-use">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our analytics services</li>
              <li>Process your transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent or unauthorized access</li>
            </ul>

            <h2 id="data-sharing">4. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information. We may share information
              only in these circumstances:
            </p>
            <ul>
              <li>
                <strong>Service Providers:</strong> With vendors who assist in providing our
                services (hosting, payment processing) under strict data protection agreements
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                sale of assets
              </li>
              <li>
                <strong>With Your Consent:</strong> When you explicitly authorize sharing
              </li>
            </ul>

            <h2 id="data-retention">5. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active. Analytics
              data is retained according to your plan settings and can be deleted upon request.
            </p>
            <p>
              When you delete your account, we remove your personal information within 30 days,
              except where we need to retain it for legal obligations.
            </p>

            <h2 id="data-security">6. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Automated monitoring for suspicious activities</li>
              <li>Data backups with encryption</li>
            </ul>

            <h2 id="your-rights">7. Your Rights</h2>
            <p>Depending on your location, you may have rights including:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal data
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a portable format
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your data
              </li>
              <li>
                <strong>Restriction:</strong> Request limitation of processing
              </li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@entrolytics.click">privacy@entrolytics.click</a>.
            </p>

            <h2 id="cookies">8. Cookies and Tracking</h2>
            <p>
              Our analytics platform operates without cookies by default. For our website and
              dashboard, we use essential cookies only for:
            </p>
            <ul>
              <li>Authentication and session management</li>
              <li>Security and fraud prevention</li>
              <li>User preferences</li>
            </ul>
            <p>
              See our <Link href="/cookies">Cookie Policy</Link> for complete details.
            </p>

            <h2 id="international">9. International Data Transfers</h2>
            <p>
              We process data in data centers located in the European Union and the United States.
              For EU users, we ensure transfers comply with GDPR requirements through Standard
              Contractual Clauses.
            </p>
            <p>
              See our <Link href="/gdpr">GDPR Compliance</Link> page for more information.
            </p>

            <h2 id="children">10. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 16. We do not knowingly collect
              personal information from children. If you believe we have collected information from
              a child, please contact us immediately.
            </p>

            <h2 id="changes">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant
              changes by posting a notice on our website and updating the "Last updated" date.
            </p>

            <h2 id="contact">12. Contact Us</h2>
            <p>For privacy-related questions or to exercise your rights:</p>
            <ul>
              <li>
                Email: <a href="mailto:privacy@entrolytics.click">privacy@entrolytics.click</a>
              </li>
              <li>
                Web: <Link href="/contact">Contact Form</Link>
              </li>
            </ul>

            <hr />

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Have Questions?</h3>
              <p className={styles.ctaText}>
                Our team is here to help with any privacy-related questions or concerns.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/contact" className="marketing-btn-primary">
                  Contact Us
                </Link>
                <Link href="/gdpr" className="marketing-btn-secondary">
                  GDPR Information
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
