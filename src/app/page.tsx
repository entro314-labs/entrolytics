import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { LandingPage } from './landing/LandingPage'

export default async function RootPage() {
  const { userId } = await auth()

  // If user is authenticated, redirect to main app
  if (userId) {
    redirect('/websites')
  }

  // Show landing page for non-authenticated users
  return <LandingPage />
}
