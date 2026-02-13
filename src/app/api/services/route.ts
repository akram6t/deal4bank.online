
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

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
        if (itemData.attributes && Array.isArray(itemData.attributes)) {
          itemData.attributes.forEach((attr: any) => {
            const key = attr.label.toLowerCase();
            // Map common labels to expected property names used in HeroSection.tsx
            if (key.includes('interest') || key.includes('rate')) flattened.rate = attr.value;
            if (key.includes('tenure')) flattened.tenure = attr.value;
            if (key.includes('amount')) flattened.amount = attr.value;
            if (key.includes('coverage')) flattened.coverage = attr.value;
            if (key.includes('premium')) flattened.premium = attr.value;
            if (key.includes('return')) flattened.returns = attr.value;
            if (key.includes('risk')) flattened.risk = attr.value;
            if (key.includes('service')) flattened.service = attr.value;
            if (key.includes('commission')) flattened.commission = attr.value;
            if (key.includes('fee')) flattened.fee = attr.value;
            if (key.includes('feature')) flattened.features = attr.value;
            
            // Store original key-value pair for flexibility
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
