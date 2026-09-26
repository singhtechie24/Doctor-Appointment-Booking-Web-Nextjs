// Run with: npm test  (Node's built-in test runner, no extra dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTimeSlots, isValidTimeSlot } from './timeSlots.mjs';
import { validateBookingInput, canCancel } from './appointmentService.mjs';

test('time slots run 10:00 AM to 6:30 PM with noon labelled PM', () => {
    const slots = getTimeSlots();
    assert.equal(slots.length, 18);
    assert.equal(slots[0], '10:00 AM');
    assert.equal(slots.at(-1), '6:30 PM');
    assert.deepEqual(slots.slice(3, 6), ['11:30 AM', '12:00 PM', '12:30 PM']);
    assert.ok(!slots.some((s) => s.startsWith('12:') && s.endsWith('AM')));
    assert.ok(isValidTimeSlot('1:00 PM'));
    assert.ok(!isValidTimeSlot('12:00 AM'));
});

const NOW = Date.parse('2030-06-15T12:00:00Z');
const valid = { doctorId: 3, date: '2030-06-20', time: '12:30 PM', note: 'Checkup' };

test('accepts a well-formed booking', () => {
    const result = validateBookingInput(valid, NOW);
    assert.equal(result.ok, true);
    assert.deepEqual(result.value, { doctorId: 3, date: '2030-06-20', time: '12:30 PM', note: 'Checkup' });
});

test('rejects malformed or past bookings', () => {
    const bad = [
        { ...valid, doctorId: 'abc' },
        { ...valid, doctorId: -1 },
        { ...valid, date: '2030-02-30' },
        { ...valid, date: '20-06-2030' },
        { ...valid, date: '2030-06-10' },
        { ...valid, date: '2032-06-20' },
        { ...valid, time: '9:00 PM' },
        { ...valid, note: 'x'.repeat(1001) },
        null,
    ];
    for (const input of bad) assert.equal(validateBookingInput(input, NOW).ok, false, JSON.stringify(input));
});

test('ignores identity fields supplied by the client', () => {
    const result = validateBookingInput({ ...valid, Email: 'someone@else.com', UserName: 'Someone' }, NOW);
    assert.equal(result.ok, true);
    assert.equal('Email' in result.value, false);
    assert.equal('UserName' in result.value, false);
});

test('only the owner can cancel', () => {
    assert.equal(canCancel('Patient.A@example.com', 'patient.a@example.com'), true);
    assert.equal(canCancel('patient.a@example.com', 'patient.b@example.com'), false);
    assert.equal(canCancel('patient.a@example.com', ''), false);
    assert.equal(canCancel(undefined, undefined), false);
});
