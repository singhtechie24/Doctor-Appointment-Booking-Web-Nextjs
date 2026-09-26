// Consultation slots shared by the booking modal and the appointment API.
// Every 30 minutes from 10:00 AM up to and including 6:30 PM.
const FIRST_SLOT_MINUTES = 10 * 60;
const LAST_SLOT_MINUTES = 18 * 60 + 30;

export const formatSlot = (minutesSinceMidnight) => {
    const hours24 = Math.floor(minutesSinceMidnight / 60);
    const minutes = minutesSinceMidnight % 60;
    const hours12 = hours24 % 12 || 12;
    const suffix = hours24 < 12 ? 'AM' : 'PM';
    return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

export const getTimeSlots = () => {
    const slots = [];
    for (let m = FIRST_SLOT_MINUTES; m <= LAST_SLOT_MINUTES; m += 30) {
        slots.push(formatSlot(m));
    }
    return slots;
};

export const isValidTimeSlot = (time) => getTimeSlots().includes(time);
