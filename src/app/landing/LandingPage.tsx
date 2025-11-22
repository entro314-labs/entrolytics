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
