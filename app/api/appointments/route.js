import { NextResponse } from 'next/server';
import { getSessionIdentity, unauthorized } from '@/app/_utils/sessionIdentity';
import { createAppointmentFor, listAppointmentsFor } from '@/lib/appointmentService.mjs';

// GET: the signed-in patient's own appointments (identity comes from the session, never the client)
export async function GET() {
    const identity = await getSessionIdentity();
    if (!identity) return unauthorized();

    try {
        const { status, body } = await listAppointmentsFor(identity.email);
        return NextResponse.json(body, { status });
    } catch (error) {
        console.error('Appointments API error:', error.message);
        return NextResponse.json({ error: 'Unable to load appointments' }, { status: 500 });
    }
}

// POST: book an appointment for the signed-in patient
export async function POST(req) {
    const identity = await getSessionIdentity();
    if (!identity) return unauthorized();

    const input = await req.json().catch(() => null);
    try {
        const { status, body } = await createAppointmentFor(identity, input);
        return NextResponse.json(body, { status });
    } catch (error) {
        console.error('Appointments API error:', error.message);
        return NextResponse.json({ error: 'Unable to create appointment' }, { status: 500 });
    }
}
