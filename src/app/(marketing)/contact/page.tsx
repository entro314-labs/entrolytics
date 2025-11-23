import { Metadata } from 'next'
import { MarketingLayout } from '@/components/marketing'
import styles from './contact.module.css'
import contentStyles from '@/components/marketing/ContentPage.module.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Us | Entrolytics',
  description:
    'Get in touch with the Entrolytics team. We\'re here to help with questions about our analytics platform, enterprise solutions, or partnership opportunities.',
}

export default function ContactPage() {
  return (
    <MarketingLayout>
      <div className={contentStyles.page}>
        <div className={contentStyles.containerWide}>
          <header className={styles.header}>
            <span className={contentStyles.badge}>Contact</span>
            <h1 className={styles.title}>
              Let's <span className={styles.gradient}>talk</span>
            </h1>
            <p className={styles.subtitle}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as
              soon as possible.
            </p>
          </header>

          <div className={styles.contactGrid}>
            <div className={styles.contactForm}>
              <form className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.label}>
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={styles.input}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.label}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={styles.input}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.input}
                    placeholder="john@company.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="company" className={styles.label}>
                    Company <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className={styles.input}
                    placeholder="Acme Inc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.label}>
                    Subject
                  </label>
                  <select id="subject" name="subject" className={styles.select} required>
                    <option value="">Select a topic...</option>
                    <option value="sales">Sales & Enterprise</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Questions</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="feedback">Product Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    rows={5}
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Send Message
                </button>
              </form>
            </div>

            <div className={styles.contactInfo}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3>Email Us</h3>
                <p>For general inquiries:</p>
                <a href="mailto:hello@entrolytics.click">hello@entrolytics.click</a>
                <p className={styles.responseTime}>We respond within 24 hours</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Live Chat</h3>
                <p>Available for customers:</p>
                <span className={styles.availability}>Mon-Fri, 9am-6pm CET</span>
                <p className={styles.responseTime}>Average response: 2 minutes</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <h3>Help Center</h3>
                <p>Find answers in our docs:</p>
                <a
                  href="https://docs.entrolytics.click"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  docs.entrolytics.click
                </a>
                <p className={styles.responseTime}>Guides, tutorials, and API reference</p>
              </div>

              <div className={styles.infoCardHighlight}>
                <div className={styles.infoIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3>Enterprise</h3>
                <p>Custom solutions for larger teams:</p>
                <a href="mailto:sales@entrolytics.click">sales@entrolytics.click</a>
                <ul className={styles.enterpriseList}>
                  <li>Custom integrations</li>
                  <li>Dedicated support</li>
                  <li>SLA guarantees</li>
                  <li>Volume pricing</li>
                </ul>
              </div>
            </div>
          </div>

          <section className={styles.faqSection}>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h4>How quickly will I get a response?</h4>
                <p>
                  We aim to respond to all inquiries within 24 hours during business days. Enterprise
                  customers have priority support with faster response times.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>Do you offer demos?</h4>
                <p>
                  Yes! Select "Sales & Enterprise" as your subject, and we'll schedule a personalized
                  demo of Entrolytics tailored to your needs.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>I found a bug. How do I report it?</h4>
                <p>
                  We appreciate bug reports! You can submit them through this form or directly on our{' '}
                  <a
                    href="https://github.com/entro314-labs/entrolytics/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub repository
                  </a>
                  .
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>Can I request a feature?</h4>
                <p>
                  Absolutely! We love hearing from our users. Select "Product Feedback" and tell us
                  what you'd like to see in Entrolytics.
                </p>
              </div>
            </div>
            <div className={styles.faqCta}>
              <Link href="/faq">View all FAQs →</Link>
            </div>
          </section>
        </div>
      </div>
    </MarketingLayout>
  )
}
