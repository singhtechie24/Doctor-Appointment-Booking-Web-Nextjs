import { NextResponse } from 'next/server';
import { getSessionIdentity, unauthorized } from '@/app/_utils/sessionIdentity';
import { cancelAppointmentFor } from '@/lib/appointmentService.mjs';

// DELETE: cancel an appointment, only if it belongs to the signed-in patient
export async function DELETE(req, { params }) {
    const identity = await getSessionIdentity();
    if (!identity) return unauthorized();

    const { id } = await params;
    try {
        const { status, body } = await cancelAppointmentFor(identity.email, id);
        return NextResponse.json(body, { status });
    } catch (error) {
        console.error('Appointments API error:', error.message);
        return NextResponse.json({ error: 'Unable to cancel appointment' }, { status: 500 });
    }
}
