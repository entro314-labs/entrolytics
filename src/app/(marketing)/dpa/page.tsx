import { Metadata } from 'next'
import { MarketingLayout } from '@/components/marketing'
import styles from '@/components/marketing/ContentPage.module.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Processing Agreement | Entrolytics',
  description:
    'Entrolytics Data Processing Agreement (DPA) for GDPR compliance and enterprise data protection requirements.',
}

export default function DPAPage() {
  return (
    <MarketingLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.badge}>Compliance</span>
            <h1 className={styles.title}>Data Processing Agreement</h1>
            <p className={styles.subtitle}>
              This Data Processing Agreement ("DPA") supplements our Terms of Service for customers
              who require formal data protection agreements.
            </p>
            <div className={styles.meta}>
              <span className={styles.metaItem}>Version 1.0</span>
              <span className={styles.metaItem}>Effective: November 2024</span>
            </div>
          </header>

          <div className={styles.content}>
            <div className={styles.infoBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <div>
                <strong>Enterprise DPA:</strong> For custom DPA requirements or signed agreements,
                please <Link href="/contact">contact our sales team</Link>.
              </div>
            </div>

            <h2 id="parties">1. Parties and Scope</h2>
            <p>This DPA is entered into between:</p>
            <ul>
              <li>
                <strong>"Customer"</strong> (Data Controller): The entity that has agreed to the
                Entrolytics Terms of Service
              </li>
              <li>
                <strong>"Entrolytics"</strong> (Data Processor): The provider of the analytics
                services
              </li>
            </ul>
            <p>
              This DPA applies to the processing of personal data as part of the Services defined in
              our Terms of Service.
            </p>

            <h2 id="definitions">2. Definitions</h2>
            <ul>
              <li>
                <strong>"Personal Data":</strong> Any information relating to an identified or
                identifiable natural person
              </li>
              <li>
                <strong>"Processing":</strong> Any operation performed on personal data
              </li>
              <li>
                <strong>"Data Subject":</strong> An identified or identifiable natural person
              </li>
              <li>
                <strong>"Sub-processor":</strong> Any third party engaged by Entrolytics to process
                Personal Data
              </li>
              <li>
                <strong>"Data Protection Laws":</strong> GDPR and other applicable data protection
                regulations
              </li>
            </ul>

            <h2 id="processing-details">3. Details of Processing</h2>

            <h3>3.1 Subject Matter</h3>
            <p>
              The processing of Personal Data in connection with providing web analytics, link
              tracking, and conversion tracking services.
            </p>

            <h3>3.2 Duration</h3>
            <p>
              For the duration of the agreement between Customer and Entrolytics, plus any retention
              period required by law.
            </p>

            <h3>3.3 Nature and Purpose</h3>
            <p>
              Collection, storage, analysis, and reporting of website visitor data to provide
              analytics insights to the Customer.
            </p>

            <h3>3.4 Types of Personal Data</h3>
            <ul>
              <li>Hashed IP addresses (not reversible)</li>
              <li>User agent information (browser, OS)</li>
              <li>Generalized geographic location (country/region)</li>
              <li>Page view and event data</li>
              <li>Referrer information</li>
            </ul>

            <h3>3.5 Categories of Data Subjects</h3>
            <p>Visitors to Customer's websites where Entrolytics tracking is installed.</p>

            <h2 id="obligations">4. Processor Obligations</h2>
            <p>Entrolytics shall:</p>

            <h3>4.1 Processing Instructions</h3>
            <ul>
              <li>Process Personal Data only on documented instructions from the Customer</li>
              <li>
                Inform the Customer if any instruction infringes Data Protection Laws
              </li>
              <li>Not process Personal Data for any purpose other than providing the Services</li>
            </ul>

            <h3>4.2 Confidentiality</h3>
            <ul>
              <li>Ensure all personnel processing Personal Data are bound by confidentiality</li>
              <li>Limit access to Personal Data to authorized personnel only</li>
            </ul>

            <h3>4.3 Security</h3>
            <ul>
              <li>
                Implement appropriate technical and organizational measures to ensure security
              </li>
              <li>Regularly assess and improve security measures</li>
              <li>Maintain documentation of security measures</li>
            </ul>

            <h3>4.4 Sub-processors</h3>
            <ul>
              <li>Not engage sub-processors without prior written authorization</li>
              <li>Maintain a list of authorized sub-processors</li>
              <li>Ensure sub-processors are bound by equivalent data protection obligations</li>
              <li>Notify Customer of any intended changes to sub-processors</li>
            </ul>

            <h3>4.5 Data Subject Rights</h3>
            <ul>
              <li>
                Assist Customer in responding to data subject requests
              </li>
              <li>Provide reasonable assistance with data subject rights fulfillment</li>
            </ul>

            <h3>4.6 Data Breach</h3>
            <ul>
              <li>Notify Customer without undue delay upon becoming aware of a Personal Data breach</li>
              <li>
                Provide sufficient information to enable Customer to meet breach notification
                obligations
              </li>
              <li>Document breaches and remediation measures</li>
            </ul>

            <h2 id="controller-obligations">5. Controller Obligations</h2>
            <p>Customer shall:</p>
            <ul>
              <li>Provide lawful instructions for Processing</li>
              <li>Ensure lawful basis for Processing under applicable Data Protection Laws</li>
              <li>Maintain appropriate privacy notices for data subjects</li>
              <li>Respond to data subject requests within required timeframes</li>
            </ul>

            <h2 id="security-measures">6. Security Measures</h2>
            <p>Entrolytics implements the following security measures:</p>

            <h3>6.1 Technical Measures</h3>
            <ul>
              <li>Encryption of data in transit (TLS 1.3)</li>
              <li>Encryption of data at rest (AES-256)</li>
              <li>Secure network architecture with firewalls</li>
              <li>Regular security patching and updates</li>
              <li>Intrusion detection and monitoring</li>
              <li>Regular vulnerability assessments</li>
            </ul>

            <h3>6.2 Organizational Measures</h3>
            <ul>
              <li>Role-based access controls</li>
              <li>Security awareness training for personnel</li>
              <li>Background checks for employees with data access</li>
              <li>Incident response procedures</li>
              <li>Business continuity and disaster recovery plans</li>
            </ul>

            <h2 id="international-transfers">7. International Data Transfers</h2>
            <p>When transferring Personal Data outside the EEA:</p>
            <ul>
              <li>
                Transfers will be made in accordance with EU Standard Contractual Clauses
              </li>
              <li>Additional supplementary measures will be implemented as necessary</li>
              <li>Customer will be notified of any transfer arrangements</li>
            </ul>

            <h2 id="audit-rights">8. Audit Rights</h2>
            <ul>
              <li>
                Customer may request documentation of Entrolytics' compliance with this DPA
              </li>
              <li>
                Entrolytics will make available information necessary to demonstrate compliance
              </li>
              <li>
                On-site audits may be conducted with reasonable notice and during business hours
              </li>
              <li>Audit costs are borne by the Customer unless findings reveal non-compliance</li>
            </ul>

            <h2 id="deletion">9. Data Deletion</h2>
            <p>Upon termination of the agreement:</p>
            <ul>
              <li>Customer may request deletion or return of Personal Data within 30 days</li>
              <li>Entrolytics will delete Personal Data within 90 days of request</li>
              <li>Deletion will be certified upon request</li>
              <li>Retention may continue only as required by law</li>
            </ul>

            <h2 id="liability">10. Liability</h2>
            <p>
              Each party's liability under this DPA is subject to the limitations set forth in the
              Terms of Service. Both parties shall indemnify the other for damages arising from
              violations of this DPA or Data Protection Laws.
            </p>

            <h2 id="amendments">11. Amendments</h2>
            <p>
              This DPA may be amended to reflect changes in Data Protection Laws or our processing
              activities. Material changes will be notified to Customers in advance.
            </p>

            <h2 id="sub-processor-list">Appendix: Authorized Sub-Processors</h2>
            <table>
              <thead>
                <tr>
                  <th>Sub-processor</th>
                  <th>Processing Activity</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hetzner Online GmbH</td>
                  <td>Cloud infrastructure hosting</td>
                  <td>Germany, Finland (EU)</td>
                </tr>
                <tr>
                  <td>Clerk Inc.</td>
                  <td>Authentication services</td>
                  <td>United States (SCCs)</td>
                </tr>
                <tr>
                  <td>Stripe Inc.</td>
                  <td>Payment processing</td>
                  <td>United States (SCCs)</td>
                </tr>
                <tr>
                  <td>Cloudflare Inc.</td>
                  <td>CDN and DDoS protection</td>
                  <td>Global (SCCs)</td>
                </tr>
              </tbody>
            </table>

            <hr />

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Need a Custom DPA?</h3>
              <p className={styles.ctaText}>
                Enterprise customers can request custom DPA terms or signed agreements.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/contact" className="marketing-btn-primary">
                  Contact Sales
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
  )
}
