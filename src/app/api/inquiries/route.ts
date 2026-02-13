import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

// Zod schema for form validation as requested
const inquirySchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  serviceType: z.string().min(1, 'Service type is required'),
});

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Validate the input data
    const validation = inquirySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { data } = validation;

    // 1. Save the Inquiry to Firestore
    // Mapping serviceType to service to match existing dashboard schema
    const inquiryRef = await addDoc(collection(db, 'inquiries'), {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      service: data.serviceType,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    // 2. Trigger a Notification event for the Admin UI
    await addDoc(collection(db, 'notifications'), {
      type: 'NEW_INQUIRY',
      title: 'New Service Inquiry',
      message: `${data.fullName} applied for ${data.serviceType}`,
      inquiryId: inquiryRef.id,
      read: false,
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry received and recorded',
      id: inquiryRef.id 
    });

  } catch (error: any) {
    console.error('Inquiry API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
};
