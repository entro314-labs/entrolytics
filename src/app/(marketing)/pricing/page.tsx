import { Metadata } from 'next'
import { MarketingLayout } from '@/components/marketing'
import styles from './pricing.module.css'
import contentStyles from '@/components/marketing/ContentPage.module.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing | Entrolytics',
  description:
    'Simple, transparent pricing for privacy-first analytics. Start free, scale as you grow. No hidden fees.',
}

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for personal projects and small sites',
    price: 'Free',
    priceDetail: 'forever',
    highlighted: false,
    features: [
      'Up to 10,000 pageviews/month',
      '1 website',
      '6 months data retention',
      'Core analytics dashboard',
      'Cookie-free tracking',
      'GDPR compliant',
    ],
    limitations: ['Community support', 'No custom domains'],
    cta: 'Get Started',
    ctaLink: '/sign-up',
  },
  {
    name: 'Pro',
    description: 'For growing businesses and teams',
    price: '$9',
    priceDetail: '/month',
    highlighted: true,
    features: [
      'Up to 100,000 pageviews/month',
      'Up to 10 websites',
      '2 years data retention',
      'Advanced analytics & funnels',
      'Custom events & goals',
      'API access',
      'Link tracking',
      'Conversion pixels',
      'Priority email support',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    ctaLink: '/sign-up?plan=pro',
  },
  {
    name: 'Business',
    description: 'For scaling teams with advanced needs',
    price: '$49',
    priceDetail: '/month',
    highlighted: false,
    features: [
      'Up to 1M pageviews/month',
      'Unlimited websites',
      '5 years data retention',
      'Everything in Pro',
      'Team collaboration',
      'Custom dashboards & reports',
      'Revenue tracking',
      'A/B test analytics',
      'EU data residency option',
      'Priority support',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    ctaLink: '/sign-up?plan=business',
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 'Custom',
    priceDetail: '',
    highlighted: false,
    features: [
      'Unlimited pageviews',
      'Unlimited websites',
      'Unlimited data retention',
      'Everything in Business',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee (99.9%)',
      'On-premise deployment option',
      'Advanced security features',
      'Custom DPA',
    ],
    limitations: [],
    cta: 'Contact Sales',
    ctaLink: '/contact?subject=sales',
  },
]

const faqs = [
  {
    q: 'What counts as a pageview?',
    a: 'A pageview is counted each time a page on your website loads and sends data to Entrolytics. Bots and crawlers are automatically filtered out.',
  },
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Yes! You can change your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, credit will be applied to future bills.',
  },
  {
    q: 'What happens if I exceed my pageview limit?',
    a: 'We don\'t cut you off. If you consistently exceed your limit, we\'ll reach out to help you find the right plan. Occasional spikes are no problem.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! All paid plans include a 14-day free trial. No credit card required to start.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex) and can arrange invoicing for Enterprise customers.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes! Pay annually and get 2 months free (17% discount). Annual plans are available at checkout.',
  },
]

export default function PricingPage() {
  return (
    <MarketingLayout>
      <div className={contentStyles.page}>
        <div className={contentStyles.containerWide}>
          <header className={styles.header}>
            <span className={contentStyles.badge}>Pricing</span>
            <h1 className={styles.title}>
              Simple, transparent <span className={styles.gradient}>pricing</span>
            </h1>
            <p className={styles.subtitle}>
              No surprises, no hidden fees. Start free and scale as you grow.
            </p>
          </header>

          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`${styles.planCard} ${plan.highlighted ? styles.planHighlighted : ''}`}
              >
                {plan.highlighted && <span className={styles.popularBadge}>Most Popular</span>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
                <div className={styles.planPrice}>
                  <span className={styles.price}>{plan.price}</span>
                  {plan.priceDetail && (
                    <span className={styles.priceDetail}>{plan.priceDetail}</span>
                  )}
                </div>
                <Link
                  href={plan.ctaLink}
                  className={plan.highlighted ? styles.ctaPrimary : styles.ctaSecondary}
                >
                  {plan.cta}
                </Link>
                <ul className={styles.featureList}>
                  {plan.features.map((feature) => (
                    <li key={feature} className={styles.featureItem}>
                      <svg
                        className={styles.checkIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className={styles.limitationItem}>
                      <svg
                        className={styles.minusIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <section className={styles.comparisonSection}>
            <h2>All plans include</h2>
            <div className={styles.includesGrid}>
              <div className={styles.includeItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Privacy-first tracking</span>
              </div>
              <div className={styles.includeItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>Real-time analytics</span>
              </div>
              <div className={styles.includeItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
                <span>No cookie banners needed</span>
              </div>
              <div className={styles.includeItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Sub-50ms global latency</span>
              </div>
              <div className={styles.includeItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span>GDPR & CCPA compliant</span>
              </div>
              <div className={styles.includeItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Email reports</span>
              </div>
            </div>
          </section>

          <section className={styles.faqSection}>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqGrid}>
              {faqs.map((faq) => (
                <div key={faq.q} className={styles.faqItem}>
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
            <div className={styles.faqCta}>
              <Link href="/faq">View all FAQs →</Link>
            </div>
          </section>

          <section className={styles.ctaSection}>
            <h2>Ready to get started?</h2>
            <p>Start your 14-day free trial. No credit card required.</p>
            <div className={styles.ctaButtons}>
              <Link href="/sign-up" className="marketing-btn-primary">
                Start Free Trial
              </Link>
              <Link href="/contact" className="marketing-btn-secondary">
                Talk to Sales
              </Link>
            </div>
          </section>
        </div>
      </div>
    </MarketingLayout>
  )
}
