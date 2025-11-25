'use client';

import { useAuth } from '@clerk/nextjs';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';

export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      style={{ opacity }}
    >
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Entrolytics</span>
        </Link>

        <div className={styles.links}>
          <a href="#features" className={styles.link}>
            Features
          </a>
          <a href="#integrations" className={styles.link}>
            Integrations
          </a>
          <a href="#testimonials" className={styles.link}>
            Testimonials
          </a>
        </div>

        <div className={styles.actions}>
          {!isLoaded ? (
            // Loading state
            <div className={styles.skeleton} />
          ) : isSignedIn ? (
            // Authenticated user - show dashboard link
            <Link href="/websites" className={styles.primaryButton}>
              Go to Dashboard
            </Link>
          ) : (
            // Non-authenticated user - show auth links
            <>
              <Link href="/sign-in" className={styles.secondaryButton}>
                Sign In
              </Link>
              <Link href="/sign-up" className={styles.primaryButton}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
