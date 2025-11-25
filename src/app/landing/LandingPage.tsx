'use client';

import { useEffect, useRef } from 'react';
import { CTASection } from './components/CTASection';
import { CustomCursor } from './components/CustomCursor';
import { DataVisualizationSection } from './components/DataVisualizationSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HeroSection } from './components/HeroSection';
import { IntegrationsSection } from './components/IntegrationsSection';
import { Navbar } from './components/Navbar';
import { SmoothScroll } from './components/SmoothScroll';
import { TestimonialsSection } from './components/TestimonialsSection';
// Marketing fonts
import '@fontsource/geologica/300.css';
import '@fontsource/geologica/400.css';
import '@fontsource/geologica/500.css';
import '@fontsource/geologica/600.css';
import '@fontsource/geologica/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-mono/700.css';
import '@/styles/marketing.css';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <CustomCursor />
      <Navbar />
      <SmoothScroll>
        <div ref={containerRef} className={styles.landingPage}>
          <HeroSection />
          <FeaturesSection />
          <DataVisualizationSection />
          <IntegrationsSection />
          <TestimonialsSection />
          <CTASection />
        </div>
      </SmoothScroll>
    </>
  );
}
