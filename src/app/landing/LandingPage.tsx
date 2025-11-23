'use client'

import { useEffect, useRef } from 'react'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { FeaturesSection } from './components/FeaturesSection'
import { DataVisualizationSection } from './components/DataVisualizationSection'
import { TestimonialsSection } from './components/TestimonialsSection'
import { IntegrationsSection } from './components/IntegrationsSection'
import { CTASection } from './components/CTASection'
import { CustomCursor } from './components/CustomCursor'
import { SmoothScroll } from './components/SmoothScroll'
// Marketing fonts
import '@fontsource/geologica/300.css'
import '@fontsource/geologica/400.css'
import '@fontsource/geologica/500.css'
import '@fontsource/geologica/600.css'
import '@fontsource/geologica/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/ibm-plex-mono/700.css'
import '@/styles/marketing.css'
import styles from './LandingPage.module.css'

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

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
  )
}
