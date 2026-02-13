
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Shared service to fetch site-wide data (settings and services) from Firestore.
 */

export async function getMergedSiteData() {
  try {
    // 1. Fetch Company Settings
    const settingsSnap = await getDoc(doc(db, 'settings', 'company'));
    const settings = settingsSnap.exists() ? settingsSnap.data() : null;

    // 2. Fetch Services Data
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

    return {
      settings,
      services: {
        heading: "Explore Our Financial Products",
        tabs: tabs
      }
    };
  } catch (error) {
    console.error('Error fetching merged site data:', error);
    return null;
  }
}
