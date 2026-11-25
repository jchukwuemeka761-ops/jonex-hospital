import {
  ArrowRight,
  BadgeCheck,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Plus,
  X,
} from 'lucide-react';
import {useMemo, useState, type FormEvent} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {BackgroundSlideshow} from '../components/BackgroundSlideshow.tsx';
import {useBookings} from '../core/BookingContext.tsx';
import {
  generateAvailableDays,
  getTimeSlotsForService,
  type BookingRecord,
  type VisitMode,
} from '../core/booking.logic.ts';
import {
  APPOINTMENTS_BACKDROP_SLIDES,
  CLINICAL_SERVICES,
  DOCTOR_PROFILES,
  HOSPITAL_PROFILE,
  type CareCategory,
  type ClinicalService,
  type DoctorProfile,
  type PaymentMethod,
} from '../core/hospital-data.ts';

interface CategoryOption {
  readonly id: CareCategory;
  readonly label: string;
}

const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  {id: 'surgery', label: 'Surgery'},
  {id: 'checkup', label: 'Checkups'},
  {id: 'diagnostic', label: 'Diagnostics'},
  {id: 'maternity', label: 'Maternity & Kids'},
  {id: 'specialty', label: 'Specialty'},
];

const VISIT_MODES: readonly VisitMode[] = [
  'In-Person at Ogbor Hill',
  'Pre-Visit Phone Triage',
];

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'Credit or Debit Card',
  'NFC Mobile Payment',
  'Front Desk Settlement',
];

function resolveInitialSelection(
  searchParams: URLSearchParams,
  storeCategory: CareCategory,
  storeServiceId: string,
): {
  readonly view: 'book' | 'manage';
  readonly doctor: DoctorProfile | null;
  readonly category: CareCategory;
  readonly service: ClinicalService;
} {
  const tabParam = searchParams.get('tab');
  const view: 'book' | 'manage' = tabParam === 'manage' ? 'manage' : 'book';

  const doctorParam = searchParams.get('doctor');
  const serviceParam = searchParams.get('service');
  const categoryParam = searchParams.get('category') as CareCategory | null;

  const matchedDoc = doctorParam
    ? DOCTOR_PROFILES.find((d) => d.id === doctorParam) ?? null
    : null;

  let service =
    CLINICAL_SERVICES.find((s) => s.id === storeServiceId) ?? CLINICAL_SERVICES[3];
  let category: CareCategory = storeCategory;

  if (matchedDoc) {
    const docService = CLINICAL_SERVICES.find((s) => s.id === matchedDoc.primaryServiceId);
    if (docService) {
      service = docService;
      category = docService.category;
    }
  }

  if (serviceParam) {
    const found = CLINICAL_SERVICES.find((s) => s.id === serviceParam);
    if (found) {
      service = found;
      category = found.category;
    }
  } else if (
    !matchedDoc &&
    categoryParam &&
    CATEGORY_OPTIONS.some((c) => c.id === categoryParam)
  ) {
    category = categoryParam;
    const first = CLINICAL_SERVICES.find((s) => s.category === categoryParam);
    if (first) {
      service = first;
    }
  }

  return {view, doctor: matchedDoc, category, service};
}

