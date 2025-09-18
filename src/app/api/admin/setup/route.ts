import { NextResponse } from 'next/server'
import { getAdminSetupStatus, validateAdminSetupConfig } from '@/lib/admin'
import { unauthorized, json } from '@/lib/response'
import { parseRequest } from '@/lib/request'
import { canViewUsers } from '@/validations'

/**
 * Admin Setup Status API
 *
 * Provides information about the current admin setup configuration
 * and status for system administrators.
 */

export async function GET(request: Request) {
  try {
    const { auth, error } = await parseRequest(request)

    if (error) {
      return error()
    }

    // Only allow admin users to view setup status
    // Note: If no admin users exist, this will allow the check to pass
    // so that setup status can be viewed during initial setup
    if (auth?.user && !(await canViewUsers(auth))) {
      return unauthorized('Admin access required')
    }

    const [setupStatus, configValidation] = await Promise.all([
      getAdminSetupStatus(),
      Promise.resolve(validateAdminSetupConfig()),
    ])

    return json({
      ...setupStatus,
      validation: configValidation,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting admin setup status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Only GET is allowed
export async function POST() {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function PUT() {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function DELETE() {
  return new Response('Method Not Allowed', { status: 405 })
}