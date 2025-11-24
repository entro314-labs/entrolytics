'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export type OnboardingStep = 'welcome' | 'create-website' | 'install-tracking' | 'verify' | 'complete'

interface OnboardingContextType {
  currentStep: OnboardingStep
  isOnboarding: boolean
  websiteId: string | null
  setWebsiteId: (id: string) => void
  nextStep: () => void
  goToStep: (step: OnboardingStep) => void
  skipOnboarding: () => Promise<void>
  completeOnboarding: () => Promise<void>
  isLoading: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'create-website',
  'install-tracking',
  'verify',
  'complete',
]

interface OnboardingProviderProps {
  children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [websiteId, setWebsiteId] = useState<string | null>(null)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user needs onboarding
    if (isLoaded && user) {
      const onboardingCompleted = user.publicMetadata?.onboardingCompleted === true
      const onboardingSkipped = user.publicMetadata?.onboardingSkipped === true

      if (!onboardingCompleted && !onboardingSkipped) {
        setIsOnboarding(true)

        // Restore step from metadata if exists
        const savedStep = user.publicMetadata?.onboardingStep as OnboardingStep
        if (savedStep && STEP_ORDER.includes(savedStep)) {
          setCurrentStep(savedStep)
        }
      } else {
        setIsOnboarding(false)
      }

      setIsLoading(false)
    }
  }, [user, isLoaded])

  const nextStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep)
    if (currentIndex < STEP_ORDER.length - 1) {
      const next = STEP_ORDER[currentIndex + 1]
      setCurrentStep(next)
      router.push(`/onboarding/${next}`)
    }
  }

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step)
    router.push(`/onboarding/${step}`)
  }

  const skipOnboarding = async () => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'skip' }),
      })

      setIsOnboarding(false)

      // Refresh user metadata
      await user?.reload()

      router.push('/websites')
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
    }
  }

  const completeOnboarding = async () => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      setIsOnboarding(false)

      // Refresh user metadata
      await user?.reload()

      router.push('/websites')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        isOnboarding,
        websiteId,
        setWebsiteId,
        nextStep,
        goToStep,
        skipOnboarding,
        completeOnboarding,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
