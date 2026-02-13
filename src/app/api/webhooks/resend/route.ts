
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const POST = async (request: NextRequest) => {
  try {
    const event = await request.json();

    if (event.type === 'email.received') {
      const emailData = event.data;
      
      // Save to Firestore
      await addDoc(collection(db, 'emails'), {
        email_id: emailData.email_id,
        from: emailData.from,
        to: emailData.to?.[0] || 'unknown@deal4bank.com',
        subject: emailData.subject,
        body: emailData.text || emailData.html || '(No content)',
        attachments: emailData.attachments || [],
        status: 'inbox',
        read: false,
        starred: false,
        createdAt: serverTimestamp()
      });

      // Note: Resend doesn't provide attachment content directly in webhook.
      // Usually you'd fetch it via Resend API using email_id if needed.
      // For now, we store the metadata.

      return NextResponse.json({ success: true, message: 'Email recorded' });
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
