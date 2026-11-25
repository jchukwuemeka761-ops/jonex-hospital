import {isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {BookingStore} from '../core/booking-store';
import {
  BookingRecord,
  generateAvailableDays,
  getTimeSlotsForService,
  VisitMode,
} from '../core/booking.logic';
import {
  APPOINTMENTS_BACKDROP_SLIDES,
  CareCategory,
  CLINICAL_SERVICES,
  ClinicalService,
  DOCTOR_PROFILES,
  DoctorProfile,
  HOSPITAL_PROFILE,
  PaymentMethod,
} from '../core/hospital-data';
import {BackgroundSlideshow} from '../shared/background-slideshow';

interface CategoryOption {
  readonly id: CareCategory;
  readonly label: string;
  readonly description: string;
}

@Component({
  selector: 'app-appointments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackgroundSlideshow, ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <app-background-slideshow [slides]="backdropSlides">
      <main class="min-h-screen pt-16 sm:pt-24 pb-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <!-- Page Header -->
          <section class="rounded-2xl bg-white/90 border border-white/80 p-8 sm:p-10 shadow-md">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div class="space-y-2.5 max-w-2xl">
                <p class="text-sm font-medium text-teal-800">
                  Jonex Hospital Live Scheduling Center · Ogbor Hill, Aba
                </p>
                <h1 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F2942]">
                  Book a Surgery Consult, Checkup, or Diagnostic Test
                </h1>
                <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
                  New and returning patients can reserve sessions online in real time without creating an account. Prefer phone assistance? Call
                  <a [href]="hospital.phoneHref" class="font-mono font-semibold text-[#0F2942] underline underline-offset-4">{{ hospital.phoneDisplay }}</a>.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Appointment portal sections"
                class="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg self-start"
              >
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="activeView() === 'book'"
                  (click)="setActiveView('book')"
                  class="px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
                  [class]="activeView() === 'book' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-slate-900'"
                >
                  Book New Session
                </button>
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="activeView() === 'manage'"
                  (click)="setActiveView('manage')"
                  class="px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap tabular-nums"
                  [class]="activeView() === 'manage' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-slate-900'"
                >
                  My Bookings ({{ store.activeBookingsCount() }})
                </button>
              </div>
            </div>
          </section>

          @if (activeView() === 'book') {
            <section>
              @if (confirmedBooking(); as receipt) {
                <!-- Booking Confirmation Receipt -->
                <div class="max-w-3xl mx-auto rounded-2xl bg-white/95 border border-slate-200 p-8 space-y-8 shadow-md" data-testid="booking-confirmation">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div class="flex items-start gap-3">
                      <mat-icon class="!text-[32px] !w-[32px] !h-[32px] text-teal-700 shrink-0">verified</mat-icon>
                      <div>
                        <p class="text-xs font-medium text-teal-800">Appointment Confirmed</p>
                        <h2 class="font-display text-2xl font-bold text-[#0F2942]">
                          Your Session Is Reserved
                        </h2>
                      </div>
                    </div>
                    <div class="text-left sm:text-right">
                      <p class="text-xs text-slate-500">Booking Reference</p>
                      <p class="font-mono text-lg font-bold text-[#0F2942] tabular-nums">{{ receipt.referenceCode }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div class="space-y-1">
                      <p class="text-xs text-slate-500">Clinical Service</p>
                      <p class="font-semibold text-slate-900">{{ receipt.serviceTitle }}</p>
                      <p class="text-slate-600">{{ receipt.department }} · {{ receipt.specialistName }}</p>
                    </div>
                    <div class="space-y-1">
                      <p class="text-xs text-slate-500">Scheduled Date &amp; Time</p>
                      <p class="font-semibold text-slate-900 tabular-nums">{{ receipt.dateIso }} at {{ receipt.timeSlot }}</p>
                      <p class="text-slate-600">{{ receipt.visitMode }}</p>
                    </div>
                    <div class="space-y-1">
                      <p class="text-xs text-slate-500">Patient Details</p>
                      <p class="font-semibold text-slate-900">{{ receipt.patientName }}</p>
                      <p class="text-slate-600 font-mono tabular-nums">{{ receipt.patientPhone }} · {{ receipt.patientEmail }}</p>
                    </div>
                    <div class="space-y-1">
                      <p class="text-xs text-slate-500">Billing &amp; Estimate</p>
                      <p class="font-semibold text-slate-900 tabular-nums">{{ receipt.feeRangeNgn }}</p>
                      <p class="text-slate-600">Method: {{ receipt.paymentMethod }}</p>
                    </div>
                  </div>

                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
                    <p class="font-semibold text-[#0F2942]">Pre-Visit Preparation &amp; Arrival Instructions</p>
                    <p class="text-slate-600 leading-relaxed">{{ receipt.preVisitNote }}</p>
                    <p class="text-xs text-slate-500 pt-1">
                      Location: {{ hospital.primaryAddress }}. Wheelchair-accessible entry available at main portico.
                    </p>
                  </div>

                  <div class="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      (click)="setActiveView('manage')"
                      class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors"
                    >
                      <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">list_alt</mat-icon>
                      <span>View in My Bookings</span>
                    </button>
                    <button
                      type="button"
                      (click)="startAnotherBooking()"
                      class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0F2942] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">add</mat-icon>
                      <span>Book Another Session</span>
                    </button>
                  </div>
                </div>
              } @else {
                <!-- Structured 2-Column Booking Studio -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div class="lg:col-span-8 rounded-2xl bg-white/93 border border-white/80 p-6 sm:p-8 space-y-10 shadow-md">
                    <!-- Selected Doctor Banner if chosen from Find a Doctor -->
                    @if (selectedDoctor(); as doc) {
                      <div class="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="space-y-0.5">
                          <p class="text-xs font-medium text-teal-800">Preferred Specialist Selected</p>
                          <p class="font-display text-sm font-bold text-[#0F2942]">
                            {{ doc.name }} · {{ doc.specialty }} ({{ doc.languages.join(' / ') }})
                          </p>
                        </div>
                        <button
                          type="button"
                          (click)="clearSelectedDoctor()"
                          class="text-xs font-semibold text-slate-600 hover:text-slate-900 underline self-start sm:self-center"
                        >
                          Use Department Default
                        </button>
                      </div>
                    }

                    <!-- Step 1: Select Care Category & Specific Service -->
                    <div class="space-y-5">
                      <div class="space-y-1">
                        <p class="text-xs font-medium text-teal-800">Step 1 of 3</p>
                        <h2 class="font-display text-xl font-bold text-[#0F2942]">
                          Choose Department &amp; Clinical Session
                        </h2>
                      </div>

                      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        @for (cat of categoryOptions; track cat.id) {
                          <button
                            type="button"
                            (click)="selectCategory(cat.id)"
                            class="px-3 py-2.5 text-left rounded-lg border transition-colors"
                            [class]="selectedCategory() === cat.id
                              ? 'bg-[#0F2942] text-white border-[#0F2942]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'"
                          >
                            <p class="text-xs font-semibold truncate">{{ cat.label }}</p>
                          </button>
                        }
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        @for (service of categoryServices(); track service.id) {
                          <button
                            type="button"
                            (click)="selectService(service)"
                            class="text-left p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3"
                            [class]="selectedService().id === service.id
                              ? 'border-teal-700 bg-teal-50/60'
                              : 'border-slate-200 bg-white hover:border-slate-300'"
                          >
                            <div class="space-y-1.5">
                              <div class="flex items-center justify-between gap-2 text-xs text-slate-500">
                                <span>{{ service.department }}</span>
                                <span class="font-mono tabular-nums text-slate-700">{{ service.durationMinutes }} min</span>
                              </div>
                              <p class="font-display text-sm font-bold text-[#0F2942]">{{ service.title }}</p>
                              <p class="text-xs text-slate-600 line-clamp-2">{{ service.summary }}</p>
                            </div>
                            <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span class="font-mono font-medium text-slate-800 tabular-nums">{{ service.feeRangeNgn }}</span>
                              <span class="font-semibold text-teal-800">
                                {{ selectedService().id === service.id ? 'Selected' : 'Select' }}
                              </span>
                            </div>
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Step 2: Select Date, Time Slot & Visit Mode -->
                    <div class="space-y-5 pt-8 border-t border-slate-200">
                      <div class="space-y-1">
                        <p class="text-xs font-medium text-teal-800">Step 2 of 3</p>
                        <h2 class="font-display text-xl font-bold text-[#0F2942]">
                          Select Date &amp; Available Time Slot
                        </h2>
                      </div>

                      <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        @for (day of availableDays; track day.dateIso) {
                          <button
                            type="button"
                            (click)="selectDate(day.dateIso)"
                            class="p-2.5 rounded-lg border text-center transition-colors"
                            [class]="selectedDateIso() === day.dateIso
                              ? 'bg-[#0F2942] text-white border-[#0F2942]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'"
                          >
                            <p class="text-[11px] opacity-80">{{ day.dayShort }}</p>
                            <p class="text-xs font-semibold tabular-nums mt-0.5">{{ day.dateLabel }}</p>
                          </button>
                        }
                      </div>

                      <div class="space-y-2">
                        <p class="text-xs font-medium text-slate-600">
                          Available windows for {{ selectedService().title }} on {{ selectedDateIso() }}
                        </p>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          @for (slot of timeSlots(); track slot.time) {
                            <button
                              type="button"
                              [disabled]="!slot.available"
                              (click)="selectTimeSlot(slot.time)"
                              class="px-3 py-2.5 rounded-lg border text-sm font-mono tabular-nums transition-colors flex items-center justify-between"
                              [class]="!slot.available
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : selectedTimeSlot() === slot.time
                                  ? 'bg-teal-800 text-white border-teal-800 font-semibold'
                                  : 'bg-white text-slate-800 border-slate-200 hover:border-teal-700'"
                            >
                              <span>{{ slot.time }}</span>
                              <span class="text-[11px] font-sans">
                                {{ slot.available ? (selectedTimeSlot() === slot.time ? 'Selected' : 'Open') : 'Booked' }}
                              </span>
                            </button>
                          }
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        @for (mode of visitModes; track mode) {
                          <button
                            type="button"
                            (click)="selectVisitMode(mode)"
                            class="p-3.5 rounded-lg border text-left transition-colors flex items-center justify-between"
                            [class]="selectedVisitMode() === mode
                              ? 'border-teal-700 bg-teal-50/50 text-[#0F2942]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
                          >
                            <span class="text-sm font-medium">{{ mode }}</span>
                            <mat-icon class="!text-[18px] !w-[18px] !h-[18px] text-teal-700">
                              {{ selectedVisitMode() === mode ? 'radio_button_checked' : 'radio_button_unchecked' }}
                            </mat-icon>
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Step 3: Patient Intake & Payment Preference Form -->
                    <form
                      [formGroup]="bookingForm"
                      (ngSubmit)="submitBooking()"
                      class="space-y-5 pt-8 border-t border-slate-200"
                      novalidate
                    >
                      <div class="space-y-1">
                        <p class="text-xs font-medium text-teal-800">Step 3 of 3</p>
                        <h2 class="font-display text-xl font-bold text-[#0F2942]">
                          Patient Information &amp; Billing Preference
                        </h2>
                      </div>

                      @if (submissionErrors().length > 0) {
                        <div
                          role="alert"
                          class="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 space-y-1"
                        >
                          <p class="font-semibold">Please review the following before confirming:</p>
                          <ul class="list-disc pl-5 space-y-0.5">
                            @for (err of submissionErrors(); track err) {
                              <li>{{ err }}</li>
                            }
                          </ul>
                        </div>
                      }

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                          <label for="patientName" class="block text-sm font-medium text-slate-800">
                            Patient Full Name <span class="text-red-600">*</span>
                          </label>
                          <input
                            id="patientName"
                            type="text"
                            formControlName="patientName"
                            placeholder="e.g. Chidinma Okafor"
                            class="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        </div>

                        <div class="space-y-1.5">
                          <label for="patientPhone" class="block text-sm font-medium text-slate-800">
                            Phone Number <span class="text-red-600">*</span>
                          </label>
                          <input
                            id="patientPhone"
                            type="tel"
                            formControlName="patientPhone"
                            placeholder="+234 807 801 6691"
                            class="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        </div>

                        <div class="space-y-1.5">
                          <label for="patientEmail" class="block text-sm font-medium text-slate-800">
                            Email Address <span class="text-red-600">*</span>
                          </label>
                          <input
                            id="patientEmail"
                            type="email"
                            formControlName="patientEmail"
                            placeholder="name@example.com"
                            class="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        </div>

                        <div class="space-y-1.5">
                          <label for="ageGroup" class="block text-sm font-medium text-slate-800">
                            Patient Age Group
                          </label>
                          <select
                            id="ageGroup"
                            formControlName="ageGroup"
                            class="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          >
                            <option value="Adult (18–64)">Adult (18–64)</option>
                            <option value="Senior (65+)">Senior (65+)</option>
                            <option value="Pediatric (0–17)">Pediatric (0–17)</option>
                          </select>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <label for="paymentMethod" class="block text-sm font-medium text-slate-800">
                          Preferred Payment Method at Hospital Desk
                        </label>
                        <select
                          id="paymentMethod"
                          formControlName="paymentMethod"
                          class="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                        >
                          @for (pm of paymentMethods; track pm) {
                            <option [value]="pm">{{ pm }}</option>
                          }
                        </select>
                      </div>

                      <div class="space-y-1.5">
                        <label for="clinicalNotes" class="block text-sm font-medium text-slate-800">
                          Symptoms, Referral Notes, or Accessibility Request (Optional)
                        </label>
                        <textarea
                          id="clinicalNotes"
                          rows="3"
                          formControlName="clinicalNotes"
                          placeholder="Share relevant symptoms, current medications, or wheelchair assistance needs..."
                          class="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                        ></textarea>
                      </div>

                      <div class="pt-2">
                        <button
                          type="submit"
                          class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        >
                          <mat-icon class="!text-[20px] !w-[20px] !h-[20px]">check_circle</mat-icon>
                          <span>Confirm Appointment</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  <!-- Sticky Clinical Summary Sidebar (Clean, Non-Repeating) -->
                  <aside class="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl bg-white/93 border border-white/80 p-6 space-y-5 shadow-md">
                    <div class="flex items-start justify-between gap-3">
                      <div class="space-y-1">
                        <p class="text-xs font-medium text-teal-800">{{ selectedService().department }}</p>
                        <h3 class="font-display text-lg font-bold text-[#0F2942]">
                          {{ selectedService().title }}
                        </h3>
                        <p class="text-xs text-slate-600">
                          {{ activeSpecialistDisplay() }}
                        </p>
                      </div>
                      <mat-icon class="!text-[26px] !w-[26px] !h-[26px] text-teal-800 shrink-0">assignment_turned_in</mat-icon>
                    </div>

                    <dl class="space-y-2.5 text-sm pt-3 border-t border-slate-200">
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-slate-500">Selected Date</dt>
                        <dd class="font-mono font-semibold text-slate-900 tabular-nums">{{ selectedDateIso() }}</dd>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-slate-500">Time Window</dt>
                        <dd class="font-mono font-semibold text-slate-900 tabular-nums">
                          {{ selectedTimeSlot() || 'Select slot' }}
                        </dd>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-slate-500">Session Length</dt>
                        <dd class="font-mono text-slate-800 tabular-nums">{{ selectedService().durationMinutes }} mins</dd>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-slate-500">Estimated Fee</dt>
                        <dd class="font-mono font-semibold text-[#0F2942] tabular-nums">{{ selectedService().feeRangeNgn }}</dd>
                      </div>
                    </dl>

                    <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
                      <p class="font-semibold text-slate-900">Clinical Prep &amp; Capability Note</p>
                      <p>{{ selectedService().preVisitNote }}</p>
                    </div>

                    <div class="pt-1 space-y-2 text-xs text-slate-500">
                      <p>
                        Need urgent 24/7 emergency triage? Call
                        <a [href]="hospital.phoneHref" class="font-mono font-semibold text-[#0F2942] underline">{{ hospital.phoneDisplay }}</a> before arrival.
                      </p>
                      <a routerLink="/patients-and-visitors" class="inline-flex items-center gap-1 font-semibold text-teal-800 hover:underline">
                        <span>View Map Directions &amp; Arrival Guide</span>
                        <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">arrow_forward</mat-icon>
                      </a>
                    </div>
                  </aside>
                </div>
              }
            </section>
          } @else {
            <!-- Manage Existing Appointments View -->
            <section class="max-w-5xl mx-auto rounded-2xl bg-white/93 border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 class="font-display text-2xl font-bold text-[#0F2942]">
                    Scheduled &amp; Past Patient Bookings
                  </h2>
                  <p class="text-sm text-slate-600">
                    Bookings are stored securely in your browser so you can review, reschedule, or cancel anytime.
                  </p>
                </div>
                <button
                  type="button"
                  (click)="setActiveView('book')"
                  class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors self-start"
                >
                  <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">add</mat-icon>
                  <span>New Appointment</span>
                </button>
              </div>

              @if (manageFeedback()) {
                <div class="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-sm text-teal-900">
                  {{ manageFeedback() }}
                </div>
              }

              @if (store.bookings().length === 0) {
                <div class="p-10 rounded-xl border border-slate-200 text-center space-y-3">
                  <p class="font-display text-lg font-semibold text-slate-900">No Appointments Scheduled</p>
                  <p class="text-sm text-slate-600">Book a surgical consultation, checkup, or diagnostic session to see it listed here.</p>
                  <button
                    type="button"
                    (click)="setActiveView('book')"
                    class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2942] rounded-lg"
                  >
                    Book Now
                  </button>
                </div>
              } @else {
                <div class="space-y-4" data-testid="bookings-list">
                  @for (item of store.bookings(); track item.id) {
                    <article class="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div class="space-y-1">
                          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span class="font-mono font-semibold text-[#0F2942]">{{ item.referenceCode }}</span>
                            <span aria-hidden="true">·</span>
                            <span>{{ item.department }}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              class="font-semibold"
                              [class]="item.status === 'Cancelled' ? 'text-red-700' : 'text-teal-800'"
                            >
                              {{ item.status }}
                            </span>
                          </div>
                          <h3 class="font-display text-lg font-bold text-[#0F2942]">
                            {{ item.serviceTitle }}
                          </h3>
                          <p class="text-sm text-slate-600">
                            Patient: <span class="font-medium text-slate-900">{{ item.patientName }}</span> ·
                            <span class="font-mono tabular-nums">{{ item.dateIso }} at {{ item.timeSlot }}</span> ·
                            {{ item.specialistName }}
                          </p>
                        </div>

                        @if (item.status !== 'Cancelled') {
                          <div class="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              (click)="toggleReschedule(item)"
                              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F2942] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                            >
                              <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">edit_calendar</mat-icon>
                              <span>Reschedule</span>
                            </button>
                            <button
                              type="button"
                              (click)="cancelAppointment(item)"
                              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                            >
                              <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">close</mat-icon>
                              <span>Cancel</span>
                            </button>
                          </div>
                        }
                      </div>

                      @if (reschedulingId() === item.id) {
                        <div class="pt-4 border-t border-slate-200 space-y-3">
                          <p class="text-xs font-semibold text-slate-700">Choose a new date and open time window:</p>
                          <div class="flex flex-wrap items-center gap-2">
                            @for (day of availableDays; track day.dateIso) {
                              <button
                                type="button"
                                (click)="rescheduleDate.set(day.dateIso)"
                                class="px-3 py-1.5 text-xs rounded-md border tabular-nums"
                                [class]="rescheduleDate() === day.dateIso
                                  ? 'bg-[#0F2942] text-white border-[#0F2942]'
                                  : 'bg-white text-slate-700 border-slate-200'"
                              >
                                {{ day.dayShort }} ({{ day.dateLabel }})
                              </button>
                            }
                          </div>
                          <div class="flex flex-wrap items-center gap-2">
                            @for (slot of getSlotsForExisting(item); track slot.time) {
                              <button
                                type="button"
                                [disabled]="!slot.available"
                                (click)="confirmReschedule(item.id, slot.time)"
                                class="px-3 py-1.5 text-xs font-mono rounded-md border tabular-nums"
                                [class]="slot.available
                                  ? 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-800 hover:text-white'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'"
                              >
                                {{ slot.time }}
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </article>
                  }
                </div>
              }
            </section>
          }
        </div>
      </main>
    </app-background-slideshow>
  `,
})
export class AppointmentsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  readonly store = inject(BookingStore);
  readonly hospital = HOSPITAL_PROFILE;
  readonly backdropSlides = APPOINTMENTS_BACKDROP_SLIDES;

  readonly availableDays = generateAvailableDays(new Date(), 8);
  readonly visitModes: readonly VisitMode[] = [
    'In-Person at Ogbor Hill',
    'Pre-Visit Phone Triage',
  ];
  readonly paymentMethods: readonly PaymentMethod[] = [
    'Credit or Debit Card',
    'NFC Mobile Payment',
    'Front Desk Settlement',
  ];

  readonly categoryOptions: readonly CategoryOption[] = [
    {id: 'surgery', label: 'Surgery', description: 'General surgery & pre-op'},
    {id: 'checkup', label: 'Checkups', description: 'Physicals & general medicine'},
    {id: 'diagnostic', label: 'Diagnostics', description: 'Blood lab & ECG screening'},
    {id: 'maternity', label: 'Maternity & Kids', description: 'OB/GYN & pediatrics'},
    {id: 'specialty', label: 'Specialty', description: 'Cardiology & dental'},
  ];

  readonly activeView = signal<'book' | 'manage'>('book');
  readonly selectedCategory = signal<CareCategory>(this.store.selectedCategory());
  readonly selectedService = signal<ClinicalService>(
    CLINICAL_SERVICES.find((s) => s.id === this.store.selectedServiceId()) ?? CLINICAL_SERVICES[3],
  );
  readonly selectedDoctor = signal<DoctorProfile | null>(null);
  readonly selectedDateIso = signal<string>(this.availableDays[1]?.dateIso ?? this.availableDays[0].dateIso);
  readonly selectedTimeSlot = signal<string>('');
  readonly selectedVisitMode = signal<VisitMode>('In-Person at Ogbor Hill');

  readonly submissionErrors = signal<readonly string[]>([]);
  readonly confirmedBooking = signal<BookingRecord | null>(null);

  readonly reschedulingId = signal<string | null>(null);
  readonly rescheduleDate = signal<string>(this.availableDays[2]?.dateIso ?? this.availableDays[0].dateIso);
  readonly manageFeedback = signal<string>('');

  readonly bookingForm = new FormGroup({
    patientName: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    patientPhone: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    patientEmail: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    ageGroup: new FormControl('Adult (18–64)', {nonNullable: true}),
    paymentMethod: new FormControl<PaymentMethod>('Credit or Debit Card', {nonNullable: true}),
    clinicalNotes: new FormControl('', {nonNullable: true}),
  });

  readonly categoryServices = computed(() =>
    CLINICAL_SERVICES.filter((s) => s.category === this.selectedCategory()),
  );

  readonly activeSpecialistDisplay = computed(() => {
    const doc = this.selectedDoctor();
    if (doc) {
      return `${doc.name} · ${doc.role}`;
    }
    return `${this.selectedService().specialistName} · ${this.selectedService().specialistRole}`;
  });

  readonly timeSlots = computed(() =>
    getTimeSlotsForService(
      this.selectedService().id,
      this.selectedService().category,
      this.selectedDateIso(),
      this.store.bookings(),
    ),
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const tabParam = params.get('tab');
      if (tabParam === 'manage') {
        this.activeView.set('manage');
      }

      const doctorParam = params.get('doctor');
      if (doctorParam) {
        const matchedDoc = DOCTOR_PROFILES.find((d) => d.id === doctorParam) ?? null;
        this.selectedDoctor.set(matchedDoc);
        if (matchedDoc) {
          const docService = CLINICAL_SERVICES.find((s) => s.id === matchedDoc.primaryServiceId);
          if (docService) {
            this.selectedCategory.set(docService.category);
            this.selectedService.set(docService);
          }
        }
      }

      const serviceParam = params.get('service');
      const categoryParam = params.get('category') as CareCategory | null;

      if (serviceParam) {
        const found = CLINICAL_SERVICES.find((s) => s.id === serviceParam);
        if (found) {
          this.selectedCategory.set(found.category);
          this.selectedService.set(found);
        }
      } else if (
        !doctorParam &&
        categoryParam &&
        this.categoryOptions.some((c) => c.id === categoryParam)
      ) {
        this.selectCategory(categoryParam);
      }
      this.pickFirstOpenSlot();
    });
  }

  clearSelectedDoctor(): void {
    this.selectedDoctor.set(null);
  }

  setActiveView(view: 'book' | 'manage'): void {
    this.activeView.set(view);
    this.manageFeedback.set('');
  }

  selectCategory(category: CareCategory): void {
    this.selectedCategory.set(category);
    const first = CLINICAL_SERVICES.find((s) => s.category === category);
    if (first) {
      this.selectedService.set(first);
    }
    this.pickFirstOpenSlot();
  }

  selectService(service: ClinicalService): void {
    this.selectedService.set(service);
    this.pickFirstOpenSlot();
  }

  selectDate(dateIso: string): void {
    this.selectedDateIso.set(dateIso);
    this.pickFirstOpenSlot();
  }

  selectTimeSlot(time: string): void {
    this.selectedTimeSlot.set(time);
  }

  selectVisitMode(mode: VisitMode): void {
    this.selectedVisitMode.set(mode);
  }

  private pickFirstOpenSlot(): void {
    const firstOpen = this.timeSlots().find((s) => s.available);
    this.selectedTimeSlot.set(firstOpen ? firstOpen.time : '');
  }

  submitBooking(): void {
    this.submissionErrors.set([]);
    const raw = this.bookingForm.getRawValue();
    const baseService = this.selectedService();
    const doc = this.selectedDoctor();
    const effectiveService: ClinicalService = doc
      ? {...baseService, specialistName: doc.name, specialistRole: doc.role}
      : baseService;

    const result = this.store.submitBooking({
      service: effectiveService,
      dateIso: this.selectedDateIso(),
      timeSlot: this.selectedTimeSlot(),
      visitMode: this.selectedVisitMode(),
      patientName: raw.patientName,
      patientPhone: raw.patientPhone,
      patientEmail: raw.patientEmail,
      ageGroup: raw.ageGroup,
      paymentMethod: raw.paymentMethod,
      clinicalNotes: raw.clinicalNotes,
    });

    if (!result.ok) {
      this.submissionErrors.set(result.errors);
      return;
    }

    this.confirmedBooking.set(result.booking);
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
    this.bookingForm.reset({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      ageGroup: 'Adult (18–64)',
      paymentMethod: 'Credit or Debit Card',
      clinicalNotes: '',
    });
  }

  startAnotherBooking(): void {
    this.confirmedBooking.set(null);
    this.submissionErrors.set([]);
    this.pickFirstOpenSlot();
  }

  toggleReschedule(item: BookingRecord): void {
    if (this.reschedulingId() === item.id) {
      this.reschedulingId.set(null);
      return;
    }
    this.reschedulingId.set(item.id);
    this.rescheduleDate.set(this.availableDays[2]?.dateIso ?? item.dateIso);
  }

  getSlotsForExisting(item: BookingRecord) {
    return getTimeSlotsForService(
      item.serviceId,
      item.category,
      this.rescheduleDate(),
      this.store.bookings(),
    );
  }

  confirmReschedule(bookingId: string, timeSlot: string): void {
    const outcome = this.store.reschedule(bookingId, this.rescheduleDate(), timeSlot);
    if (outcome.ok) {
      this.reschedulingId.set(null);
      this.manageFeedback.set(`Appointment updated to ${this.rescheduleDate()} at ${timeSlot}.`);
    } else if (outcome.error) {
      this.manageFeedback.set(outcome.error);
    }
  }

  cancelAppointment(item: BookingRecord): void {
    this.store.cancel(item.id);
    if (this.reschedulingId() === item.id) {
      this.reschedulingId.set(null);
    }
    this.manageFeedback.set(`Appointment ${item.referenceCode} has been cancelled.`);
  }
}
