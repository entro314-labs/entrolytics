import { EntrolyticsRedisClient } from '@entro314labs/redis-client';

const REDIS = 'redis';
const enabled = !!process.env.REDIS_URL;

function getClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
  }

  const redis = new EntrolyticsRedisClient({ url: process.env.REDIS_URL });

  if (process.env.NODE_ENV !== 'production') {
    globalThis[REDIS] = redis;
  }

  return redis;
}

const client = globalThis[REDIS] || (enabled ? getClient() : null);

export default { client, enabled };
