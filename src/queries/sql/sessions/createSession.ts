import { db, session, NewSession } from '@/lib/db'

export async function createSession(data: NewSession) {
  try {
    const [newSession] = await db
      .insert(session)
      .values(data)
      .returning()
      .onConflictDoNothing()

    return newSession
  } catch (e: any) {
    if (e.message.toLowerCase().includes('unique constraint')) {
      return null
    }
    throw e
  }
}
