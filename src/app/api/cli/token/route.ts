import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { CliTokenService } from '@/lib/cli-tokens'
import { z } from 'zod'
import { db } from '@/lib/db'
import { website } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const createTokenSchema = z.object({
  websiteId: z.string().uuid(),
  orgId: z.string().optional(),
  expiresInMinutes: z.number().min(5).max(60).optional(),
})

/**
 * POST /api/cli/token
 * Create a new CLI setup token
 *
 * Requires authentication via Clerk
 * Rate limited to 10 tokens per hour per user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createTokenSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { websiteId, orgId, expiresInMinutes } = validation.data

    // Verify user has access to this website
    const [websiteRecord] = await db
      .select()
      .from(website)
      .where(
        and(
          eq(website.websiteId, websiteId),
          eq(website.userId, user.id)
        )
      )
      .limit(1)

    if (!websiteRecord) {
      return NextResponse.json(
        { error: 'Website not found or access denied' },
        { status: 404 }
      )
    }

    // Create token
    const token = await CliTokenService.createToken({
      userId: user.id,
      websiteId,
      orgId,
      expiresInMinutes,
    })

    return NextResponse.json({
      token: token.token,
      expiresAt: token.expiresAt,
      websiteId: token.websiteId,
    })
  } catch (error) {
    console.error('Error creating CLI token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cli/token
 * Get active tokens for the current user
 */
export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokens = await CliTokenService.getUserTokens(user.id)

    return NextResponse.json({
      tokens: tokens.map(token => ({
        id: token.tokenId,
        websiteId: token.websiteId,
        purpose: token.purpose,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        status: token.status,
      })),
    })
  } catch (error) {
    console.error('Error getting CLI tokens:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
