
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * @fileOverview API route to fetch services from the database.
 * Returns a structured JSON matching the format expected by the landing page.
 */

export async function GET() {
  try {
    // 1. Fetch all service categories (tabs) ordered by their display order
    const tabsQuery = query(collection(db, 'services_tabs'), orderBy('order', 'asc'));
    const tabsSnap = await getDocs(tabsQuery);
    
    // 2. Fetch items for each category and map them to the landing page format
    const tabs = await Promise.all(tabsSnap.docs.map(async (tabDoc) => {
      const tabData = tabDoc.data();
      const itemsQuery = query(collection(db, `services_tabs/${tabDoc.id}/items`), orderBy('order', 'asc'));
      const itemsSnap = await getDocs(itemsQuery);
      
      const items = itemsSnap.docs.map(itemDoc => {
        const itemData = itemDoc.data();
        const flattened: any = {
          id: itemDoc.id,
          type: itemData.title,
          icon: itemData.iconName || 'Shield'
        };

        // Map dynamic Firestore attributes to keys expected by the HeroSection logic
        // This preserves the "same data" logic from the user's component
        if (itemData.attributes && Array.isArray(itemData.attributes)) {
          itemData.attributes.forEach((attr: any) => {
            const label = attr.label.toLowerCase();
            let key = label;

            // Map common labels to expected property names used in HeroSection spans
            if (label.includes('interest') || label.includes('rate')) key = 'rate';
            else if (label.includes('tenure')) key = 'tenure';
            else if (label.includes('amount')) key = 'amount';
            else if (label.includes('coverage')) key = 'coverage';
            else if (label.includes('premium')) key = 'premium';
            else if (label.includes('return')) key = 'returns';
            else if (label.includes('risk')) key = 'risk';
            else if (label.includes('service')) key = 'service';
            else if (label.includes('commission')) key = 'commission';
            else if (label.includes('fee')) key = 'fee';
            else if (label.includes('feature')) key = 'features';
            
            flattened[key] = attr.value;
          });
        }
        return flattened;
      });

      return {
        id: tabDoc.id,
        title: tabData.name,
        icon: tabData.icon || 'Landmark',
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
