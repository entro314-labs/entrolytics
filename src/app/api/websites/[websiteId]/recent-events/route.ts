import { auth } from '@clerk/nextjs/server';
import { desc, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { websiteEvent } from '@/lib/db/schema';
import { json, serverError, unauthorized } from '@/lib/response';
import { canViewWebsite } from '@/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const authResult = await auth();

  if (!authResult.userId) {
    return unauthorized();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(authResult as any, websiteId))) {
    return unauthorized();
  }

  try {
    // Get recent events from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const events = await db
      .select({
        id: websiteEvent.eventId,
        eventName: websiteEvent.eventName,
        createdAt: websiteEvent.createdAt,
      })
      .from(websiteEvent)
      .where(eq(websiteEvent.websiteId, websiteId))
      .orderBy(desc(websiteEvent.createdAt))
      .limit(10);

    // Filter events from last 5 minutes
    const recentEvents = events.filter(
      event => event.createdAt && event.createdAt >= fiveMinutesAgo,
    );

    return json({ events: recentEvents, count: recentEvents.length });
  } catch (error) {
    console.error('[API Error] /api/websites/[websiteId]/recent-events:', error);
    return serverError({ message: 'Failed to fetch recent events' });
  }
}
