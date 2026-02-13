'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmailAction({ to, subject, text }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to send email:', err);
    throw new Error(err.message || 'Failed to send email');
  }
}
