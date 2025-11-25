'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import styles from './TestimonialsSection.module.css';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO at TechStart',
    avatar: 'SC',
    content:
      'Entrolytics completely transformed how we understand our users. Having analytics, links, and pixels in one platform means we finally see the full customer journey.',
    rating: 5,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Product Manager at Growth Co',
    avatar: 'MR',
    content:
      "The real-time insights are incredible. We can see exactly what's working and pivot immediately. Best analytics platform we've used.",
    rating: 5,
  },
  {
    name: 'Emma Thompson',
    role: 'Developer at CodeCraft',
    avatar: 'ET',
    content:
      'Integration took literally 2 minutes. The script is tiny, the dashboard is beautiful, and the data is incredibly accurate. Perfect for modern web apps.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Marketing Director at BrandLab',
    avatar: 'DK',
    content:
      'Finally, analytics that respects user privacy while giving us the insights we need. Our bounce rate dropped 40% after optimizing with Entrolytics data.',
    rating: 5,
  },
  {
    name: 'Lisa Anderson',
    role: 'Founder at StartupXYZ',
    avatar: 'LA',
    content:
      'The self-hosted option is a game-changer. Full control over our data, amazing performance, and the team collaboration features are top-notch.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });

  return (
    <section id="testimonials" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>
            Loved by <span className={styles.gradient}>thousands</span> of teams
          </h2>
          <p className={styles.subtitle}>
            Join companies of all sizes using Entrolytics for first-party growth analytics
          </p>
        </motion.div>

        <div className={styles.scrollContainer}>
          <motion.div
            className={styles.testimonialsGrid}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className={styles.testimonialCard}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
              >
                <div className={styles.stars}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className={styles.star}>
                      ★
                    </span>
                  ))}
                </div>

                <p className={styles.content}>"{testimonial.content}"</p>

                <div className={styles.author}>
                  <div className={styles.avatar}>{testimonial.avatar}</div>
                  <div>
                    <div className={styles.name}>{testimonial.name}</div>
                    <div className={styles.role}>{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className={styles.statItem}>
            <div className={styles.statValue}>4.9/5</div>
            <div className={styles.statLabel}>Average Rating</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>10K+</div>
            <div className={styles.statLabel}>Active Users</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>99%</div>
            <div className={styles.statLabel}>Would Recommend</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
