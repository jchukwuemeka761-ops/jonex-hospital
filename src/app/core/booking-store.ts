import {isPlatformBrowser} from '@angular/common';
import {computed, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {
  BookingCreationResult,
  BookingRecord,
  cancelBookingRecord,
  createBookingRecord,
  CreateBookingInput,
  rescheduleBookingRecord,
  toIsoDateString,
} from './booking.logic';
import {CareCategory, CLINICAL_SERVICES} from './hospital-data';

const STORAGE_KEY = 'jonex_hospital_bookings_v1';

function buildSeedBookings(): readonly BookingRecord[] {
  const today = new Date();
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
  const checkup = CLINICAL_SERVICES[3];
  return [
    {
      id: 'seed-1',
      referenceCode: `JNX-${today.getFullYear()}-0842`,
      serviceId: checkup.id,
      serviceTitle: checkup.title,
      department: checkup.department,
      category: checkup.category,
      feeRangeNgn: checkup.feeRangeNgn,
      specialistName: checkup.specialistName,
      dateIso: toIsoDateString(nextWeek),
      timeSlot: '10:30 AM',
      visitMode: 'In-Person at Ogbor Hill',
      patientName: 'Kelechi Okafor (Sample)',
      patientPhone: '+234 807 801 6691',
      patientEmail: 'kelechi.sample@example.com',
      ageGroup: 'Adult (18–64)',
      paymentMethod: 'Credit or Debit Card',
      clinicalNotes: 'Routine annual blood pressure & metabolic wellness check.',
      preVisitNote: checkup.preVisitNote,
      status: 'Confirmed',
      createdAtIso: today.toISOString(),
    },
  ];
}

@Injectable({providedIn: 'root'})
export class BookingStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _bookings = signal<readonly BookingRecord[]>(this.loadInitialBookings());
  private readonly _selectedCategory = signal<CareCategory>('checkup');
  private readonly _selectedServiceId = signal<string>('chk-annual-physical');

  readonly bookings = this._bookings.asReadonly();
  readonly activeBookingsCount = computed(
    () => this._bookings().filter((b) => b.status !== 'Cancelled').length,
  );
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly selectedServiceId = this._selectedServiceId.asReadonly();

  private loadInitialBookings(): readonly BookingRecord[] {
    if (!this.isBrowser) {
      return buildSeedBookings();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = buildSeedBookings();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as BookingRecord[];
      }
    } catch {
      // Fallback safely if storage is unavailable
    }
    return buildSeedBookings();
  }

  private persist(records: readonly BookingRecord[]): void {
    this._bookings.set(records);
    if (this.isBrowser) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch {
        // Ignore quota errors
      }
    }
  }

  selectServiceForBooking(serviceId: string): void {
    const found = CLINICAL_SERVICES.find((s) => s.id === serviceId);
    if (found) {
      this._selectedCategory.set(found.category);
      this._selectedServiceId.set(found.id);
    }
  }

  selectCategoryForBooking(category: CareCategory): void {
    this._selectedCategory.set(category);
    const firstInCategory = CLINICAL_SERVICES.find((s) => s.category === category);
    if (firstInCategory) {
      this._selectedServiceId.set(firstInCategory.id);
    }
  }

  submitBooking(
    input: Omit<CreateBookingInput, 'existingBookings'>,
  ): BookingCreationResult {
    const result = createBookingRecord({
      ...input,
      existingBookings: this._bookings(),
    });
    if (result.ok) {
      this.persist([result.booking, ...this._bookings()]);
    }
    return result;
  }

  reschedule(
    bookingId: string,
    newDateIso: string,
    newTimeSlot: string,
  ): {readonly ok: boolean; readonly error?: string} {
    const outcome = rescheduleBookingRecord(
      this._bookings(),
      bookingId,
      newDateIso,
      newTimeSlot,
    );
    if (outcome.ok) {
      this.persist(outcome.bookings);
    }
    return {ok: outcome.ok, error: outcome.error};
  }

  cancel(bookingId: string): void {
    const updated = cancelBookingRecord(this._bookings(), bookingId);
    this.persist(updated);
  }
}
