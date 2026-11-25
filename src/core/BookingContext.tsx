import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  cancelBookingRecord,
  createBookingRecord,
  rescheduleBookingRecord,
  toIsoDateString,
  type BookingCreationResult,
  type BookingRecord,
  type CreateBookingInput,
} from './booking.logic.ts';
import {CLINICAL_SERVICES, type CareCategory} from './hospital-data.ts';

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

function loadInitialBookings(): readonly BookingRecord[] {
  if (typeof window === 'undefined') {
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
    // Fallback safely if localStorage is restricted
  }
  return buildSeedBookings();
}

export interface BookingContextValue {
  readonly bookings: readonly BookingRecord[];
  readonly activeBookingsCount: number;
  readonly selectedCategory: CareCategory;
  readonly selectedServiceId: string;
  readonly selectServiceForBooking: (serviceId: string) => void;
  readonly selectCategoryForBooking: (category: CareCategory) => void;
  readonly submitBooking: (
    input: Omit<CreateBookingInput, 'existingBookings'>,
  ) => BookingCreationResult;
  readonly reschedule: (
    bookingId: string,
    newDateIso: string,
    newTimeSlot: string,
  ) => {readonly ok: boolean; readonly error?: string};
  readonly cancel: (bookingId: string) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({children}: {children: ReactNode}) {
  const [bookings, setBookings] = useState<readonly BookingRecord[]>(loadInitialBookings);
  const [selectedCategory, setSelectedCategory] = useState<CareCategory>('checkup');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('chk-annual-physical');

  const persist = useCallback((records: readonly BookingRecord[]) => {
    setBookings(records);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, []);

  const selectServiceForBooking = useCallback((serviceId: string) => {
    const found = CLINICAL_SERVICES.find((s) => s.id === serviceId);
    if (found) {
      setSelectedCategory(found.category);
      setSelectedServiceId(found.id);
    }
  }, []);

  const selectCategoryForBooking = useCallback((category: CareCategory) => {
    setSelectedCategory(category);
    const first = CLINICAL_SERVICES.find((s) => s.category === category);
    if (first) {
      setSelectedServiceId(first.id);
    }
  }, []);

  const submitBooking = useCallback(
    (input: Omit<CreateBookingInput, 'existingBookings'>): BookingCreationResult => {
      const result = createBookingRecord({
        ...input,
        existingBookings: bookings,
      });
      if (result.ok) {
        persist([result.booking, ...bookings]);
      }
      return result;
    },
    [bookings, persist],
  );

  const reschedule = useCallback(
    (
      bookingId: string,
      newDateIso: string,
      newTimeSlot: string,
    ): {readonly ok: boolean; readonly error?: string} => {
      const outcome = rescheduleBookingRecord(bookings, bookingId, newDateIso, newTimeSlot);
      if (outcome.ok) {
        persist(outcome.bookings);
      }
      return {ok: outcome.ok, error: outcome.error};
    },
    [bookings, persist],
  );

  const cancel = useCallback(
    (bookingId: string) => {
      const updated = cancelBookingRecord(bookings, bookingId);
      persist(updated);
    },
    [bookings, persist],
  );

  const activeBookingsCount = useMemo(
    () => bookings.filter((b) => b.status !== 'Cancelled').length,
    [bookings],
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      bookings,
      activeBookingsCount,
      selectedCategory,
      selectedServiceId,
      selectServiceForBooking,
      selectCategoryForBooking,
      submitBooking,
      reschedule,
      cancel,
    }),
    [
      bookings,
      activeBookingsCount,
      selectedCategory,
      selectedServiceId,
      selectServiceForBooking,
      selectCategoryForBooking,
      submitBooking,
      reschedule,
      cancel,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookings must be used within a BookingProvider.');
  }
  return ctx;
}
