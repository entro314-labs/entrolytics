import { SignIn } from '@clerk/nextjs';
import { Column, Heading, Icon } from '@entro314labs/entro-zen';
import { Logo } from '@/components/icons';

/**
 * Clerk Sign In Page
 * 
 * This page handles user authentication using Clerk's pre-built SignIn component.
 * It replaces the legacy username/password login system.
 */
export default function SignInPage() {
  return (
    <Column justifyContent="center" alignItems="center" padding="8" gap="6" minHeight="100vh">
      <Icon size="lg">
        <Logo />
      </Icon>
      <Heading>entrolytics</Heading>
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 
              'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
            card: 'shadow-none border border-gray-200',
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </Column>
  );
}