import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createUser, updateUser, deleteUser, getUserByClerkId } from '@/queries';
import { ROLES } from '@/lib/constants';

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

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
}

export async function POST(request: Request) {
  try {
    // Get the headers
    const headerPayload = await headers();
    const svixId = headerPayload.get('svix-id');
    const svixTimestamp = headerPayload.get('svix-timestamp');
    const svixSignature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret);

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', {
        status: 400,
      });
    }

    // Handle the webhook
    const { data, type } = evt;
    console.log(`Webhook received: ${type}`);

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Handle user creation from Clerk
 */
async function handleUserCreated(data: any) {
  try {
    const userData = {
      id: crypto.randomUUID(),
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || '',
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      role: ROLES.user, // Default role for new users
      displayName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 
                   data.email_addresses[0]?.email_address?.split('@')[0] || 
                   'User',
    };

    const user = await createUser(userData);
    console.log(`User created in database: ${user.id}`);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Handle user updates from Clerk
 */
async function handleUserUpdated(data: any) {
  try {
    const existingUser = await getUserByClerkId(data.id);
    
    if (!existingUser) {
      console.warn(`User with Clerk ID ${data.id} not found for update`);
      // Create the user if they don't exist
      await handleUserCreated(data);
      return;
    }

    const updateData = {
      email: data.email_addresses[0]?.email_address || existingUser.email,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      displayName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 
                   data.email_addresses[0]?.email_address?.split('@')[0] || 
                   existingUser.displayName,
    };

    await updateUser(existingUser.id, updateData);
    console.log(`User updated in database: ${existingUser.id}`);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Handle user deletion from Clerk
 */
async function handleUserDeleted(data: any) {
  try {
    const existingUser = await getUserByClerkId(data.id);
    
    if (!existingUser) {
      console.warn(`User with Clerk ID ${data.id} not found for deletion`);
      return;
    }

    // Soft delete the user (set deletedAt timestamp)
    await updateUser(existingUser.id, {
      deletedAt: new Date(),
    });
    
    console.log(`User soft deleted in database: ${existingUser.id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Only POST is allowed
export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function PUT() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function DELETE() {
  return new Response('Method Not Allowed', { status: 405 });
}