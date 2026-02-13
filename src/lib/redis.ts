
import { Redis } from '@upstash/redis';

/**
 * @fileOverview Redis client initialization using Upstash Serverless Redis.
 * This client is used for caching site-wide data to improve performance.
 */

export const redis = new Redis({
  url: 'https://thorough-fowl-55617.upstash.io',
  token: 'AdlBAAIncDI4NzAzMWE4OWM4ZDY0NTU3YTgzMjlmODBhOWMzZTExNHAyNTU2MTc',
});
