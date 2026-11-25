import type {CareCategory, ClinicalService, PaymentMethod} from './hospital-data.ts';

export type BookingStatus = 'Confirmed' | 'Rescheduled' | 'Cancelled';
export type VisitMode = 'In-Person at Ogbor Hill' | 'Pre-Visit Phone Triage';

export interface BookableDay {
  readonly dateIso: string;
  readonly dayShort: string;
  readonly dateLabel: string;
  readonly isWeekend: boolean;
}

export interface TimeSlotOption {
  readonly time: string;
  readonly period: 'Morning' | 'Afternoon';
  readonly available: boolean;
}

export interface BookingRecord {
  readonly id: string;
  readonly referenceCode: string;
  readonly serviceId: string;
  readonly serviceTitle: string;
  readonly department: string;
  readonly category: CareCategory;
  readonly feeRangeNgn: string;
  readonly specialistName: string;
  readonly dateIso: string;
  readonly timeSlot: string;
  readonly visitMode: VisitMode;
  readonly patientName: string;
  readonly patientPhone: string;
  readonly patientEmail: string;
  readonly ageGroup: string;
  readonly paymentMethod: PaymentMethod;
  readonly clinicalNotes: string;
  readonly preVisitNote: string;
  readonly status: BookingStatus;
  readonly createdAtIso: string;
}

export interface CreateBookingInput {
  readonly service: ClinicalService;
  readonly dateIso: string;
  readonly timeSlot: string;
  readonly visitMode: VisitMode;
  readonly patientName: string;
  readonly patientPhone: string;
  readonly patientEmail: string;
  readonly ageGroup: string;
  readonly paymentMethod: PaymentMethod;
  readonly clinicalNotes: string;
  readonly existingBookings: readonly BookingRecord[];
  readonly now?: Date;
}

export type BookingCreationResult =
  | {readonly ok: true; readonly booking: BookingRecord}
  | {readonly ok: false; readonly errors: readonly string[]};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateAvailableDays(startDate: Date, count = 8): readonly BookableDay[] {
  const days: BookableDay[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const weekday = d.getDay();
    days.push({
      dateIso: toIsoDateString(d),
      dayShort: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : WEEKDAYS[weekday],
      dateLabel: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      isWeekend: weekday === 0 || weekday === 6,
    });
  }
  return days;
}

