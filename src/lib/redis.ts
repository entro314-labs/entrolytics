import { EntrolyticsRedisClient } from '@entrolytics/redis-client';

const REDIS = 'redis';
const enabled = !!process.env.REDIS_URL;

function getClient() {
  const redis = new EntrolyticsRedisClient(process.env.REDIS_URL);

  if (process.env.NODE_ENV !== 'production') {
    globalThis[REDIS] = redis;
  }

  return redis;
}

const client = globalThis[REDIS] || getClient();

export default { client, enabled };
