import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { LandingPage } from './landing/LandingPage'

export default async function RootPage() {
  const { userId } = await auth()

  // If user is authenticated, redirect based on onboarding status
  if (userId) {
    const user = await currentUser()
    const onboardingCompleted = user?.publicMetadata?.onboardingCompleted === true
    const onboardingSkipped = user?.publicMetadata?.onboardingSkipped === true

    // Redirect to onboarding if not completed/skipped
    if (!onboardingCompleted && !onboardingSkipped) {
      redirect('/onboarding')
    } else {
      redirect('/websites')
    }
  }

  // Show landing page for non-authenticated users
  return <LandingPage />
}
