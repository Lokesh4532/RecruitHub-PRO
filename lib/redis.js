import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// In dev mode, use a global variable to avoid multiple connections
// caused by hot-reloading in Next.js
let globalWithRedis = global;
if (!globalWithRedis._redisClient) {
  globalWithRedis._redisClient = redisClient;
  // Let it connect immediately or when required.
}

export async function getRedisClient() {
  const client = globalWithRedis._redisClient;
  if (!client.isOpen) {
    await client.connect().catch((err) => {
      // Prevent crash if Redis server isn't running and instead fallback gracefully wherever used
      console.warn('Could not connect to Redis server. Make sure it is running.');
    });
  }
  return client;
}
