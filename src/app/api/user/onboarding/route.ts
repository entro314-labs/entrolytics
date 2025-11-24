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
        try {
          const updateData: any = {}

          // Only add fields that are provided
          if (data.companySize) updateData.companySize = data.companySize
          if (data.industry) updateData.industry = data.industry
          if (data.useCase) updateData.useCase = data.useCase
          if (data.referralSource) updateData.referralSource = data.referralSource

          // Only update if there's data to update
          if (Object.keys(updateData).length > 0) {
            await db
              .update(user)
              .set(updateData)
              .where(eq(user.clerkId, userId))
          }

          return json({ success: true })
        } catch (error) {
          // If columns don't exist, just continue without error
          console.warn('Could not update onboarding data, columns may not exist:', error)
          return json({ success: true })
        }
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
