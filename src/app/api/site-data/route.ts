
import { NextResponse } from 'next/server';
import { getMergedSiteData } from '@/lib/site-data';

/**
 * @fileOverview Unified API route to fetch both company settings and services.
 * Now uses a shared library function for consistency.
 */

export async function GET() {
  const data = await getMergedSiteData();
  if (!data) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
  return NextResponse.json(data);
}
