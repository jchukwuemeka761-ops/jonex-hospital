import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cancelBookingRecord,
  createBookingRecord,
  filterDoctors,
  filterServices,
  generateAvailableDays,
  getTimeSlotsForService,
  isValidEmail,
  isValidPhoneNumber,
  rescheduleBookingRecord,
} from './booking.logic';
import {CLINICAL_SERVICES, DOCTOR_PROFILES} from './hospital-data';

test('generateAvailableDays creates deterministic sequence with Today and Tomorrow', () => {
  const days = generateAvailableDays(new Date(2026, 10, 23), 5);
  assert.equal(days.length, 5);
  assert.equal(days[0].dayShort, 'Today');
  assert.equal(days[0].dateIso, '2026-11-23');
  assert.equal(days[1].dayShort, 'Tomorrow');
  assert.equal(days[1].dateIso, '2026-11-24');
});

test('phone and email validation reject malformed entries and accept valid Nigerian/international inputs', () => {
  assert.equal(isValidPhoneNumber('+234 807 801 6691'), true);
  assert.equal(isValidPhoneNumber('08078016691'), true);
  assert.equal(isValidPhoneNumber('12345'), false);

  assert.equal(isValidEmail('patient@jonexaba.ng'), true);
  assert.equal(isValidEmail('invalid-email'), false);
});

test('createBookingRecord creates confirmed booking and prevents double-booking the same slot', () => {
  const surgeryService = CLINICAL_SERVICES.find((s) => s.category === 'surgery')!;
  const first = createBookingRecord({
    service: surgeryService,
    dateIso: '2026-11-24',
    timeSlot: '09:30 AM',
    visitMode: 'In-Person at Ogbor Hill',
    patientName: 'Chidi Nwankwo',
    patientPhone: '+234 803 555 0192',
    patientEmail: 'chidi@example.com',
    ageGroup: 'Adult (18–64)',
    paymentMethod: 'Credit or Debit Card',
    clinicalNotes: 'Right inguinal hernia assessment',
    existingBookings: [],
    now: new Date(2026, 10, 23, 10, 15, 30),
  });

  assert.equal(first.ok, true);
  if (!first.ok) {
    return;
  }

  assert.equal(first.booking.status, 'Confirmed');
  assert.match(first.booking.referenceCode, /^JNX-2026-/);

  const slotsAfter = getTimeSlotsForService(
    surgeryService.id,
    surgeryService.category,
    '2026-11-24',
    [first.booking],
  );
  const bookedSlot = slotsAfter.find((s) => s.time === '09:30 AM');
  assert.equal(bookedSlot?.available, false);

  const duplicate = createBookingRecord({
    service: surgeryService,
    dateIso: '2026-11-24',
    timeSlot: '09:30 AM',
    visitMode: 'In-Person at Ogbor Hill',
    patientName: 'Adaeze Eze',
    patientPhone: '08091234567',
    patientEmail: 'adaeze@example.com',
    ageGroup: 'Adult (18–64)',
    paymentMethod: 'NFC Mobile Payment',
    clinicalNotes: '',
    existingBookings: [first.booking],
  });

  assert.equal(duplicate.ok, false);
});

test('rescheduleBookingRecord updates slot and cancelBookingRecord frees slot', () => {
  const checkupService = CLINICAL_SERVICES.find((s) => s.category === 'checkup')!;
  const created = createBookingRecord({
    service: checkupService,
    dateIso: '2026-11-24',
    timeSlot: '08:00 AM',
    visitMode: 'In-Person at Ogbor Hill',
    patientName: 'Ngozi Obi',
    patientPhone: '08078016691',
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

  const rescheduled = rescheduleBookingRecord(
    [created.booking],
    created.booking.id,
    '2026-11-25',
    '10:30 AM',
  );
  assert.equal(rescheduled.ok, true);
  assert.equal(rescheduled.bookings[0].status, 'Rescheduled');
  assert.equal(rescheduled.bookings[0].dateIso, '2026-11-25');

  const cancelled = cancelBookingRecord(rescheduled.bookings, created.booking.id);
  assert.equal(cancelled[0].status, 'Cancelled');

  const slotsAfterCancel = getTimeSlotsForService(
    checkupService.id,
    checkupService.category,
    '2026-11-25',
    cancelled,
  );
  assert.equal(slotsAfterCancel.find((s) => s.time === '10:30 AM')?.available, true);
});

test('filterServices matches by category and keyword query', () => {
  const diagnostic = filterServices(CLINICAL_SERVICES, 'diagnostic', '');
  assert.ok(diagnostic.length >= 2);
  assert.ok(diagnostic.every((s) => s.category === 'diagnostic'));

  const search = filterServices(CLINICAL_SERVICES, 'all', 'hernia');
  assert.equal(search.length, 1);
  assert.equal(search[0].id, 'surg-general-consult');
});

test('filterDoctors filters by specialty category, spoken language, and doctor name', () => {
  const igboSurgeons = filterDoctors(DOCTOR_PROFILES, 'surgery', 'Igbo', 'Eleweke');
  assert.equal(igboSurgeons.length, 1);
  assert.equal(igboSurgeons[0].name, 'Dr. Ndukauba Eleweke');

  const allDocs = filterDoctors(DOCTOR_PROFILES, 'all', 'all', '');
  assert.equal(allDocs.length, DOCTOR_PROFILES.length);

  const emptySearch = filterDoctors(DOCTOR_PROFILES, 'maternity', 'English', 'Dental');
  assert.equal(emptySearch.length, 0);
});

