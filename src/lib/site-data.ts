import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { redis } from '@/lib/redis';

/**
 * @fileOverview Shared service to fetch site-wide data (settings and services) from Firestore.
 * Implements Upstash Redis caching with robust error handling for restricted environments.
 */

const CACHE_KEY = 'deal4bank_site_data_v1';
const CACHE_TTL = 60; // 1 minute in seconds

// Hardcoded fallback data to ensure the site never crashes even if Firestore/Redis are unreachable
const STATIC_FALLBACK = {
  settings: {
    name: 'Deal4Bank',
    tagline: 'Your Trusted Financial Partner',
    phone: '9243956990',
    email: 'info@deal4bank.online',
    whatsapp: '9243956990',
    copyright: '© 2024 Deal4Bank. All rights reserved.',
    logoUrl: 'https://picsum.photos/seed/deal-logo/100/100'
  },
  services: {
    heading: "Explore Our Financial Products",
    tabs: [
      {
        id: 'Loan',
        title: 'Loans',
        icon: 'Landmark',
        attributeKeys: ['Interest', 'Tenure', 'Amount'],
        data: []
      }
    ]
  }
};

export async function getMergedSiteData() {
  try {
    // 1. Try to fetch from Redis Cache with extreme safety
    try {
      if (redis) {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
          return cachedData as any;
        }
      }
    } catch (cacheError) {
      // Silent fail for Redis (likely network block like Cisco Umbrella)
      console.warn('Redis unreachable, bypassing cache...');
    }

    // 2. Fetch Company Settings
    let settings = null;
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'company'));
      settings = settingsSnap.exists() ? settingsSnap.data() : STATIC_FALLBACK.settings;
    } catch (fsError) {
      console.warn('Firestore settings fetch failed:', fsError);
      settings = STATIC_FALLBACK.settings;
    }

    // 3. Fetch Services Data
    let tabs = [];
    try {
      const tabsQuery = query(collection(db, 'services_tabs'), orderBy('order', 'asc'));
      const tabsSnap = await getDocs(tabsQuery);
      
      tabs = await Promise.all(tabsSnap.docs.map(async (tabDoc) => {
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
    } catch (fsError) {
      console.warn('Firestore services fetch failed:', fsError);
      tabs = STATIC_FALLBACK.services.tabs;
    }

    const result = {
      settings,
      services: {
        heading: "Our Services and rates:-",
        tabs: tabs.length > 0 ? tabs : STATIC_FALLBACK.services.tabs
      }
    };

    // 4. Update Redis Cache silently
    try {
      if (redis) {
        // Fire and forget, don't await to avoid delaying response
        redis.set(CACHE_KEY, result, { ex: CACHE_TTL }).catch(() => {});
      }
    } catch (e) {
      // Ignore cache write errors
    }

    return result;
  } catch (error) {
    console.error('Critical failure in getMergedSiteData:', error);
    return STATIC_FALLBACK;
  }
}
