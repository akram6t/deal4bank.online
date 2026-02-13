import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview API route to fetch company settings from Firestore.
 * Returns the company profile details including branding and contact info.
 */

export async function GET() {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'company'));
    
    if (!settingsSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Settings not found' 
      }, { status: 404 });
    }

    return NextResponse.json(settingsSnap.data());
  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
