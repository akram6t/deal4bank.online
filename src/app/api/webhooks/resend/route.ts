
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const POST = async (request: NextRequest) => {
  try {
    const event = await request.json();

    if (event.type === 'email.received') {
      const emailData = event.data;
      
      // 1. Save the Email to Firestore
      const emailRef = await addDoc(collection(db, 'emails'), {
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

      // 2. Trigger a Notification event in Firestore for the Admin UI
      await addDoc(collection(db, 'notifications'), {
        type: 'NEW_EMAIL',
        title: 'New Email Received',
        message: `From: ${emailData.from}\nSubject: ${emailData.subject}`,
        emailId: emailRef.id,
        read: false,
        createdAt: serverTimestamp()
      });

      // Note: Attachments in Resend webhooks are metadata. 
      // In a production app, you would fetch the attachment binary using the Resend API
      // and then upload to Firebase Storage: storageRef = ref(storage, `attachments/${id}`)

      return NextResponse.json({ success: true, message: 'Email and notification recorded' });
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
