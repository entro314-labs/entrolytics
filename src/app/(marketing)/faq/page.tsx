import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingLayout } from '@/components/marketing';
import contentStyles from '@/components/marketing/ContentPage.module.css';
import styles from './faq.module.css';

export const metadata: Metadata = {
  title: 'FAQ | Entrolytics',
  description:
    'Find answers to frequently asked questions about Entrolytics privacy-first analytics platform.',
};

const faqCategories = [
  {
    name: 'General',
    faqs: [
      {
        q: 'What is Entrolytics?',
        a: 'Entrolytics is a privacy-first web analytics platform that helps you understand your website traffic without compromising visitor privacy. We provide essential insights like pageviews, traffic sources, and user behavior without using cookies or collecting personal data.',
      },
      {
        q: 'How is Entrolytics different from Google Analytics?',
        a: "Entrolytics is built from the ground up with privacy in mind. Unlike Google Analytics, we don't use cookies, don't track users across sites, don't collect personal data, and don't share data with third parties. Your data stays yours, and your visitors stay anonymous.",
      },
      {
        q: 'Do I need to show a cookie consent banner?',
        a: "In most cases, no! Since Entrolytics doesn't use cookies and doesn't collect personal data, you typically don't need cookie consent for our analytics. However, laws vary by region, so we recommend consulting with your legal team for your specific situation.",
      },
      {
        q: 'Is Entrolytics open source?',
        a: 'Yes! Entrolytics is open source and available on GitHub. You can inspect the code, contribute improvements, or even self-host if you prefer.',
      },
    ],
  },
  {
    name: 'Privacy & Compliance',
    faqs: [
      {
        q: 'Is Entrolytics GDPR compliant?',
        a: "Yes, Entrolytics is fully GDPR compliant. We minimize data collection, don't store personal data, process data in EU data centers (optional), and provide all the documentation you need for compliance.",
      },
      {
        q: 'What data does Entrolytics collect?',
        a: "We collect only essential analytics data: page URL, referrer, browser type, operating system, screen size (generalized), and country/region. We hash IP addresses immediately and never store them in raw form. We don't collect names, emails, or any personal identifiers.",
      },
      {
        q: 'Can visitors opt out of tracking?',
        a: 'Yes! We respect the Do Not Track browser setting. Visitors can also block our script using ad blockers. Additionally, you can provide an opt-out mechanism on your site if desired.',
      },
      {
        q: 'Where is my data stored?',
        a: 'By default, data is stored in our EU data centers (Germany and Finland). Enterprise customers can choose specific data residency options for compliance requirements.',
      },
      {
        q: 'Do you sell data to third parties?',
        a: 'Absolutely not. We never sell, share, or monetize your data. Your analytics data belongs to you, and we use it only to provide our service.',
      },
    ],
  },
  {
    name: 'Features & Functionality',
    faqs: [
      {
        q: 'What analytics metrics does Entrolytics provide?',
        a: 'Entrolytics provides: pageviews, unique visitors, sessions, bounce rate, session duration, traffic sources, referrers, geographic data, device/browser breakdown, top pages, entry/exit pages, custom events, goals, and funnels (on paid plans).',
      },
      {
        q: 'Can I track custom events?',
        a: 'Yes! You can track custom events like button clicks, form submissions, purchases, and any other user interactions. Custom events are available on all paid plans.',
      },
      {
        q: 'Does Entrolytics support e-commerce tracking?',
        a: 'Yes! Our Business and Enterprise plans include revenue tracking, which lets you track purchases and attribute revenue to traffic sources, campaigns, and user journeys.',
      },
      {
        q: 'Can I share dashboards with clients?',
        a: 'Yes! You can create shareable dashboard links with customizable access permissions. Perfect for agencies sharing reports with clients.',
      },
      {
        q: 'Is there an API?',
        a: 'Yes, we provide a comprehensive REST API for accessing your analytics data programmatically. API access is available on Pro plans and above.',
      },
    ],
  },
  {
    name: 'Setup & Integration',
    faqs: [
      {
        q: 'How do I install Entrolytics?',
        a: 'Simply add a single line of JavaScript to your website. We provide integration guides for all major platforms including WordPress, Next.js, React, Vue, and more. Setup takes less than 5 minutes.',
      },
      {
        q: 'Will Entrolytics slow down my website?',
        a: 'No! Our tracking script is tiny (<1KB) and loads asynchronously, so it never blocks your page. We also use edge servers worldwide to ensure sub-50ms response times.',
      },
      {
        q: 'Does Entrolytics work with Single Page Applications (SPAs)?',
        a: 'Yes! We automatically detect page changes in SPAs built with React, Vue, Angular, and other frameworks. No additional configuration needed.',
      },
      {
        q: 'Can I use Entrolytics with WordPress?',
        a: "Yes! We offer a WordPress plugin for easy installation. Just install the plugin, enter your site ID, and you're ready to go.",
      },
    ],
  },
  {
    name: 'Billing & Plans',
    faqs: [
      {
        q: 'Is there a free plan?',
        a: "Yes! Our Starter plan is free forever and includes up to 10,000 pageviews per month. It's perfect for personal projects and small websites.",
      },
      {
        q: 'What happens if I exceed my pageview limit?',
        a: "We won't cut you off or charge you unexpectedly. If you consistently exceed your limit, we'll reach out to help you find the right plan. Occasional traffic spikes are no problem.",
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period.',
      },
      {
        q: 'Do you offer refunds?',
        a: "We offer a 14-day money-back guarantee. If you're not satisfied within your first 14 days, contact us for a full refund.",
      },
      {
        q: 'Is there a discount for annual billing?',
        a: 'Yes! Annual plans get 2 months free (17% discount). You can switch to annual billing at any time from your account settings.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <MarketingLayout>
      <div className={contentStyles.page}>
        <div className={contentStyles.container}>
          <header className={styles.header}>
            <span className={contentStyles.badge}>Support</span>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            <p className={styles.subtitle}>
              Find answers to common questions about Entrolytics. Can't find what you're looking
              for? <Link href="/contact">Contact us</Link>.
            </p>
          </header>

          <nav className={styles.categoryNav}>
            {faqCategories.map(category => (
              <a
                key={category.name}
                href={`#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={styles.categoryLink}
              >
                {category.name}
              </a>
            ))}
          </nav>

          <div className={styles.faqContent}>
            {faqCategories.map(category => (
              <section
                key={category.name}
                id={category.name.toLowerCase().replace(/\s+/g, '-')}
                className={styles.faqSection}
              >
                <h2 className={styles.sectionTitle}>{category.name}</h2>
                <div className={styles.faqList}>
                  {category.faqs.map(faq => (
                    <details key={faq.q} className={styles.faqItem}>
                      <summary className={styles.question}>
                        {faq.q}
                        <svg
                          className={styles.chevron}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <p className={styles.answer}>{faq.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className={styles.ctaSection}>
            <h2>Still have questions?</h2>
            <p>
              Our team is here to help. Reach out and we'll get back to you as soon as possible.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/contact" className="marketing-btn-primary">
                Contact Support
              </Link>
              <a
                href="https://docs.entrolytics.click"
                target="_blank"
                rel="noopener noreferrer"
                className="marketing-btn-secondary"
              >
                View Documentation
              </a>
            </div>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
