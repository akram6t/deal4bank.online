import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Unified API route to fetch both company settings and services.
 * Merges data from 'settings/company' and 'services_tabs' collections.
 */

export async function GET() {
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

    return NextResponse.json({
      settings,
      services: {
        heading: "Explore Our Financial Products",
        tabs: tabs
      }
    });
  } catch (error: any) {
    console.error('Unified API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
