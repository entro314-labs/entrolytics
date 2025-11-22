import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createUser, updateUser, getUserByClerkId } from '@/queries/drizzle'
import { ROLES } from '@/lib/constants'
import { uuid } from '@/lib/crypto'
import { bootstrapAdminSetup } from '@/lib/admin'

/**
 * Clerk Webhook Handler
 *
 * Handles user lifecycle events from Clerk to keep our database in sync:
 * - user.created: Create new user record
 * - user.updated: Update existing user data
 * - user.deleted: Mark user as deleted
 *
 * This ensures our internal user system stays synchronized with Clerk
 * while maintaining our permission and role system.
 */

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
}

export async function POST(request: Request) {
  try {
    // Get the headers
    const headerPayload = await headers()
    const svixId = headerPayload.get('svix-id')
    const svixTimestamp = headerPayload.get('svix-timestamp')
    const svixSignature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400,
      })
    }

    // Get the body
    const payload = await request.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret)

    let evt

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      console.error('Error verifying webhook:', err)

      // In development, we can be more lenient with verification
      if (process.env.NODE_ENV === 'development') {
        console.warn('Bypassing webhook verification in development mode')
        try {
          evt = JSON.parse(body)
        } catch (parseErr) {
          console.error('Failed to parse webhook payload:', parseErr)
          return new Response('Invalid webhook payload', { status: 400 })
        }
      } else {
        // In production, we must verify the webhook
        console.error('Webhook verification failed in production')
        return new Response('Webhook verification failed', {
          status: 400,
        })
      }
    }

    // Handle the webhook
    const { data, type } = evt
    console.log(`Webhook received: ${type}`)

    // Validate webhook structure
    if (!type) {
      console.error('Webhook missing type field')
      return new Response('Invalid webhook: missing type', { status: 400 })
    }

    if (!data) {
      console.error('Webhook missing data field')
      return new Response('Invalid webhook: missing data', { status: 400 })
    }

    switch (type) {
      case 'user.created':
        await handleUserCreated(data)
        break
      case 'user.updated':
        await handleUserUpdated(data)
        break
      case 'user.deleted':
        await handleUserDeleted(data)
        break
      default:
        console.log(`Unhandled webhook type: ${type}`)
        // Return success for unhandled types to avoid webhook retries
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)

    // Check if this is a validation error that should return 400
    const errorMessage = error instanceof Error ? error.message : ''
    const isValidationError =
      errorMessage.includes('required') ||
      errorMessage.includes('No valid email') ||
      errorMessage.includes('missing type') ||
      errorMessage.includes('missing data')

    if (isValidationError) {
      return new Response(`Validation Error: ${errorMessage}`, { status: 400 })
    }

    return new Response('Internal Server Error', { status: 500 })
  }
}

/**
 * Handle user creation from Clerk
 */
async function handleUserCreated(data: any) {
  try {
    console.log('Processing user creation for Clerk ID:', data.id)

    // Validate required data
    if (!data.id) {
      throw new Error('Clerk ID is required for user creation')
    }

    // Check if user already exists
    const existingUser = await getUserByClerkId(data.id)
    if (existingUser) {
      console.log('User already exists, skipping creation:', data.id)
      return
    }

    // Safely extract email with proper validation
    const emailAddresses = data.email_addresses || []
    const primaryEmail = emailAddresses.length > 0 ? emailAddresses[0]?.email_address : null

    if (!primaryEmail) {
      throw new Error(`No valid email address found for user ${data.id}`)
    }

    const userData = {
      user_id: uuid(), // Generate UUID for database primary key
      clerk_id: data.id, // Store Clerk ID in clerk_id field
      email: primaryEmail,
      first_name: data.first_name,
      last_name: data.last_name,
      image_url: data.image_url,
      role: ROLES.user, // Default role for new users
      display_name:
        `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
        primaryEmail.split('@')[0] ||
        'User',
    }

    console.log('Creating user with data:', userData)
    const user = await createUser(userData)
    console.log(`User created in database: ${user.userId}`)

    // Check for admin bootstrap after user creation
    await bootstrapAdminSetup(userData.email, user.userId)
  } catch (error) {
    console.error('Error creating user:', error)

    const emailAddresses = data.email_addresses || []
    const primaryEmail =
      emailAddresses.length > 0 ? emailAddresses[0]?.email_address : 'No email provided'

    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userData: {
        clerk_id: data.id || 'No ID provided',
        email: primaryEmail,
        hasEmailAddresses: !!data.email_addresses,
        emailArrayLength: emailAddresses.length,
      },
    })
    throw error
  }
}

/**
 * Handle user updates from Clerk
 */
async function handleUserUpdated(data: any) {
  try {
    // Validate required data
    if (!data.id) {
      throw new Error('Clerk ID is required for user update')
    }

    const existingUser = await getUserByClerkId(data.id)

    if (!existingUser) {
      console.warn(`User with Clerk ID ${data.id} not found for update`)
      console.log('This could indicate a webhook ordering issue or missing user creation event')

      // Instead of silently creating the user, we should be more explicit
      console.log('Attempting to create user from update webhook data')
      try {
        await handleUserCreated(data)
        console.log(`Successfully created user ${data.id} from update webhook`)
      } catch (createError) {
        console.error('Failed to create user from update webhook:', createError)
        throw new Error(
          `Cannot update non-existent user ${data.id} and creation failed: ${createError instanceof Error ? createError.message : String(createError)}`
        )
      }
      return
    }

    // Safely extract email with validation
    const emailAddresses = data.email_addresses || []
    const primaryEmail = emailAddresses.length > 0 ? emailAddresses[0]?.email_address : null

    const updateData = {
      email: primaryEmail || existingUser.email,
      first_name: data.first_name,
      last_name: data.last_name,
      image_url: data.image_url,
      display_name:
        `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
        (primaryEmail ? primaryEmail.split('@')[0] : null) ||
        existingUser.displayName,
    }

    await updateUser(existingUser.userId, updateData)
    console.log(`User updated in database: ${data.id}`)
  } catch (error) {
    console.error('Error updating user:', error)
    console.error('Update error details:', {
      message: error instanceof Error ? error.message : String(error),
      clerkId: data.id || 'No ID provided',
      hasEmailAddresses: !!data.email_addresses,
    })
    throw error
  }
}

/**
 * Handle user deletion from Clerk
 */
async function handleUserDeleted(data: any) {
  try {
    const existingUser = await getUserByClerkId(data.id)

    if (!existingUser) {
      console.warn(`User with Clerk ID ${data.id} not found for deletion`)
      return
    }

    // Soft delete the user (set deleted_at timestamp)
    await updateUser(existingUser.userId, {
      deletedAt: new Date(),
    })

    console.log(`User soft deleted in database: ${data.id}`)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Only POST is allowed
export async function GET() {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function PUT() {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function DELETE() {
  return new Response('Method Not Allowed', { status: 405 })
}
