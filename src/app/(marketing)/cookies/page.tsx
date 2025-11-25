import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingLayout } from '@/components/marketing';
import styles from '@/components/marketing/ContentPage.module.css';

export const metadata: Metadata = {
  title: 'Cookie Policy | Entrolytics',
  description:
    'Learn about how Entrolytics uses cookies and similar technologies. We believe in cookie-free analytics.',
};

export default function CookiePolicyPage() {
  return (
    <MarketingLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.title}>Cookie Policy</h1>
            <p className={styles.subtitle}>
              We believe in cookie-free analytics. Here's how we approach cookies and tracking
              technologies.
            </p>
            <div className={styles.meta}>
              <span className={styles.metaItem}>Last updated: November 2024</span>
            </div>
          </header>

          <div className={styles.content}>
            <div className={styles.infoBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <div>
                <strong>Cookie-Free Analytics:</strong> Our tracking script does not use cookies. We
                respect your visitors' privacy by default.
              </div>
            </div>

            <h2 id="overview">1. Overview</h2>
            <p>
              This Cookie Policy explains how Entrolytics ("we," "us," or "our") uses cookies and
              similar technologies on our website and dashboard. It's important to distinguish
              between:
            </p>
            <ul>
              <li>
                <strong>Our Analytics Service:</strong> Cookie-free by design - does not place
                cookies on your visitors' devices
              </li>
              <li>
                <strong>Our Website & Dashboard:</strong> Uses essential cookies for authentication
                and security
              </li>
            </ul>

            <h2 id="what-are-cookies">2. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help
              websites remember your preferences, login status, and other information. Cookies can
              be:
            </p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> Temporary cookies deleted when you close your
                browser
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Remain on your device for a set period
              </li>
              <li>
                <strong>First-Party Cookies:</strong> Set by the website you're visiting
              </li>
              <li>
                <strong>Third-Party Cookies:</strong> Set by other domains (we don't use these)
              </li>
            </ul>

            <h2 id="analytics-service">3. Our Analytics Service (Cookie-Free)</h2>
            <p>
              <strong>The Entrolytics tracking script does not use cookies.</strong> This is a core
              principle of our privacy-first approach.
            </p>
            <p>Instead of cookies, we use:</p>
            <ul>
              <li>
                <strong>Privacy-preserving fingerprinting:</strong> A daily-rotating hash that
                cannot be used to track users across days or sites
              </li>
              <li>
                <strong>First-party data only:</strong> All data stays on your domain
              </li>
              <li>
                <strong>No cross-site tracking:</strong> We cannot follow users between different
                websites
              </li>
            </ul>
            <p>
              This means websites using Entrolytics analytics generally don't need cookie consent
              banners for our service (though you should consult your legal advisor for your
              specific situation).
            </p>

            <h2 id="website-cookies">4. Cookies on Our Website</h2>
            <p>
              When you visit entrolytics.click or use our dashboard, we use the following types of
              cookies:
            </p>

            <h3>4.1 Essential Cookies (Required)</h3>
            <p>These cookies are necessary for the website to function and cannot be disabled.</p>
            <table>
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>__clerk_*</code>
                  </td>
                  <td>Authentication and session management (Clerk)</td>
                  <td>Session / 1 year</td>
                </tr>
                <tr>
                  <td>
                    <code>__session</code>
                  </td>
                  <td>User session identifier</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>
                    <code>csrf_token</code>
                  </td>
                  <td>Security - prevents cross-site request forgery</td>
                  <td>Session</td>
                </tr>
              </tbody>
            </table>

            <h3>4.2 Functional Cookies (Optional)</h3>
            <p>These cookies enhance your experience by remembering your preferences.</p>
            <table>
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>theme</code>
                  </td>
                  <td>Remembers your light/dark mode preference</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>
                    <code>locale</code>
                  </td>
                  <td>Remembers your language preference</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>
                    <code>dashboard_prefs</code>
                  </td>
                  <td>Dashboard layout and filter preferences</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>

            <h2 id="third-party">5. Third-Party Services</h2>
            <p>We use minimal third-party services that may set their own cookies:</p>
            <ul>
              <li>
                <strong>Clerk:</strong> Authentication provider - manages secure login sessions
              </li>
              <li>
                <strong>Stripe:</strong> Payment processing - only when you make a payment
              </li>
            </ul>
            <p>
              We do not use advertising networks, social media trackers, or other third-party
              analytics on our website.
            </p>

            <h2 id="local-storage">6. Local Storage and Similar Technologies</h2>
            <p>In addition to cookies, we may use:</p>
            <ul>
              <li>
                <strong>Local Storage:</strong> For storing dashboard preferences and cached data
              </li>
              <li>
                <strong>Session Storage:</strong> For temporary data during your session
              </li>
            </ul>
            <p>
              These technologies serve similar purposes to cookies and are subject to the same
              principles outlined in this policy.
            </p>

            <h2 id="managing-cookies">7. Managing Cookies</h2>
            <p>You can control cookies through:</p>

            <h3>7.1 Browser Settings</h3>
            <p>Most browsers allow you to:</p>
            <ul>
              <li>View and delete cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all third-party cookies</li>
              <li>Clear all cookies when closing the browser</li>
            </ul>
            <p>Note: Blocking essential cookies may prevent you from using our dashboard.</p>

            <h3>7.2 Browser-Specific Instructions</h3>
            <ul>
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Edge
                </a>
              </li>
            </ul>

            <h2 id="do-not-track">8. Do Not Track</h2>
            <p>
              We honor Do Not Track (DNT) browser signals. When enabled, our analytics script
              respects this preference and does not collect data from visitors with DNT enabled.
            </p>

            <h2 id="updates">9. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in our practices or for legal
              reasons. Changes will be posted on this page with an updated date.
            </p>

            <h2 id="contact">10. Contact Us</h2>
            <p>If you have questions about our use of cookies:</p>
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
              <h3 className={styles.ctaTitle}>Privacy-First Analytics</h3>
              <p className={styles.ctaText}>
                Get powerful insights without compromising your visitors' privacy.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/sign-up" className="marketing-btn-primary">
                  Start Free Trial
                </Link>
                <Link href="/privacy" className="marketing-btn-secondary">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
