import { SignUp } from '@clerk/nextjs'
import { Column, Heading, Icon } from '@entro314labs/entro-zen'
import { Logo } from '@/components/icons'

/**
 * Clerk Sign Up Page
 *
 * This page handles user registration using Clerk's pre-built SignUp component.
 * New users will be automatically synced to our database via the auth system.
 */
export default function SignUpPage() {
  return (
    <Column justifyContent="center" alignItems="center" padding="8" gap="6" minHeight="100vh">
      <Icon size="lg">
        <Logo />
      </Icon>
      <Heading>entrolytics</Heading>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
            card: 'shadow-none border border-gray-200',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </Column>
  )
}
