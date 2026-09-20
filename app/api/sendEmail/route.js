import { Resend } from 'resend';

import { NextResponse } from 'next/server';
import EmailTemplate from '@/emails';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const response = await req.json();
        const result = response.data || {};

        if (!result.Email) {
            return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
        }

        const data = await resend.emails.send({
            from: 'Glowing Smiles <onboarding@resend.dev>',
            to: [result.Email],
            subject: 'Appointment Booking Confirmation - Glowing Smiles Doctors',
            react: <EmailTemplate 
                UserName={result.UserName}
                Email={result.Email}
                Time={result.Time}
                Date={result.Date}
                doctor={result.doctor}
                Note={result.Note}
            />
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('SendEmail API Internal Error:', error);
        return NextResponse.json({ error: 'Unable to send confirmation email at this time.' }, { status: 500 });
    }
}