'use server';

import { redis } from '@/lib/redis';

/**
 * @fileOverview Server actions for managing Redis cache invalidation.
 * Updated to handle network failures gracefully.
 */

const CACHE_KEY = 'deal4bank_site_data_v1';

export async function invalidateSiteDataCache() {
  try {
    if (redis) {
      await redis.del(CACHE_KEY);
    }
    return { success: true };
  } catch (error) {
    // We log but return success: false to the UI so it doesn't crash
    console.warn('Failed to invalidate cache (Redis might be blocked):', error);
    return { success: false, error: 'Cache invalidation failed' };
  }
}
