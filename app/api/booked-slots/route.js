import { NextResponse } from 'next/server';
import { getBookedTimes } from '@/lib/appointmentService.mjs';

// GET ?doctorId=1&date=YYYY-MM-DD → { times: ["10:00 AM", ...] }
// Returns booked time strings only — no patient details.
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    try {
        const { status, body } = await getBookedTimes(searchParams.get('doctorId'), searchParams.get('date'));
        return NextResponse.json(body, { status });
    } catch (error) {
        console.error('Booked slots API error:', error.message);
        return NextResponse.json({ error: 'Unable to load availability' }, { status: 500 });
    }
}
