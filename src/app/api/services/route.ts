import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * @fileOverview API route to fetch services from the database.
 * Returns raw Firestore data structure as requested: attributeKeys and attributes as arrays.
 */

export async function GET() {
  try {
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
          attributes: itemData.attributes || [] // Array of {label, value}
        };
      });

      return {
        id: tabDoc.id,
        title: tabData.name,
        icon: tabData.icon || 'Landmark',
        attributeKeys: tabData.attributeKeys || [], // Array of strings
        data: items
      };
    }));

    return NextResponse.json({
      heading: "Explore Our Financial Products",
      tabs: tabs
    });
  } catch (error: any) {
    console.error('Services API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
