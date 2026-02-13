import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { redis } from '@/lib/redis';

/**
 * @fileOverview Shared service to fetch site-wide data (settings and services) from Firestore.
 * Implements Upstash Redis caching with a 1-minute TTL.
 */

const CACHE_KEY = 'deal4bank_site_data_v1';
const CACHE_TTL = 60; // 1 minute in seconds

export async function getMergedSiteData() {
  try {
    // 1. Try to fetch from Redis Cache
    try {
      const cachedData = await redis.get(CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }
    } catch (cacheError) {
      console.warn('Redis read failed, falling back to Firestore:', cacheError);
    }

    // 2. Fetch Company Settings
    const settingsSnap = await getDoc(doc(db, 'settings', 'company'));
    const settings = settingsSnap.exists() ? settingsSnap.data() : null;

    // 3. Fetch Services Data
    const tabsQuery = query(collection(db, 'services_tabs'), orderBy('order', 'asc'));
    const tabsSnap = await getDocs(tabsQuery);
    
    const tabs = await Promise.all(tabsSnap.docs.map(async (tabDoc) => {
      const tabData = tabDoc.data();
      const itemsQuery = query(collection(db, `services_tabs/${tabDoc.id}/items`), orderBy('order', 'asc'));
      const itemsSnap = await getDocs(itemsQuery);
      
      const items = itemsSnap.docs.map(itemDoc => {
        const itemData = itemDoc.data();
        return {
          id: itemDoc.id,
          type: itemData.title,
          icon: itemData.iconName || 'Shield',
          attributes: itemData.attributes || []
        };
      });

      return {
        id: tabDoc.id,
        title: tabData.name,
        icon: tabData.icon || 'Landmark',
        attributeKeys: tabData.attributeKeys || [],
        data: items
      };
    }));

    const result = {
      settings,
      services: {
        heading: "Our Services and rates:-",
        tabs: tabs
      }
    };

    // 4. Update Redis Cache
    try {
      await redis.set(CACHE_KEY, result, { ex: CACHE_TTL });
    } catch (cacheError) {
      console.warn('Redis write failed:', cacheError);
    }

    return result;
  } catch (error) {
    console.error('Error fetching merged site data:', error);
    return null;
  }
}
