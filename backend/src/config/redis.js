const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.warn('Redis: maximum reconnect attempts reached, waiting 5s');
        return 5000;
      }
      return Math.min(retries * 200, 3000);
    },
  },
});

let isConnected = false;

redisClient.on('connect', () => {
  isConnected = true;
  console.log('Redis client connected to cache cluster.');
});

redisClient.on('error', (err) => {
  isConnected = false;
  console.warn('Redis client error (operating with cache-fallback):', err.message);
});

redisClient.on('ready', () => {
  isConnected = true;
  console.log('Redis client is ready to accept commands.');
});

async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.warn('Redis initial connection error (continuing without cache):', err.message);
  }
}

/**
 * Get value from Redis cache
 */
async function getCache(key) {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`Redis getCache error for key ${key}:`, err.message);
    return null;
  }
}

/**
 * Write value to Redis cache with TTL
 */
async function setCache(key, value, ttlSeconds = 300) {
  try {
    if (!redisClient.isOpen) return false;
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
    return true;
  } catch (err) {
    console.warn(`Redis setCache error for key ${key}:`, err.message);
    return false;
  }
}

/**
 * Delete key from Redis cache
 */
async function delCache(key) {
  try {
    if (!redisClient.isOpen) return false;
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.warn(`Redis delCache error for key ${key}:`, err.message);
    return false;
  }
}

/**
 * Delete multiple keys matching prefix/pattern
 */
async function invalidateCachePattern(pattern) {
  try {
    if (!redisClient.isOpen) return false;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} cache keys matching '${pattern}'`);
    }
    return true;
  } catch (err) {
    console.warn(`Redis invalidateCachePattern error for ${pattern}:`, err.message);
    return false;
  }
}

module.exports = {
  redisClient,
  connectRedis,
  getCache,
  setCache,
  delCache,
  invalidateCachePattern,
};
