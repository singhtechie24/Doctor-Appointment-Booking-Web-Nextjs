// Server-only access to Strapi appointments.
// Uses a server-side API token (STRAPI_API_TOKEN) — never import this from client components.
import { isValidTimeSlot } from './timeSlots.mjs';

if (typeof window !== 'undefined') {
    throw new Error('appointmentService must only be used on the server');
}

const baseUrl = () =>
    (process.env.STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337').trim();

const strapiFetch = async (path, init = {}) => {
    const token = (process.env.STRAPI_API_TOKEN || '').trim();
    if (!token) throw new Error('STRAPI_API_TOKEN is not configured');

    const res = await fetch(`${baseUrl()}/api${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
        cache: 'no-store',
    });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
};

const query = (params) => new URLSearchParams(params).toString();

const normaliseEmail = (email) => String(email || '').trim().toLowerCase();

// Only the fields the My Bookings UI renders, in the shape it already expects.
const toBookingView = (item) => {
    const doctor = item.attributes?.doctor?.data;
    return {
        id: item.id,
        attributes: {
            Date: item.attributes?.Date,
            Time: item.attributes?.Time,
            doctor: {
                data: doctor
                    ? {
                          id: doctor.id,
                          attributes: {
                              Name: doctor.attributes?.Name,
                              Address: doctor.attributes?.Address,
                              image: {
                                  data: doctor.attributes?.image?.data
                                      ? { attributes: { url: doctor.attributes.image.data.attributes?.url } }
                                      : null,
                              },
                          },
                      }
                    : null,
            },
        },
    };
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NOTE_LENGTH = 1000;
const MAX_DAYS_AHEAD = 365;

const isCalendarDate = (value) => {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const toPositiveInt = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * Validates booking input from the browser. Identity fields are NOT accepted here —
 * they come from the Kinde session.
 * The server does not know the patient's timezone, so a date is only rejected as past
 * once it has ended everywhere (UTC-12); same-day past slots are handled in the UI.
 */
export const validateBookingInput = (input, now = Date.now()) => {
    const errors = [];
    const doctorId = toPositiveInt(input?.doctorId);
    if (!doctorId) errors.push('doctorId must be a positive integer');

    const date = input?.date;
    if (!isCalendarDate(date)) {
        errors.push('date must be a valid YYYY-MM-DD date');
    } else {
        if (Date.parse(`${date}T23:59:59-12:00`) < now) errors.push('date is in the past');
        if (Date.parse(`${date}T00:00:00Z`) > now + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000) {
            errors.push('date is too far in the future');
        }
    }

    const time = input?.time;
    if (!isValidTimeSlot(time)) errors.push('time must be one of the offered slots');

    const note = input?.note ?? '';
    if (typeof note !== 'string' || note.length > MAX_NOTE_LENGTH) {
        errors.push(`note must be text of at most ${MAX_NOTE_LENGTH} characters`);
    }

    return errors.length
        ? { ok: false, errors }
        : { ok: true, value: { doctorId, date, time, note: note.trim() } };
};

export const canCancel = (appointmentEmail, sessionEmail) =>
    !!normaliseEmail(sessionEmail) && normaliseEmail(appointmentEmail) === normaliseEmail(sessionEmail);

export const listAppointmentsFor = async (email) => {
    const { status, body } = await strapiFetch(
        '/appointments?' +
            query({
                'filters[Email][$eqi]': normaliseEmail(email),
                'fields[0]': 'Date',
                'fields[1]': 'Time',
                'populate[doctor][fields][0]': 'Name',
                'populate[doctor][fields][1]': 'Address',
                'populate[doctor][populate][image][fields][0]': 'url',
                'sort[0]': 'Date:asc',
                'pagination[pageSize]': '100',
            })
    );
    if (status !== 200) return { status: 502, body: { error: 'Unable to load appointments' } };
    return { status: 200, body: { data: (body?.data || []).map(toBookingView) } };
};

export const getBookedTimes = async (doctorIdInput, date) => {
    const doctorId = toPositiveInt(doctorIdInput);
    if (!doctorId || !isCalendarDate(date)) {
        return { status: 400, body: { error: 'doctorId and a YYYY-MM-DD date are required' } };
    }
    const { status, body } = await strapiFetch(
        '/appointments?' +
            query({
                'filters[doctor][id][$eq]': String(doctorId),
                'filters[Date][$eq]': date,
                'fields[0]': 'Time',
                'pagination[pageSize]': '100',
            })
    );
    if (status !== 200) return { status: 502, body: { error: 'Unable to load availability' } };
    const times = [...new Set((body?.data || []).map((a) => a.attributes?.Time).filter(Boolean))];
    return { status: 200, body: { times } };
};

/**
 * Creates an appointment for the signed-in patient.
 * The slot check below narrows, but does not eliminate, the double-booking window:
 * there is no database-level uniqueness constraint on doctor/date/time.
 */
export const createAppointmentFor = async (identity, input) => {
    const validation = validateBookingInput(input);
    if (!validation.ok) return { status: 400, body: { error: 'Invalid booking request', details: validation.errors } };
    const { doctorId, date, time, note } = validation.value;

    const doctor = await strapiFetch(`/doctors/${doctorId}?` + query({ 'fields[0]': 'Name' }));
    if (doctor.status === 404) return { status: 404, body: { error: 'Doctor not found' } };
    if (doctor.status !== 200) return { status: 502, body: { error: 'Unable to verify doctor' } };

    const booked = await getBookedTimes(doctorId, date);
    if (booked.status !== 200) return booked;
    if (booked.body.times.includes(time)) {
        return { status: 409, body: { error: 'This slot has just been booked. Please choose another time.' } };
    }

    const created = await strapiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
            data: {
                UserName: identity.name,
                Email: normaliseEmail(identity.email),
                Date: date,
                Time: time,
                Note: note,
                doctor: doctorId,
            },
        }),
    });
    if (created.status !== 200 && created.status !== 201) {
        return { status: 502, body: { error: 'Unable to create appointment' } };
    }

    return {
        status: 201,
        body: {
            data: { id: created.body?.data?.id, date, time, doctorName: doctor.body?.data?.attributes?.Name || '' },
        },
    };
};

export const cancelAppointmentFor = async (email, idInput) => {
    const id = toPositiveInt(idInput);
    if (!id) return { status: 400, body: { error: 'Invalid appointment id' } };

    const existing = await strapiFetch(`/appointments/${id}?` + query({ 'fields[0]': 'Email' }));
    if (existing.status === 404) return { status: 404, body: { error: 'Appointment not found' } };
    if (existing.status !== 200) return { status: 502, body: { error: 'Unable to load appointment' } };

    if (!canCancel(existing.body?.data?.attributes?.Email, email)) {
        return { status: 403, body: { error: 'You can only cancel your own appointments' } };
    }

    const deleted = await strapiFetch(`/appointments/${id}`, { method: 'DELETE' });
    if (deleted.status !== 200) return { status: 502, body: { error: 'Unable to cancel appointment' } };
    return { status: 200, body: { success: true } };
};