export function AppointmentsPage() {
  const [searchParams] = useSearchParams();
  const {
    bookings,
    activeBookingsCount,
    selectedCategory: storeCategory,
    selectedServiceId: storeServiceId,
    submitBooking,
    reschedule,
    cancel,
  } = useBookings();

  const availableDays = useMemo(() => generateAvailableDays(new Date(), 8), []);

  const [initial] = useState(() =>
    resolveInitialSelection(searchParams, storeCategory, storeServiceId),
  );

  const [activeView, setActiveView] = useState<'book' | 'manage'>(initial.view);
  const [selectedCategory, setSelectedCategory] = useState<CareCategory>(initial.category);
  const [selectedService, setSelectedService] = useState<ClinicalService>(initial.service);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(initial.doctor);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    availableDays[1]?.dateIso ?? availableDays[0].dateIso,
  );
  const [manualTimeSlot, setManualTimeSlot] = useState<string>('');
  const [selectedVisitMode, setSelectedVisitMode] = useState<VisitMode>('In-Person at Ogbor Hill');

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('Adult (18–64)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit or Debit Card');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [submissionErrors, setSubmissionErrors] = useState<readonly string[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(
    availableDays[2]?.dateIso ?? availableDays[0].dateIso,
  );
  const [manageFeedback, setManageFeedback] = useState<string>('');

  const categoryServices = useMemo(
    () => CLINICAL_SERVICES.filter((s) => s.category === selectedCategory),
    [selectedCategory],
  );

  const timeSlots = useMemo(
    () =>
      getTimeSlotsForService(
        selectedService.id,
        selectedService.category,
        selectedDateIso,
        bookings,
      ),
    [selectedService, selectedDateIso, bookings],
  );

  const selectedTimeSlot = useMemo(() => {
    if (manualTimeSlot && timeSlots.some((s) => s.time === manualTimeSlot && s.available)) {
      return manualTimeSlot;
    }
    return timeSlots.find((s) => s.available)?.time ?? '';
  }, [timeSlots, manualTimeSlot]);

  const activeSpecialistDisplay = selectedDoctor
    ? `${selectedDoctor.name} · ${selectedDoctor.role}`
    : `${selectedService.specialistName} · ${selectedService.specialistRole}`;

  const handleCategoryChange = (category: CareCategory) => {
    setSelectedCategory(category);
    const first = CLINICAL_SERVICES.find((s) => s.category === category);
    if (first) {
      setSelectedService(first);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionErrors([]);

    const effectiveService: ClinicalService = selectedDoctor
      ? {
          ...selectedService,
          specialistName: selectedDoctor.name,
          specialistRole: selectedDoctor.role,
        }
      : selectedService;

    const result = submitBooking({
      service: effectiveService,
      dateIso: selectedDateIso,
      timeSlot: selectedTimeSlot,
      visitMode: selectedVisitMode,
      patientName,
      patientPhone,
      patientEmail,
      ageGroup,
      paymentMethod,
      clinicalNotes,
    });

    if (!result.ok) {
      setSubmissionErrors(result.errors);
      return;
    }

    setConfirmedBooking(result.booking);
    window.scrollTo({top: 0, behavior: 'smooth'});
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setAgeGroup('Adult (18–64)');
    setPaymentMethod('Credit or Debit Card');
    setClinicalNotes('');
  };

  const startAnotherBooking = () => {
    setConfirmedBooking(null);
    setSubmissionErrors([]);
  };

  const toggleReschedule = (item: BookingRecord) => {
    if (reschedulingId === item.id) {
      setReschedulingId(null);
      return;
    }
    setReschedulingId(item.id);
    setRescheduleDate(availableDays[2]?.dateIso ?? item.dateIso);
  };

  const confirmReschedule = (bookingId: string, timeSlot: string) => {
    const outcome = reschedule(bookingId, rescheduleDate, timeSlot);
    if (outcome.ok) {
      setReschedulingId(null);
      setManageFeedback(`Appointment updated to ${rescheduleDate} at ${timeSlot}.`);
    } else if (outcome.error) {
      setManageFeedback(outcome.error);
    }
  };

  const handleCancel = (item: BookingRecord) => {
    cancel(item.id);
    if (reschedulingId === item.id) {
      setReschedulingId(null);
    }
    setManageFeedback(`Appointment ${item.referenceCode} has been cancelled.`);
  };

  return (
    <BackgroundSlideshow slides={APPOINTMENTS_BACKDROP_SLIDES}>
      <main className="min-h-screen pt-16 sm:pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <section className="rounded-2xl bg-white/95 border border-white/80 p-8 sm:p-10 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <p className="text-sm font-medium text-teal-800">
                  Jonex Hospital Live Scheduling Center · Ogbor Hill, Aba
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F2942]">
                  Book a Surgery Consult, Checkup, or Diagnostic Test
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  New and returning patients can reserve sessions online in real time without
                  creating an account. Prefer phone assistance? Call{' '}
                  <a
                    href={HOSPITAL_PROFILE.phoneHref}
                    className="font-mono font-semibold text-[#0F2942] underline underline-offset-4"
                  >
                    {HOSPITAL_PROFILE.phoneDisplay}
                  </a>
                  .
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Appointment portal sections"
                className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg self-start"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'book'}
                  onClick={() => {
                    setActiveView('book');
                    setManageFeedback('');
                  }}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeView === 'book'
                      ? 'bg-[#0F2942] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Book New Session
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeView === 'manage'}
                  onClick={() => {
                    setActiveView('manage');
                    setManageFeedback('');
                  }}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap tabular-nums ${
                    activeView === 'manage'
                      ? 'bg-[#0F2942] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Bookings ({activeBookingsCount})
                </button>
              </div>
            </div>
          </section>

          {activeView === 'book' ? (
            <section>
              {confirmedBooking ? (
                <div
                  className="max-w-3xl mx-auto rounded-2xl bg-white/95 border border-slate-200 p-8 space-y-8 shadow-md"
                  data-testid="booking-confirmation"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="w-8 h-8 text-teal-700 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium text-teal-800">Appointment Confirmed</p>
                        <h2 className="font-display text-2xl font-bold text-[#0F2942]">
                          Your Session Is Reserved
                        </h2>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Booking Reference</p>
                      <p className="font-mono text-lg font-bold text-[#0F2942] tabular-nums">
                        {confirmedBooking.referenceCode}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Clinical Service</p>
                      <p className="font-semibold text-slate-900">
                        {confirmedBooking.serviceTitle}
                      </p>
                      <p className="text-slate-600">
                        {confirmedBooking.department} · {confirmedBooking.specialistName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Scheduled Date &amp; Time</p>
                      <p className="font-semibold text-slate-900 tabular-nums">
                        {confirmedBooking.dateIso} at {confirmedBooking.timeSlot}
                      </p>
                      <p className="text-slate-600">{confirmedBooking.visitMode}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Patient Details</p>
                      <p className="font-semibold text-slate-900">{confirmedBooking.patientName}</p>
                      <p className="text-slate-600 font-mono tabular-nums">
                        {confirmedBooking.patientPhone} · {confirmedBooking.patientEmail}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Billing &amp; Estimate</p>
                      <p className="font-semibold text-slate-900 tabular-nums">
                        {confirmedBooking.feeRangeNgn}
                      </p>
                      <p className="text-slate-600">Method: {confirmedBooking.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
                    <p className="font-semibold text-[#0F2942]">
                      Pre-Visit Preparation &amp; Arrival Instructions
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {confirmedBooking.preVisitNote}
                    </p>
                    <p className="text-xs text-slate-500 pt-1">
                      Location: {HOSPITAL_PROFILE.primaryAddress}. Wheelchair-accessible entry
                      available at main portico.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('manage');
                        setManageFeedback('');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors"
                    >
                      <ClipboardList className="w-[18px] h-[18px]" aria-hidden="true" />
                      <span>View in My Bookings</span>
                    </button>
                    <button
                      type="button"
                      onClick={startAnotherBooking}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0F2942] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-[18px] h-[18px]" aria-hidden="true" />
                      <span>Book Another Session</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 rounded-2xl bg-white/95 border border-white/80 p-6 sm:p-8 space-y-10 shadow-md">
                    {selectedDoctor && (
                      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-teal-800">
                            Preferred Specialist Selected
                          </p>
                          <p className="font-display text-sm font-bold text-[#0F2942]">
                            {selectedDoctor.name} · {selectedDoctor.specialty} (
                            {selectedDoctor.languages.join(' / ')})
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDoctor(null)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline self-start sm:self-center"
                        >
                          Use Department Default
                        </button>
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-teal-800">Step 1 of 3</p>
                        <h2 className="font-display text-xl font-bold text-[#0F2942]">
                          Choose Department &amp; Clinical Session
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {CATEGORY_OPTIONS.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                              selectedCategory === cat.id
                                ? 'bg-[#0F2942] text-white border-[#0F2942]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <p className="text-xs font-semibold truncate">{cat.label}</p>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoryServices.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => setSelectedService(service)}
                            className={`text-left p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                              selectedService.id === service.id
                                ? 'border-teal-700 bg-teal-50/60'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                                <span>{service.department}</span>
                                <span className="font-mono tabular-nums text-slate-700">
                                  {service.durationMinutes} min
                                </span>
                              </div>
                              <p className="font-display text-sm font-bold text-[#0F2942]">
                                {service.title}
                              </p>
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {service.summary}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span className="font-mono font-medium text-slate-800 tabular-nums">
                                {service.feeRangeNgn}
                              </span>
                              <span className="font-semibold text-teal-800">
                                {selectedService.id === service.id ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5 pt-8 border-t border-slate-200">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-teal-800">Step 2 of 3</p>
                        <h2 className="font-display text-xl font-bold text-[#0F2942]">
                          Select Date &amp; Available Time Slot
                        </h2>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {availableDays.map((day) => (
                          <button
                            key={day.dateIso}
                            type="button"
                            onClick={() => setSelectedDateIso(day.dateIso)}
                            className={`p-2.5 rounded-lg border text-center transition-colors ${
                              selectedDateIso === day.dateIso
                                ? 'bg-[#0F2942] text-white border-[#0F2942]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <p className="text-[11px] opacity-80">{day.dayShort}</p>
                            <p className="text-xs font-semibold tabular-nums mt-0.5">
                              {day.dateLabel}
                            </p>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-600">
                          Available windows for {selectedService.title} on {selectedDateIso}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setManualTimeSlot(slot.time)}
                              className={`px-3 py-2.5 rounded-lg border text-sm font-mono tabular-nums transition-colors flex items-center justify-between ${
                                !slot.available
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                  : selectedTimeSlot === slot.time
                                    ? 'bg-teal-800 text-white border-teal-800 font-semibold'
                                    : 'bg-white text-slate-800 border-slate-200 hover:border-teal-700'
                              }`}
                            >
                              <span>{slot.time}</span>
                              <span className="text-[11px] font-sans">
                                {slot.available
                                  ? selectedTimeSlot === slot.time
                                    ? 'Selected'
                                    : 'Open'
                                  : 'Booked'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {VISIT_MODES.map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setSelectedVisitMode(mode)}
                            className={`p-3.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                              selectedVisitMode === mode
                                ? 'border-teal-700 bg-teal-50/50 text-[#0F2942]'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-sm font-medium">{mode}</span>
                            <span
                              aria-hidden="true"
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedVisitMode === mode ? 'border-teal-700' : 'border-slate-400'
                              }`}
                            >
                              {selectedVisitMode === mode && (
                                <span className="w-2 h-2 rounded-full bg-teal-700" />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5 pt-8 border-t border-slate-200"
                      noValidate
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-teal-800">Step 3 of 3</p>
                        <h2 className="font-display text-xl font-bold text-[#0F2942]">
                          Patient Information &amp; Billing Preference
                        </h2>
                      </div>

                      {submissionErrors.length > 0 && (
                        <div
                          role="alert"
                          className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 space-y-1"
                        >
                          <p className="font-semibold">
                            Please review the following before confirming:
                          </p>
                          <ul className="list-disc pl-5 space-y-0.5">
                            {submissionErrors.map((err) => (
                              <li key={err}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="patientName"
                            className="block text-sm font-medium text-slate-800"
                          >
                            Patient Full Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="patientName"
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="e.g. Chidinma Okafor"
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="patientPhone"
                            className="block text-sm font-medium text-slate-800"
                          >
                            Phone Number <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="patientPhone"
                            type="tel"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            placeholder="+234 807 801 6691"
                            className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="patientEmail"
                            className="block text-sm font-medium text-slate-800"
                          >
                            Email Address <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="patientEmail"
                            type="email"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="ageGroup"
                            className="block text-sm font-medium text-slate-800"
                          >
                            Patient Age Group
                          </label>
                          <select
                            id="ageGroup"
                            value={ageGroup}
                            onChange={(e) => setAgeGroup(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          >
                            <option value="Adult (18–64)">Adult (18–64)</option>
                            <option value="Senior (65+)">Senior (65+)</option>
                            <option value="Pediatric (0–17)">Pediatric (0–17)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="paymentMethod"
                          className="block text-sm font-medium text-slate-800"
                        >
                          Preferred Payment Method at Hospital Desk
                        </label>
                        <select
                          id="paymentMethod"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                        >
                          {PAYMENT_METHODS.map((pm) => (
                            <option key={pm} value={pm}>
                              {pm}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="clinicalNotes"
                          className="block text-sm font-medium text-slate-800"
                        >
                          Symptoms, Referral Notes, or Accessibility Request (Optional)
                        </label>
                        <textarea
                          id="clinicalNotes"
                          rows={3}
                          value={clinicalNotes}
                          onChange={(e) => setClinicalNotes(e.target.value)}
                          placeholder="Share relevant symptoms, current medications, or wheelchair assistance needs..."
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        >
                          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                          <span>Confirm Appointment</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  <aside className="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl bg-white/95 border border-white/80 p-6 space-y-5 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-teal-800">
                          {selectedService.department}
                        </p>
                        <h3 className="font-display text-lg font-bold text-[#0F2942]">
                          {selectedService.title}
                        </h3>
                        <p className="text-xs text-slate-600">{activeSpecialistDisplay}</p>
                      </div>
                      <ClipboardCheck
                        className="w-6 h-6 text-teal-800 shrink-0"
                        aria-hidden="true"
                      />
                    </div>

                    <dl className="space-y-2.5 text-sm pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Selected Date</dt>
                        <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                          {selectedDateIso}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Time Window</dt>
                        <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                          {selectedTimeSlot || 'Select slot'}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Session Length</dt>
                        <dd className="font-mono text-slate-800 tabular-nums">
                          {selectedService.durationMinutes} mins
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Estimated Fee</dt>
                        <dd className="font-mono font-semibold text-[#0F2942] tabular-nums">
                          {selectedService.feeRangeNgn}
                        </dd>
                      </div>
                    </dl>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
                      <p className="font-semibold text-slate-900">
                        Clinical Prep &amp; Capability Note
                      </p>
                      <p>{selectedService.preVisitNote}</p>
                    </div>

                    <div className="pt-1 space-y-2 text-xs text-slate-500">
                      <p>
                        Need urgent 24/7 emergency triage? Call{' '}
                        <a
                          href={HOSPITAL_PROFILE.phoneHref}
                          className="font-mono font-semibold text-[#0F2942] underline"
                        >
                          {HOSPITAL_PROFILE.phoneDisplay}
                        </a>{' '}
                        before arrival.
                      </p>
                      <Link
                        to="/patients-and-visitors"
                        className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:underline"
                      >
                        <span>View Map Directions &amp; Arrival Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </aside>
                </div>
              )}
            </section>
          ) : (
            <section className="max-w-5xl mx-auto rounded-2xl bg-white/95 border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#0F2942]">
                    Scheduled &amp; Past Patient Bookings
                  </h2>
                  <p className="text-sm text-slate-600">
                    Bookings are stored securely in your browser so you can review, reschedule, or
                    cancel anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('book');
                    setManageFeedback('');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors self-start"
                >
                  <Plus className="w-[18px] h-[18px]" aria-hidden="true" />
                  <span>New Appointment</span>
                </button>
              </div>

              {manageFeedback && (
                <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-sm text-teal-900">
                  {manageFeedback}
                </div>
              )}

              {bookings.length === 0 ? (
                <div className="p-10 rounded-xl border border-slate-200 text-center space-y-3">
                  <p className="font-display text-lg font-semibold text-slate-900">
                    No Appointments Scheduled
                  </p>
                  <p className="text-sm text-slate-600">
                    Book a surgical consultation, checkup, or diagnostic session to see it listed
                    here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView('book')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2942] rounded-lg"
                  >
                    Book Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4" data-testid="bookings-list">
                  {bookings.map((item) => {
                    const rescheduleSlots =
                      reschedulingId === item.id
                        ? getTimeSlotsForService(
                            item.serviceId,
                            item.category,
                            rescheduleDate,
                            bookings,
                          )
                        : [];

                    return (
                      <article
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-mono font-semibold text-[#0F2942]">
                                {item.referenceCode}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.department}</span>
                              <span aria-hidden="true">·</span>
                              <span
                                className={`font-semibold ${
                                  item.status === 'Cancelled' ? 'text-red-700' : 'text-teal-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <h3 className="font-display text-lg font-bold text-[#0F2942]">
                              {item.serviceTitle}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Patient:{' '}
                              <span className="font-medium text-slate-900">{item.patientName}</span>{' '}
                              ·{' '}
                              <span className="font-mono tabular-nums">
                                {item.dateIso} at {item.timeSlot}
                              </span>{' '}
                              · {item.specialistName}
                            </p>
                          </div>

                          {item.status !== 'Cancelled' && (
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleReschedule(item)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F2942] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                              >
                                <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                                <span>Reschedule</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancel(item)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" aria-hidden="true" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {reschedulingId === item.id && (
                          <div className="pt-4 border-t border-slate-200 space-y-3">
                            <p className="text-xs font-semibold text-slate-700">
                              Choose a new date and open time window:
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {availableDays.map((day) => (
                                <button
                                  key={day.dateIso}
                                  type="button"
                                  onClick={() => setRescheduleDate(day.dateIso)}
                                  className={`px-3 py-1.5 text-xs rounded-md border tabular-nums ${
                                    rescheduleDate === day.dateIso
                                      ? 'bg-[#0F2942] text-white border-[#0F2942]'
                                      : 'bg-white text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {day.dayShort} ({day.dateLabel})
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {rescheduleSlots.map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={!slot.available}
                                  onClick={() => confirmReschedule(item.id, slot.time)}
                                  className={`px-3 py-1.5 text-xs font-mono rounded-md border tabular-nums ${
                                    slot.available
                                      ? 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-800 hover:text-white'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </BackgroundSlideshow>
  );
}
