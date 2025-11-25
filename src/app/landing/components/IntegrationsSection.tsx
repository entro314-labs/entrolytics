'use client';

import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import styles from './IntegrationsSection.module.css';

const integrations = [
  { name: 'Next.js', color: '#000000' },
  { name: 'React', color: '#61DAFB' },
  { name: 'Vue.js', color: '#42B883' },
  { name: 'WordPress', color: '#21759B' },
  { name: 'Shopify', color: '#96BF48' },
  { name: 'Webflow', color: '#4353FF' },
  { name: 'Ghost', color: '#15171A' },
  { name: 'Gatsby', color: '#663399' },
  { name: 'Nuxt', color: '#00DC82' },
  { name: 'Svelte', color: '#FF3E00' },
  { name: 'Angular', color: '#DD0031' },
  { name: 'Astro', color: '#FF5D01' },
];

export function IntegrationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) {
      // First marquee - left to right
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          x: '-50%',
          duration: 30,
          ease: 'none',
          repeat: -1,
        });
      }

      // Second marquee - right to left
      if (marqueeRef2.current) {
        gsap.fromTo(
          marqueeRef2.current,
          { x: '-50%' },
          {
            x: '0%',
            duration: 30,
            ease: 'none',
            repeat: -1,
          },
        );
      }
    }
  }, [isInView]);

  return (
    <section id="integrations" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>
            Integrates with <span className={styles.gradient}>everything</span>
          </h2>
          <p className={styles.subtitle}>
            Add analytics to any platform with a single line of code. No complex setup required.
          </p>
        </motion.div>

        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeWrapper}>
            <div ref={marqueeRef} className={styles.marquee}>
              {[...integrations, ...integrations].map((integration, index) => (
                <div
                  key={`${integration.name}-${index}`}
                  className={styles.integrationBadge}
                  style={{ borderColor: integration.color }}
                >
                  <div className={styles.badgeDot} style={{ backgroundColor: integration.color }} />
                  {integration.name}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.marqueeWrapper}>
            <div ref={marqueeRef2} className={styles.marquee}>
              {[...integrations, ...integrations].reverse().map((integration, index) => (
                <div
                  key={`${integration.name}-reverse-${index}`}
                  className={styles.integrationBadge}
                  style={{ borderColor: integration.color }}
                >
                  <div className={styles.badgeDot} style={{ backgroundColor: integration.color }} />
                  {integration.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          className={styles.codeBlock}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className={styles.codeHeader}>
            <div className={styles.codeDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.codeTitle}>index.html</span>
          </div>
          <div className={styles.codeContent}>
            <code className={styles.code}>
              <span className={styles.lineNumber}>1</span>
              <span className={styles.tag}>{'<script'}</span>
              <span className={styles.attr}> defer</span>
              <br />
              <span className={styles.lineNumber}>2</span>
              <span className={styles.attr}> src</span>
              <span className={styles.punctuation}>=</span>
              <span className={styles.string}>"https://analytics.entrolytics.click/script.js"</span>
              <br />
              <span className={styles.lineNumber}>3</span>
              <span className={styles.attr}> data-website-id</span>
              <span className={styles.punctuation}>=</span>
              <span className={styles.string}>"YOUR_WEBSITE_ID"</span>
              <br />
              <span className={styles.lineNumber}>4</span>
              <span className={styles.tag}>{'>'}</span>
              <span className={styles.tag}>{'</script>'}</span>
              <span className={styles.cursor}>|</span>
            </code>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
