import { Metadata } from 'next'
import { MarketingLayout } from '@/components/marketing'
import styles from '@/components/marketing/ContentPage.module.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Entrolytics',
  description:
    'Read our Terms of Service to understand the rules and guidelines for using Entrolytics analytics platform.',
}

export default function TermsOfServicePage() {
  return (
    <MarketingLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.title}>Terms of Service</h1>
            <p className={styles.subtitle}>
              These terms govern your use of Entrolytics. By using our services, you agree to these
              terms.
            </p>
            <div className={styles.meta}>
              <span className={styles.metaItem}>Last updated: November 2024</span>
              <span className={styles.metaItem}>Effective: November 2024</span>
            </div>
          </header>

          <div className={styles.content}>
            <h2 id="acceptance">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Entrolytics (the "Service"), you agree to be bound by these
              Terms of Service ("Terms"). If you do not agree to these Terms, do not use the
              Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service.
              You must be at least 18 years old, or the age of majority in your jurisdiction, to use
              the Service.
            </p>

            <h2 id="description">2. Description of Service</h2>
            <p>
              Entrolytics provides web analytics and tracking services that help website owners
              understand their traffic and user behavior while respecting visitor privacy. Our
              services include:
            </p>
            <ul>
              <li>Web analytics tracking and reporting</li>
              <li>Link tracking and URL management</li>
              <li>Conversion pixel tracking</li>
              <li>Custom event tracking</li>
              <li>Dashboard and reporting tools</li>
              <li>API access for data export</li>
            </ul>

            <h2 id="accounts">3. User Accounts</h2>
            <h3>3.1 Account Registration</h3>
            <p>To use certain features, you must create an account. You agree to:</p>
            <ul>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password and account</li>
              <li>Promptly update any changes to your information</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding your account credentials. Notify us immediately
              of any unauthorized access. We are not liable for losses from unauthorized use of your
              account.
            </p>

            <h2 id="acceptable-use">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe intellectual property or privacy rights</li>
              <li>Transmit malware, spam, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the Service's operation or other users' access</li>
              <li>Track websites you don't own or have permission to track</li>
              <li>
                Collect personal data in violation of privacy laws (GDPR, CCPA, etc.)
              </li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
            </ul>

            <h2 id="website-owner">5. Website Owner Responsibilities</h2>
            <p>When installing our tracking script on your website, you agree to:</p>
            <ul>
              <li>
                Maintain appropriate privacy disclosures informing visitors about analytics
                collection
              </li>
              <li>Comply with applicable privacy laws in your jurisdiction</li>
              <li>
                Obtain necessary consents from visitors where required by law
              </li>
              <li>Use collected data in accordance with your privacy policy</li>
              <li>Not attempt to re-identify anonymized visitor data</li>
            </ul>

            <h2 id="payment">6. Payment Terms</h2>
            <h3>6.1 Pricing and Billing</h3>
            <ul>
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>Prices are subject to change with 30 days' notice</li>
              <li>Usage-based charges are calculated and billed monthly</li>
              <li>All fees are non-refundable except as required by law</li>
            </ul>

            <h3>6.2 Free Tier</h3>
            <p>
              We offer a free tier with limited features. Free tier usage is subject to fair use
              limits and may be modified or terminated at our discretion.
            </p>

            <h3>6.3 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Cancellation takes effect at the end of
              your current billing period. No refunds are provided for partial periods.
            </p>

            <h2 id="intellectual-property">7. Intellectual Property</h2>
            <h3>7.1 Our Property</h3>
            <p>
              The Service, including its original content, features, and functionality, is owned by
              Entrolytics and protected by copyright, trademark, and other intellectual property
              laws.
            </p>

            <h3>7.2 Your Content</h3>
            <p>
              You retain ownership of your data and content. By using the Service, you grant us a
              limited license to process your data solely to provide the Service.
            </p>

            <h3>7.3 Feedback</h3>
            <p>
              Any feedback, suggestions, or ideas you provide may be used by us without obligation
              to you.
            </p>

            <h2 id="data-handling">8. Data Handling</h2>
            <p>
              Our handling of personal data is governed by our{' '}
              <Link href="/privacy">Privacy Policy</Link>. For business customers requiring a formal
              agreement, we offer a{' '}
              <Link href="/dpa">Data Processing Agreement (DPA)</Link>.
            </p>

            <h2 id="availability">9. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted service. We
              may:
            </p>
            <ul>
              <li>Perform scheduled maintenance with advance notice when possible</li>
              <li>Modify or discontinue features with reasonable notice</li>
              <li>Suspend service for violations of these Terms</li>
            </ul>

            <h2 id="disclaimers">10. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that the Service will be error-free, secure, or available at all
              times. Analytics data may have inherent limitations and should not be relied upon as
              the sole basis for business decisions.
            </p>

            <h2 id="limitation">11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ENTROLYTICS SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF
              PROFITS, DATA, USE, OR GOODWILL.
            </p>
            <p>
              Our total liability for any claims arising from these Terms or the Service shall not
              exceed the amount you paid us in the 12 months preceding the claim.
            </p>

            <h2 id="indemnification">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Entrolytics and its officers, directors,
              employees, and agents from any claims, damages, or expenses arising from:
            </p>
            <ul>
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you submit through the Service</li>
            </ul>

            <h2 id="termination">13. Termination</h2>
            <p>
              We may terminate or suspend your account immediately for any breach of these Terms.
              Upon termination:
            </p>
            <ul>
              <li>Your right to use the Service ceases immediately</li>
              <li>You may request export of your data within 30 days</li>
              <li>We may delete your data after 30 days</li>
              <li>Provisions that should survive termination will remain in effect</li>
            </ul>

            <h2 id="governing-law">14. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the European Union and the member state
              where our principal place of business is located, without regard to conflict of law
              principles.
            </p>

            <h2 id="disputes">15. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms will first be attempted to be resolved through
              good faith negotiation. If unsuccessful, disputes will be submitted to binding
              arbitration in accordance with applicable rules, except where prohibited by law.
            </p>

            <h2 id="changes">16. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of
              material changes via email or prominent notice on our website. Continued use after
              changes constitutes acceptance.
            </p>

            <h2 id="general">17. General Provisions</h2>
            <ul>
              <li>
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement
                between you and Entrolytics
              </li>
              <li>
                <strong>Severability:</strong> If any provision is found unenforceable, the
                remaining provisions remain in effect
              </li>
              <li>
                <strong>Waiver:</strong> Failure to enforce any right does not waive that right
              </li>
              <li>
                <strong>Assignment:</strong> You may not assign these Terms without our consent
              </li>
            </ul>

            <h2 id="contact">18. Contact Information</h2>
            <p>For questions about these Terms:</p>
            <ul>
              <li>
                Email: <a href="mailto:legal@entrolytics.click">legal@entrolytics.click</a>
              </li>
              <li>
                Web: <Link href="/contact">Contact Form</Link>
              </li>
            </ul>

            <hr />

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Ready to Get Started?</h3>
              <p className={styles.ctaText}>
                Join thousands of websites using privacy-first analytics.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/sign-up" className="marketing-btn-primary">
                  Start Free Trial
                </Link>
                <Link href="/pricing" className="marketing-btn-secondary">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
