'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { AuthAwareCTA } from './AuthAwareCTA'
import styles from './HeroSection.module.css'

export function HeroSection() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const gradientRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate dashboard on load - synced with stats animation
    if (dashboardRef.current) {
      gsap.from(dashboardRef.current, {
        y: 60,
        opacity: 0,
        rotateX: -15,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.7,
      })
    }

    // Animate gradient mesh
    if (gradientRef.current) {
      gsap.to(gradientRef.current, {
        backgroundPosition: '200% 200%',
        duration: 20,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      })
    }

    // Parallax effect on scroll - reduced for better sync
    const handleScroll = () => {
      const scrollY = window.scrollY
      if (dashboardRef.current) {
        gsap.to(dashboardRef.current, {
          y: scrollY * 0.3,
          duration: 0.3,
        })
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className={styles.hero}>
      <div ref={gradientRef} className={styles.gradientMesh} />
      <div className={styles.gridPattern} />
      <div className={styles.floatingCircles}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>

      <div className={styles.content}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Privacy-First Analytics <span className={styles.gradient}>That Respects</span> Your Users
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Powerful web analytics without compromising user privacy. GDPR compliant, cookie-free, and
          open source.
        </motion.p>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AuthAwareCTA variant="primary" className={styles.primaryButton} />
          <AuthAwareCTA variant="secondary" className={styles.secondaryButton} />
        </motion.div>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className={styles.stat}>
            <div className={styles.statValue}>10M+</div>
            <div className={styles.statLabel}>Monthly Page Views</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>99.9%</div>
            <div className={styles.statLabel}>Uptime</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{'<'}1ms</div>
            <div className={styles.statLabel}>Script Load Time</div>
          </div>
        </motion.div>
      </div>

      <div ref={dashboardRef} className={styles.dashboard}>
        <div className={styles.dashboardInner}>
          <div className={styles.dashboardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.logo}>Entrolytics</div>
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot} />
                Live
              </div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.dateRange}>Last 7 days</div>
            </div>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Page Views</div>
              <div className={styles.metricValue}>124,592</div>
              <div className={styles.metricChange}>+12.5%</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Visitors</div>
              <div className={styles.metricValue}>42,183</div>
              <div className={styles.metricChange}>+8.3%</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Bounce Rate</div>
              <div className={styles.metricValue}>32.4%</div>
              <div className={styles.metricChangeNegative}>-2.1%</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Avg. Duration</div>
              <div className={styles.metricValue}>2m 34s</div>
              <div className={styles.metricChange}>+15.2%</div>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <svg className={styles.chart} viewBox="0 0 800 200">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(107, 70, 193, 0.3)" />
                  <stop offset="100%" stopColor="rgba(107, 70, 193, 0)" />
                </linearGradient>
              </defs>
              <path
                className={styles.chartLine}
                d="M 0 150 L 100 120 L 200 140 L 300 80 L 400 100 L 500 60 L 600 90 L 700 50 L 800 70"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
              />
              <path
                d="M 0 150 L 100 120 L 200 140 L 300 80 L 400 100 L 500 60 L 600 90 L 700 50 L 800 70 L 800 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6B46C1" />
                  <stop offset="100%" stopColor="#9F7AEA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
