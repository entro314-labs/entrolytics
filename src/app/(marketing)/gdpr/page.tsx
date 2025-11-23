import { Metadata } from 'next'
import { MarketingLayout } from '@/components/marketing'
import styles from '@/components/marketing/ContentPage.module.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GDPR Compliance | Entrolytics',
  description:
    'Learn how Entrolytics ensures GDPR compliance and protects EU user data with privacy-first analytics.',
}

export default function GDPRPage() {
  return (
    <MarketingLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.badge}>Compliance</span>
            <h1 className={styles.title}>
              GDPR <span className={styles.titleGradient}>Compliance</span>
            </h1>
            <p className={styles.subtitle}>
              Entrolytics is designed with GDPR compliance at its core. Learn how we protect EU user
              data and support your compliance efforts.
            </p>
          </header>

          <div className={styles.content}>
            <div className={styles.infoBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <strong>Privacy by Design:</strong> Entrolytics was built from the ground up with
                GDPR principles, not retrofitted. We minimize data collection and maximize privacy.
              </div>
            </div>

            <h2 id="overview">Our GDPR Commitment</h2>
            <p>
              The General Data Protection Regulation (GDPR) sets the standard for data protection in
              the European Union. Entrolytics fully supports GDPR requirements and helps our
              customers maintain compliance.
            </p>

            <h2 id="data-minimization">Data Minimization</h2>
            <p>
              We collect only what's necessary for analytics, following GDPR's data minimization
              principle:
            </p>
            <ul>
              <li>
                <strong>No IP Addresses:</strong> IPs are hashed immediately and never stored in raw
                form
              </li>
              <li>
                <strong>No Personal Identifiers:</strong> We don't collect names, emails, or other
                PII from visitors
              </li>
              <li>
                <strong>No Cross-Site Tracking:</strong> Each website's data is isolated
              </li>
              <li>
                <strong>No Cookies:</strong> Our tracking works without cookies
              </li>
              <li>
                <strong>Generalized Data:</strong> Location data is limited to country/region level
              </li>
            </ul>

            <h2 id="legal-basis">Legal Basis for Processing</h2>
            <p>
              Under GDPR, data processing must have a legal basis. For Entrolytics analytics, the
              typical legal basis is:
            </p>

            <h3>Legitimate Interest (Article 6(1)(f))</h3>
            <p>
              Because Entrolytics collects minimal, anonymized data without cookies or personal
              identifiers, most websites can rely on legitimate interest for analytics. Our
              privacy-respecting approach means:
            </p>
            <ul>
              <li>The impact on data subjects is minimal</li>
              <li>Reasonable expectations are not exceeded</li>
              <li>The processing serves legitimate business purposes</li>
            </ul>

            <div className={styles.warningBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <strong>Legal Advice:</strong> This is general information, not legal advice.
                Consult your legal team or DPO for your specific situation.
              </div>
            </div>

            <h2 id="data-subject-rights">Data Subject Rights</h2>
            <p>GDPR grants individuals several rights regarding their personal data:</p>

            <div className={styles.card}>
              <h4>Right of Access (Article 15)</h4>
              <p>
                Users can request their data. For Entrolytics customers, access your data through
                Settings → Data Export. For visitor data, our anonymization means we cannot identify
                specific individuals.
              </p>
            </div>

            <div className={styles.card}>
              <h4>Right to Erasure (Article 17)</h4>
              <p>
                Account holders can delete their accounts and all associated data. Visitor data is
                automatically anonymized and cannot be attributed to specific individuals.
              </p>
            </div>

            <div className={styles.card}>
              <h4>Right to Portability (Article 20)</h4>
              <p>
                Export your analytics data at any time in standard formats (CSV, JSON) through the
                dashboard or API.
              </p>
            </div>

            <div className={styles.card}>
              <h4>Right to Object (Article 21)</h4>
              <p>
                Visitors can opt out of tracking using browser Do Not Track settings or by blocking
                our script. We respect these choices.
              </p>
            </div>

            <h2 id="data-processing">Data Processing Agreement</h2>
            <p>
              For organizations that need a formal Data Processing Agreement (DPA) to demonstrate
              GDPR compliance with their data controllers, we provide a comprehensive DPA that
              covers:
            </p>
            <ul>
              <li>Processing scope and purposes</li>
              <li>Sub-processor management</li>
              <li>Data security measures</li>
              <li>Breach notification procedures</li>
              <li>Audit rights</li>
              <li>Data deletion upon termination</li>
            </ul>
            <p>
              <Link href="/dpa">View and sign our Data Processing Agreement →</Link>
            </p>

            <h2 id="data-transfers">International Data Transfers</h2>
            <p>
              We process data in EU-based data centers by default. When data transfer to non-EU
              countries is necessary, we rely on:
            </p>
            <ul>
              <li>
                <strong>Standard Contractual Clauses (SCCs):</strong> EU-approved model contracts
                for data transfers
              </li>
              <li>
                <strong>Supplementary Measures:</strong> Additional technical and organizational
                safeguards
              </li>
              <li>
                <strong>EU Data Center Option:</strong> Keep all data within the EU (available on
                Business and Enterprise plans)
              </li>
            </ul>

            <h2 id="security">Security Measures</h2>
            <p>
              GDPR Article 32 requires appropriate security measures. Our implementation includes:
            </p>
            <ul>
              <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls with role-based permissions</li>
              <li>Audit logging for all data access</li>
              <li>Incident response procedures</li>
              <li>Regular employee security training</li>
            </ul>

            <h2 id="breach-notification">Breach Notification</h2>
            <p>
              In the unlikely event of a data breach affecting personal data, we will:
            </p>
            <ul>
              <li>Notify affected customers within 72 hours</li>
              <li>Provide details about the nature and scope of the breach</li>
              <li>Describe measures taken to address the breach</li>
              <li>Support your notification obligations to supervisory authorities</li>
            </ul>

            <h2 id="sub-processors">Sub-Processors</h2>
            <p>
              We use a limited number of sub-processors, all bound by data protection agreements:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hetzner</td>
                  <td>Infrastructure hosting</td>
                  <td>EU (Germany, Finland)</td>
                </tr>
                <tr>
                  <td>Clerk</td>
                  <td>Authentication services</td>
                  <td>US (SCCs in place)</td>
                </tr>
                <tr>
                  <td>Stripe</td>
                  <td>Payment processing</td>
                  <td>US (SCCs in place)</td>
                </tr>
              </tbody>
            </table>

            <h2 id="cookie-consent">Cookie Consent</h2>
            <p>
              Because Entrolytics operates without cookies, you typically don't need cookie consent
              specifically for our analytics. However, if you use other tools on your website, you
              may still need consent mechanisms.
            </p>
            <p>
              Our cookie-free approach means one less item in your cookie consent banner, improving
              user experience while maintaining compliance.
            </p>

            <h2 id="documentation">GDPR Documentation</h2>
            <p>We provide documentation to support your compliance efforts:</p>
            <ul>
              <li>
                <Link href="/privacy">Privacy Policy</Link> - Our data handling practices
              </li>
              <li>
                <Link href="/dpa">Data Processing Agreement</Link> - Formal DPA for customers
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link> - Service terms including data handling
              </li>
              <li>
                <Link href="/security">Security Overview</Link> - Technical and organizational
                measures
              </li>
            </ul>

            <hr />

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Questions About Compliance?</h3>
              <p className={styles.ctaText}>
                Our team can help with your GDPR compliance questions and provide additional
                documentation.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/contact" className="marketing-btn-primary">
                  Contact Us
                </Link>
                <Link href="/dpa" className="marketing-btn-secondary">
                  View DPA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
