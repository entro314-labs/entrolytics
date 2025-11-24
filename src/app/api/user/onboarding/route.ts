import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { user, onboardingStep } from '@/lib/db/schema'
import { json, unauthorized, badRequest, serverError } from '@/lib/response'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const onboardingActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('update'),
    companySize: z.string().optional(),
    industry: z.string().optional(),
    useCase: z.string().optional(),
    referralSource: z.string().optional(),
  }),
  z.object({
    action: z.literal('step'),
    step: z.string(),
    websiteId: z.string().optional(),
  }),
  z.object({
    action: z.literal('skip'),
  }),
  z.object({
    action: z.literal('complete'),
  }),
])

export async function PATCH(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return unauthorized()
  }

  try {
    const body = await request.json()
    const parsed = onboardingActionSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest({ message: 'Invalid request body' })
    }

    const data = parsed.data
    const clerk = await clerkClient()

    switch (data.action) {
      case 'update': {
        // Update user profile with welcome page data
        await db
          .update(user)
          .set({
            companySize: data.companySize,
            industry: data.industry,
            useCase: data.useCase,
            referralSource: data.referralSource,
          })
          .where(eq(user.clerkId, userId))

        return json({ success: true })
      }

      case 'step': {
        // Track onboarding step progress
        const [currentUser] = await db
          .select()
          .from(user)
          .where(eq(user.clerkId, userId))
          .limit(1)

        if (!currentUser) {
          return badRequest({ message: 'User not found' })
        }

        // Update user onboarding step
        await db
          .update(user)
          .set({
            onboardingStep: data.step,
          })
          .where(eq(user.userId, currentUser.userId))

        // Log step completion
        await db.insert(onboardingStep).values({
          userId: currentUser.userId,
          step: data.step,
          action: 'completed',
          metadata: data.websiteId ? { websiteId: data.websiteId } : null,
        })

        // Update Clerk metadata
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            onboardingStep: data.step,
          },
        })

        return json({ success: true })
      }

      case 'skip': {
        // Mark onboarding as skipped
        const [currentUser] = await db
          .select()
          .from(user)
          .where(eq(user.clerkId, userId))
          .limit(1)

        if (!currentUser) {
          return badRequest({ message: 'User not found' })
        }

        await db
          .update(user)
          .set({
            onboardingCompleted: 'true',
            onboardingSkipped: 'true',
          })
          .where(eq(user.userId, currentUser.userId))

        // Update Clerk metadata
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            onboardingCompleted: true,
            onboardingSkipped: true,
          },
        })

        return json({ success: true })
      }

      case 'complete': {
        // Mark onboarding as completed
        const [currentUser] = await db
          .select()
          .from(user)
          .where(eq(user.clerkId, userId))
          .limit(1)

        if (!currentUser) {
          return badRequest({ message: 'User not found' })
        }

        await db
          .update(user)
          .set({
            onboardingCompleted: 'true',
            onboardingSkipped: 'false',
            onboardingCompletedAt: new Date(),
          })
          .where(eq(user.userId, currentUser.userId))

        // Update Clerk metadata
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            onboardingCompleted: true,
            onboardingSkipped: false,
          },
        })

        return json({ success: true })
      }
    }
  } catch (error) {
    console.error('[API Error] /api/user/onboarding:', error)
    return serverError({ message: 'Failed to update onboarding status' })
  }
}
