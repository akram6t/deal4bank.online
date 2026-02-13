
'use server';

import { redis } from '@/lib/redis';

/**
 * @fileOverview Server actions for managing Redis cache invalidation.
 */

const CACHE_KEY = 'deal4bank_site_data_v1';

export async function invalidateSiteDataCache() {
  try {
    await redis.del(CACHE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    return { success: false, error: 'Cache invalidation failed' };
  }
}
