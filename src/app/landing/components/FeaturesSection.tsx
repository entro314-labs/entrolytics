'use client';

import { motion, useInView } from 'framer-motion';
import { BarChart3, Globe, Lock, Shield, Users, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import styles from './FeaturesSection.module.css';

const features = [
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'GDPR compliant by design. No cookies, no tracking, no personal data collection.',
    size: 'large',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: "< 1KB script size. Zero impact on your site's performance.",
    size: 'small',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Distributed worldwide for instant analytics from anywhere.',
    size: 'small',
  },
  {
    icon: Lock,
    title: 'Data Ownership',
    description: 'Your data stays yours. Host it yourself or let us handle it securely.',
    size: 'medium',
  },
  {
    icon: BarChart3,
    title: 'Real-time Insights',
    description: 'Live visitor tracking, instant metrics, and actionable analytics.',
    size: 'medium',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite your team, share reports, and collaborate on insights.',
    size: 'small',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });

  return (
    <section id="features" ref={sectionRef} className={styles.features}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>
            Everything you need for
            <span className={styles.gradient}> powerful analytics</span>
          </h2>
          <p className={styles.subtitle}>
            Built for privacy, designed for insights, optimized for speed.
          </p>
        </motion.div>

        <div className={styles.bentoGrid}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`${styles.featureCard} ${styles[feature.size]}`}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <div className={styles.iconWrapper}>
                <feature.icon className={styles.icon} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