export const SLOTS_BY_CATEGORY: Record<CareCategory, readonly string[]> = {
  surgery: ['08:30 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'],
  checkup: ['08:00 AM', '09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '04:30 PM'],
  diagnostic: ['07:30 AM', '08:30 AM', '09:30 AM', '11:00 AM', '01:00 PM', '02:30 PM'],
  maternity: ['08:30 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:00 PM'],
  specialty: ['09:00 AM', '10:30 AM', '12:30 PM', '02:30 PM', '04:00 PM'],
};

export function getTimeSlotsForService(
  serviceId: string,
  category: CareCategory,
  dateIso: string,
  existingBookings: readonly BookingRecord[],
): readonly TimeSlotOption[] {
  const baseSlots = SLOTS_BY_CATEGORY[category];
  const takenSlots = new Set(
    existingBookings
      .filter(
        (b) =>
          b.status !== 'Cancelled' &&
          b.serviceId === serviceId &&
          b.dateIso === dateIso,
      )
      .map((b) => b.timeSlot),
  );

  return baseSlots.map((time) => ({
    time,
    period: time.endsWith('AM') ? 'Morning' : 'Afternoon',
    available: !takenSlots.has(time),
  }));
}

export function isValidPhoneNumber(rawPhone: string): boolean {
  const cleaned = rawPhone.replace(/[\s\-()]/g, '');
  return /^\+?[0-9]{10,15}$/.test(cleaned);
}

export function isValidEmail(rawEmail: string): boolean {
  const trimmed = rawEmail.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function generateReferenceCode(existingCount: number, now: Date): string {
  const year = now.getFullYear();
  const seq = String(1001 + existingCount).padStart(4, '0');
  const suffix = String(now.getSeconds()).padStart(2, '0');
  return `JNX-${year}-${seq}${suffix}`;
}

export function createBookingRecord(input: CreateBookingInput): BookingCreationResult {
  const errors: string[] = [];
  const trimmedName = input.patientName.trim();
  const trimmedPhone = input.patientPhone.trim();
  const trimmedEmail = input.patientEmail.trim();

  if (trimmedName.length < 2) {
    errors.push('Enter the patient’s full name (at least 2 characters).');
  }
  if (!isValidPhoneNumber(trimmedPhone)) {
    errors.push('Enter a valid phone number (10–15 digits, e.g. +234 807 801 6691).');
  }
  if (!isValidEmail(trimmedEmail)) {
    errors.push('Enter a valid email address for your booking confirmation slip.');
  }
  if (!input.dateIso) {
    errors.push('Select an appointment date.');
  }
  if (!input.timeSlot) {
    errors.push('Select an available time slot.');
  }

  const slotConflict = input.existingBookings.some(
    (b) =>
      b.status !== 'Cancelled' &&
      b.serviceId === input.service.id &&
      b.dateIso === input.dateIso &&
      b.timeSlot === input.timeSlot,
  );
  if (slotConflict) {
    errors.push('That time slot has already been reserved. Choose another open time.');
  }

  if (errors.length > 0) {
    return {ok: false, errors};
  }

  const now = input.now ?? new Date();
  const booking: BookingRecord = {
    id: `bk-${now.getTime()}-${input.existingBookings.length + 1}`,
    referenceCode: generateReferenceCode(input.existingBookings.length, now),
    serviceId: input.service.id,
    serviceTitle: input.service.title,
    department: input.service.department,
    category: input.service.category,
    feeRangeNgn: input.service.feeRangeNgn,
    specialistName: input.service.specialistName,
    dateIso: input.dateIso,
    timeSlot: input.timeSlot,
    visitMode: input.visitMode,
    patientName: trimmedName,
    patientPhone: trimmedPhone,
    patientEmail: trimmedEmail,
    ageGroup: input.ageGroup || 'Adult (18–64)',
    paymentMethod: input.paymentMethod,
    clinicalNotes: input.clinicalNotes.trim(),
    preVisitNote: input.service.preVisitNote,
    status: 'Confirmed',
    createdAtIso: now.toISOString(),
  };

  return {ok: true, booking};
}

export function rescheduleBookingRecord(
  bookings: readonly BookingRecord[],
  bookingId: string,
  newDateIso: string,
  newTimeSlot: string,
): {readonly ok: boolean; readonly bookings: readonly BookingRecord[]; readonly error?: string} {
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) {
    return {ok: false, bookings, error: 'Booking record not found.'};
  }
  if (target.status === 'Cancelled') {
    return {ok: false, bookings, error: 'Cancelled appointments cannot be rescheduled.'};
  }

  const conflict = bookings.some(
    (b) =>
      b.id !== bookingId &&
      b.status !== 'Cancelled' &&
      b.serviceId === target.serviceId &&
      b.dateIso === newDateIso &&
      b.timeSlot === newTimeSlot,
  );
  if (conflict) {
    return {ok: false, bookings, error: 'Selected date and time slot is already booked.'};
  }

  const updated = bookings.map((b) =>
    b.id === bookingId
      ? {
          ...b,
          dateIso: newDateIso,
          timeSlot: newTimeSlot,
          status: 'Rescheduled' as const,
        }
      : b,
  );

  return {ok: true, bookings: updated};
}

export function cancelBookingRecord(
  bookings: readonly BookingRecord[],
  bookingId: string,
): readonly BookingRecord[] {
  return bookings.map((b) =>
    b.id === bookingId ? {...b, status: 'Cancelled' as const} : b,
  );
}

export function filterServices(
  services: readonly ClinicalService[],
  category: CareCategory | 'all',
  query: string,
): readonly ClinicalService[] {
  const normalized = query.trim().toLowerCase();
  return services.filter((service) => {
    const matchesCategory = category === 'all' || service.category === category;
    if (!matchesCategory) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return (
      service.title.toLowerCase().includes(normalized) ||
      service.department.toLowerCase().includes(normalized) ||
      service.summary.toLowerCase().includes(normalized) ||
      service.specialistName.toLowerCase().includes(normalized)
    );
  });
}

export interface DoctorFilterable {
  readonly name: string;
  readonly role: string;
  readonly specialty: string;
  readonly category: CareCategory;
  readonly languages: readonly string[];
  readonly bio: string;
}

export function filterDoctors<T extends DoctorFilterable>(
  doctors: readonly T[],
  category: CareCategory | 'all',
  language: string | 'all',
  query: string,
): readonly T[] {
  const normalized = query.trim().toLowerCase();
  return doctors.filter((doc) => {
    const matchesCategory = category === 'all' || doc.category === category;
    if (!matchesCategory) {
      return false;
    }
    const matchesLanguage = language === 'all' || doc.languages.includes(language);
    if (!matchesLanguage) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return (
      doc.name.toLowerCase().includes(normalized) ||
      doc.specialty.toLowerCase().includes(normalized) ||
      doc.role.toLowerCase().includes(normalized) ||
      doc.bio.toLowerCase().includes(normalized)
    );
  });
}
