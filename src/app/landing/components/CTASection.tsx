'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { AuthAwareCTA } from './AuthAwareCTA';
import styles from './CTASection.module.css';

interface CTASectionProps {
  showFooter?: boolean;
}

export function CTASection({ showFooter = true }: CTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
      });
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    function animate() {
      if (!ctx || !canvas) return;

      // Trail effect
      ctx.fillStyle = 'rgba(250, 250, 250, 0.05)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach(particle => {
        // Mouse interaction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx -= (dx / distance) * force * 0.5;
          particle.vy -= (dy / distance) * force * 0.5;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Boundary bounce
        if (particle.x < 0 || particle.x > canvas.offsetWidth) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.offsetWidth, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.offsetHeight) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.offsetHeight, particle.y));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 122, 243, 0.6)';
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(20, 122, 243, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>
            Ready to respect your users'
            <span className={styles.gradient}> privacy</span>?
          </h2>

          <p className={styles.subtitle}>
            Join thousands of websites using Entrolytics for privacy-first analytics. Get started in
            minutes, no credit card required.
          </p>

          <div className={styles.cta}>
            <AuthAwareCTA variant="primary" className={styles.primaryButton} />
            <AuthAwareCTA variant="secondary" className={styles.secondaryButton} />
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>14-day free trial</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>No credit card required</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.checkmark}>✓</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>

      {showFooter && <MarketingFooter />}
    </section>
  );
}
