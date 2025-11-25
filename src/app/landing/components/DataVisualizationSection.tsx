'use client';

import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import styles from './DataVisualizationSection.module.css';

export function DataVisualizationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isInView && chartRef.current) {
      // Animate chart bars
      const bars = chartRef.current.querySelectorAll(`.${styles.bar}`);
      bars.forEach((bar, index) => {
        gsap.from(bar, {
          scaleY: 0,
          transformOrigin: 'bottom',
          duration: 0.8,
          delay: index * 0.1,
          ease: 'power3.out',
        });
      });

      // Animate line chart
      const line = chartRef.current.querySelector(`.${styles.line}`);
      if (line) {
        const length = (line as SVGPathElement).getTotalLength();
        gsap.fromTo(
          line,
          {
            strokeDasharray: length,
            strokeDashoffset: length,
          },
          {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'power2.inOut',
          },
        );
      }
    }
  }, [isInView]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div
            className={styles.textContent}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.title}>
              Visualize your data <span className={styles.gradient}>beautifully</span>
            </h2>
            <p className={styles.description}>
              Transform raw analytics data into actionable insights with our beautiful, interactive
              visualizations. Track trends, spot patterns, and make data-driven decisions.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📊</div>
                <div>
                  <h4 className={styles.featureTitle}>Real-time Charts</h4>
                  <p className={styles.featureText}>Live updating visualizations</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🎯</div>
                <div>
                  <h4 className={styles.featureTitle}>Custom Metrics</h4>
                  <p className={styles.featureText}>Track what matters to you</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📈</div>
                <div>
                  <h4 className={styles.featureTitle}>Trend Analysis</h4>
                  <p className={styles.featureText}>Spot patterns instantly</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.visualization}
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg ref={chartRef} className={styles.chart} viewBox="0 0 600 400">
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e5faa" />
                  <stop offset="100%" stopColor="#147af3" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#147af3" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(20, 122, 243, 0.3)" />
                  <stop offset="100%" stopColor="rgba(20, 122, 243, 0)" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <g className={styles.grid}>
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="50"
                    y1={50 + i * 75}
                    x2="550"
                    y2={50 + i * 75}
                    stroke="rgba(0,0,0,0.05)"
                    strokeWidth="1"
                  />
                ))}
              </g>

              {/* Bar chart */}
              <g className={styles.bars}>
                {[120, 180, 140, 220, 200, 260, 240].map((height, i) => (
                  <rect
                    key={i}
                    className={styles.bar}
                    x={80 + i * 70}
                    y={350 - height}
                    width="40"
                    height={height}
                    fill="url(#barGradient)"
                    rx="4"
                  />
                ))}
              </g>

              {/* Line chart overlay */}
              <path
                className={styles.line}
                d="M 80 280 L 150 220 L 220 250 L 290 160 L 360 180 L 430 100 L 500 120"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {[
                [80, 280],
                [150, 220],
                [220, 250],
                [290, 160],
                [360, 180],
                [430, 100],
                [500, 120],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="6"
                  fill="white"
                  stroke="#6B46C1"
                  strokeWidth="3"
                  className={styles.dot}
                  style={{ animationDelay: `${i * 0.1 + 2}s` }}
                />
              ))}
            </svg>

            {/* Metric cards */}
            <div className={styles.metricCards}>
              <motion.div
                className={styles.metricCard}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <div className={styles.metricLabel}>Total Views</div>
                <div className={styles.metricValue}>2.4M</div>
                <div className={styles.metricTrend}>↗ 24.5%</div>
              </motion.div>

              <motion.div
                className={styles.metricCard}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className={styles.metricLabel}>Conversions</div>
                <div className={styles.metricValue}>18.2K</div>
                <div className={styles.metricTrend}>↗ 12.3%</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
