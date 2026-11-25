import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cancelBookingRecord,
  createBookingRecord,
  filterDoctors,
  filterServices,
  generateAvailableDays,
  getTimeSlotsForService,
  rescheduleBookingRecord,
} from './booking.logic.ts';
import {CLINICAL_SERVICES, DOCTOR_PROFILES} from './hospital-data.ts';

test('generateAvailableDays creates consecutive upcoming dates', () => {
  const days = generateAvailableDays(new Date(2026, 3, 10), 8);
  assert.equal(days.length, 8);
  assert.equal(days[0].dayShort, 'Today');
  assert.equal(days[1].dayShort, 'Tomorrow');
  assert.equal(days[0].dateIso, '2026-04-10');
});

test('createBookingRecord validates input and prevents double booking', () => {
  const surgery = CLINICAL_SERVICES[0];
  const badResult = createBookingRecord({
    service: surgery,
    dateIso: '2026-04-12',
    timeSlot: '09:30 AM',
    visitMode: 'In-Person at Ogbor Hill',
    patientName: 'A',
    patientPhone: '123',
    patientEmail: 'not-an-email',
    ageGroup: 'Adult (18–64)',
    paymentMethod: 'Credit or Debit Card',
    clinicalNotes: '',
    existingBookings: [],
  });
  assert.equal(badResult.ok, false);

  const valid = createBookingRecord({
    service: surgery,
    dateIso: '2026-04-12',
    timeSlot: '09:30 AM',
    visitMode: 'In-Person at Ogbor Hill',
    patientName: 'Adaeze Obi',
    patientPhone: '+234 807 801 6691',
    patientEmail: 'adaeze@example.com',
    ageGroup: 'Adult (18–64)',
    paymentMethod: 'Credit or Debit Card',
    clinicalNotes: 'Hernia consult',
    existingBookings: [],
    now: new Date('2026-04-10T10:00:00Z'),
  });
  assert.equal(valid.ok, true);
  if (!valid.ok) {
    return;
  }
  assert.match(valid.booking.referenceCode, /^JNX-2026-/);

  const duplicate = createBookingRecord({
    service: surgery,
    dateIso: '2026-04-12',
    timeSlot: '09:30 AM',
    visitMode: 'In-Person at Ogbor Hill',
    patientName: 'Chidi Eze',
    patientPhone: '+234 807 801 6692',
    patientEmail: 'chidi@example.com',
    ageGroup: 'Adult (18–64)',
    paymentMethod: 'NFC Mobile Payment',
    clinicalNotes: '',
    existingBookings: [valid.booking],
  });
  assert.equal(duplicate.ok, false);

  const slots = getTimeSlotsForService(surgery.id, surgery.category, '2026-04-12', [valid.booking]);
  const slot930 = slots.find((s) => s.time === '09:30 AM');
  assert.equal(slot930?.available, false);
});

test('rescheduleBookingRecord & cancelBookingRecord update status and free slots', () => {
  const checkup = CLINICAL_SERVICES[3];
  const created = createBookingRecord({
    service: checkup,
    dateIso: '2026-04-12',
    timeSlot: '10:30 AM',
    visitMode: 'In-Person at Ogbor Hill',
    patientName: 'Ngozi Udeh',
    patientPhone: '+234 807 801 6691',
    patientEmail: 'ngozi@example.com',
    ageGroup: 'Adult (18–64)',
    paymentMethod: 'Front Desk Settlement',
    clinicalNotes: '',
    existingBookings: [],
  });
  assert.equal(created.ok, true);
  if (!created.ok) {
    return;
  }

  const resched = rescheduleBookingRecord(
    [created.booking],
    created.booking.id,
    '2026-04-14',
    '02:00 PM',
  );
  assert.equal(resched.ok, true);
  assert.equal(resched.bookings[0].status, 'Rescheduled');
  assert.equal(resched.bookings[0].dateIso, '2026-04-14');

  const cancelled = cancelBookingRecord(resched.bookings, created.booking.id);
  assert.equal(cancelled[0].status, 'Cancelled');

  const slotsAfterCancel = getTimeSlotsForService(
    checkup.id,
    checkup.category,
    '2026-04-14',
    cancelled,
  );
  assert.equal(slotsAfterCancel.find((s) => s.time === '02:00 PM')?.available, true);
});

test('filterServices & filterDoctors match categories, languages, and search queries', () => {
  assert.equal(filterServices(CLINICAL_SERVICES, 'surgery', '').length, 3);
  assert.equal(filterServices(CLINICAL_SERVICES, 'all', 'Eleweke').length, 1);

  assert.equal(filterDoctors(DOCTOR_PROFILES, 'all', 'Igbo', 'Eleweke').length, 1);
  assert.equal(filterDoctors(DOCTOR_PROFILES, 'maternity', 'all', '').length, 2);
});
