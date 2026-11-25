import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {Router, RouterLink} from '@angular/router';
import {BookingStore} from '../core/booking-store';
import {filterDoctors, filterServices} from '../core/booking.logic';
import {
  CareCategory,
  CLINICAL_SERVICES,
  ClinicalService,
  DOCTOR_PROFILES,
  DoctorProfile,
  EXECUTIVE_DIRECTORS,
  FACILITY_FACTS,
  HERO_IMAGE,
  HOME_BACKDROP_SLIDES,
  HOSPITAL_PROFILE,
  PATIENT_REVIEWS,
} from '../core/hospital-data';
import {BackgroundSlideshow} from '../shared/background-slideshow';
import {HospitalMap} from '../shared/hospital-map';

interface CategoryTab {
  readonly id: CareCategory | 'all';
  readonly label: string;
}

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackgroundSlideshow, HospitalMap, RouterLink, MatIconModule],
  template: `
    <app-background-slideshow [slides]="backdropSlides">
      <main class="text-slate-900 pt-14 sm:pt-20 pb-24 space-y-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <!-- Hero Section: Architectural Card + Distinct Hospital Exterior Photo -->
          <section class="rounded-2xl bg-white/90 border border-white/80 p-6 sm:p-10 shadow-md">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              <div class="lg:col-span-6 flex flex-col justify-between space-y-8">
                <div class="space-y-5">
                  <p class="text-sm font-medium text-teal-800 tracking-tight">
                    Ogbor Hill, Aba · Ebenma Street · Open 24 Hours
                  </p>

                  <h1
                    class="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#0F2942] leading-[1.1] max-w-xl"
                    style="text-wrap: balance;"
                  >
                    Clinical, Surgical &amp; Diagnostic Care Built Around Aba Families
                  </h1>

                  <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                    Backed by {{ hospital.bedsCount }} beds, {{ hospital.doctorsCount }} doctors, and {{ hospital.accreditation }} standards, Jonex Hospital delivers general surgery, checkups, maternity care, and diagnostic testing 24 hours a day.
                  </p>
                </div>

                <div class="space-y-6">
                  <div class="flex flex-wrap items-center gap-4">
                    <a
                      routerLink="/appointments"
                      class="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <mat-icon class="!text-[20px] !w-[20px] !h-[20px]">event_available</mat-icon>
                      <span>Book an Appointment</span>
                    </a>

                    <a
                      [href]="hospital.phoneHref"
                      class="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#0F2942] bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">call</mat-icon>
                      <span class="font-mono tabular-nums">{{ hospital.phoneDisplay }}</span>
                    </a>
                  </div>

                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-200">
                    <span class="whitespace-nowrap">{{ hospital.bedsCount }} Beds · {{ hospital.doctorsCount }} Doctors</span>
                    <span aria-hidden="true">·</span>
                    <span class="whitespace-nowrap">{{ hospital.accreditation }}</span>
                    <span aria-hidden="true">·</span>
                    <span class="whitespace-nowrap">English &amp; Igbo</span>
                    <span aria-hidden="true">·</span>
                    <span class="whitespace-nowrap">Est. 1994</span>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-6 flex flex-col">
                <figure class="relative flex-1 min-h-[290px] sm:min-h-[360px] lg:min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    [src]="heroImage.src"
                    [alt]="heroImage.alt"
                    referrerpolicy="no-referrer"
                    class="w-full h-full object-cover"
                  />
                  <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent px-5 py-4 text-white">
                    <p class="text-sm font-semibold">499P+27M, Ebenma Street, Ogbor Hill, Aba</p>
                    <p class="text-xs text-slate-200 mt-0.5">
                      Step-free main arrival ramp, card &amp; NFC contactless reception desk, 24/7 clinical intake
                    </p>
                  </figcaption>
                </figure>
              </div>
            </div>

            <!-- 4-Column Quick Booking Strip -->
            <div class="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                (click)="bookCategory('surgery')"
                class="group text-left p-5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 hover:border-teal-700 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <div class="flex items-center justify-between text-[#0F2942]">
                  <span class="text-xs font-medium text-teal-800">01. Surgical Care</span>
                  <mat-icon class="!text-[20px] !w-[20px] !h-[20px] text-slate-400 group-hover:text-teal-700 transition-colors">arrow_forward</mat-icon>
                </div>
                <p class="font-display text-base font-semibold text-slate-900 mt-2">
                  Schedule Surgery Consult
                </p>
                <p class="text-sm text-slate-600 mt-1">
                  General surgery, pre-op anesthesia review &amp; orthopedic evaluation.
                </p>
              </button>

              <button
                type="button"
                (click)="bookCategory('checkup')"
                class="group text-left p-5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 hover:border-teal-700 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <div class="flex items-center justify-between text-[#0F2942]">
                  <span class="text-xs font-medium text-teal-800">02. Primary &amp; Internal</span>
                  <mat-icon class="!text-[20px] !w-[20px] !h-[20px] text-slate-400 group-hover:text-teal-700 transition-colors">arrow_forward</mat-icon>
                </div>
                <p class="font-display text-base font-semibold text-slate-900 mt-2">
                  Book Medical Checkup
                </p>
                <p class="text-sm text-slate-600 mt-1">
                  Adult annual physicals, internal medicine &amp; same-day GP visits.
                </p>
              </button>

              <button
                type="button"
                (click)="bookCategory('diagnostic')"
                class="group text-left p-5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 hover:border-teal-700 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <div class="flex items-center justify-between text-[#0F2942]">
                  <span class="text-xs font-medium text-teal-800">03. Lab &amp; Screening</span>
                  <mat-icon class="!text-[20px] !w-[20px] !h-[20px] text-slate-400 group-hover:text-teal-700 transition-colors">arrow_forward</mat-icon>
                </div>
                <p class="font-display text-base font-semibold text-slate-900 mt-2">
                  Reserve Diagnostic Tests
                </p>
                <p class="text-sm text-slate-600 mt-1">
                  Blood panels, cardiac ECG, and ultrasound coordination.
                </p>
              </button>

              <button
                type="button"
                (click)="bookCategory('maternity')"
                class="group text-left p-5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 hover:border-teal-700 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <div class="flex items-center justify-between text-[#0F2942]">
                  <span class="text-xs font-medium text-teal-800">04. Family Health</span>
                  <mat-icon class="!text-[20px] !w-[20px] !h-[20px] text-slate-400 group-hover:text-teal-700 transition-colors">arrow_forward</mat-icon>
                </div>
                <p class="font-display text-base font-semibold text-slate-900 mt-2">
                  Maternity &amp; Pediatrics
                </p>
                <p class="text-sm text-slate-600 mt-1">
                  Obstetrics, antenatal care, child wellness &amp; immunizations.
                </p>
              </button>
            </div>
          </section>

          <!-- Hospital Quick Facts Strip -->
          <section class="rounded-2xl bg-white/90 border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div class="space-y-1">
                <p class="text-xs font-medium text-teal-800">Verified Institutional Profile</p>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#0F2942]">
                  Hospital Quick Facts &amp; Clinical Capacity
                </h2>
              </div>
              <a
                routerLink="/services"
                class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2942] hover:text-teal-700 whitespace-nowrap"
              >
                <span>Tour Lab, Reception &amp; Labor Wings</span>
                <mat-icon class="!text-[17px] !w-[17px] !h-[17px]">arrow_forward</mat-icon>
              </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (fact of facilityFacts; track fact.label) {
                <div class="p-5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <p class="text-xs font-medium text-slate-500">{{ fact.label }}</p>
                  <p class="font-display text-2xl font-bold text-[#0F2942] tabular-nums">{{ fact.value }}</p>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">{{ fact.detail }}</p>
                </div>
              }
            </div>
          </section>

          <!-- Organized Hub: Find a Doctor & Book a Session / Appointment -->
          <section id="find-care" class="rounded-2xl bg-white/92 border border-white/80 p-6 sm:p-8 shadow-md space-y-8">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <p class="text-xs font-medium text-teal-800">Organized Patient Access Hub</p>
                <h2 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2942]">
                  Find a Doctor &amp; Book a Session or Appointment
                </h2>
              </div>

              <!-- Primary Hub Mode Switcher -->
              <div class="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg self-start">
                <button
                  type="button"
                  (click)="hubMode.set('doctors')"
                  class="px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
                  [class]="hubMode() === 'doctors' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-slate-900'"
                >
                  Find a Doctor ({{ doctorsCountLabel }})
                </button>
                <button
                  type="button"
                  (click)="hubMode.set('sessions')"
                  class="px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
                  [class]="hubMode() === 'sessions' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-slate-900'"
                >
                  Book a Session by Service
                </button>
              </div>
            </div>

            @if (hubMode() === 'doctors') {
              <div class="space-y-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="relative w-full md:max-w-sm">
                    <label for="homeDoctorSearch" class="sr-only">Search doctors by name or specialty</label>
                    <mat-icon class="!text-[19px] !w-[19px] !h-[19px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">search</mat-icon>
                    <input
                      id="homeDoctorSearch"
                      type="search"
                      [value]="doctorSearchQuery()"
                      (input)="onDoctorSearch($event)"
                      placeholder="Search Dr. Eleweke, surgery, OB/GYN..."
                      class="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <div class="inline-flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
                      @for (lang of languageOptions; track lang) {
                        <button
                          type="button"
                          (click)="doctorLanguage.set(lang)"
                          class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                          [class]="doctorLanguage() === lang ? 'bg-teal-800 text-white' : 'text-slate-600 hover:text-slate-900'"
                        >
                          {{ lang === 'all' ? 'All Languages' : lang }}
                        </button>
                      }
                    </div>
                    <a
                      routerLink="/doctors"
                      class="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2942] hover:text-teal-700 px-3 py-2"
                    >
                      <span>Full Specialist Directory</span>
                      <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">arrow_forward</mat-icon>
                    </a>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  @for (doc of featuredDoctors(); track doc.id) {
                    <article class="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
                      <div class="space-y-2">
                        <p class="text-xs font-medium text-teal-800">{{ doc.specialty }}</p>
                        <h3 class="font-display text-base font-bold text-[#0F2942]">{{ doc.name }}</h3>
                        <p class="text-xs text-slate-500">{{ doc.credentials }}</p>
                        <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">{{ doc.bio }}</p>
                        <p class="text-[11px] font-medium text-slate-500 pt-1">
                          Languages: {{ doc.languages.join(' · ') }}
                        </p>
                      </div>

                      <button
                        type="button"
                        (click)="bookWithDoctor(doc)"
                        class="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors"
                      >
                        <mat-icon class="!text-[15px] !w-[15px] !h-[15px]">calendar_month</mat-icon>
                        <span>Book Session</span>
                      </button>
                    </article>
                  }
                </div>
              </div>
            } @else {
              <div class="space-y-6">
                <div
                  role="tablist"
                  aria-label="Filter clinical services by department"
                  class="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg"
                >
                  @for (tab of tabs; track tab.id) {
                    <button
                      type="button"
                      role="tab"
                      [attr.aria-selected]="activeTab() === tab.id"
                      (click)="setTab(tab.id)"
                      class="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
                      [class]="activeTab() === tab.id
                        ? 'bg-[#0F2942] text-white'
                        : 'text-slate-600 hover:text-slate-900'"
                    >
                      {{ tab.label }}
                    </button>
                  }
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (service of visibleServices(); track service.id) {
                    <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between gap-5">
                      <div class="space-y-2">
                        <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span class="font-medium text-teal-800">{{ service.department }}</span>
                          <span aria-hidden="true">·</span>
                          <span class="tabular-nums">{{ service.durationMinutes }} min session</span>
                          <span aria-hidden="true">·</span>
                          <span class="font-mono tabular-nums text-slate-700">{{ service.feeRangeNgn }}</span>
                        </div>

                        <h3 class="font-display text-lg font-bold text-[#0F2942]">
                          {{ service.title }}
                        </h3>

                        <p class="text-sm text-slate-600 leading-relaxed">
                          {{ service.summary }}
                        </p>

                        <p class="text-xs text-slate-500 pt-1">
                          Lead Clinician: <span class="font-medium text-slate-700">{{ service.specialistName }}</span> · {{ service.specialistRole }}
                        </p>
                      </div>

                      <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <span class="text-xs text-slate-500">
                          {{ service.confirmOnSiteByPhone ? 'On-site readiness confirmed by desk' : 'Direct online slot confirmation' }}
                        </span>

                        <button
                          type="button"
                          (click)="bookService(service)"
                          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">calendar_month</mat-icon>
                          <span>Book Session</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </section>

          <!-- About Us, Vision & Mission, Quality, Specialities & Executive Board of Directors -->
          <section id="about" class="rounded-2xl bg-white/92 border border-white/80 p-6 sm:p-10 shadow-md space-y-10">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div class="lg:col-span-6 space-y-4">
                <p class="text-xs font-medium text-teal-800">
                  About Jonex Hospital · {{ hospital.legalName }} ({{ hospital.cacRegistration }})
                </p>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#0F2942]">
                  Trusted Aba Healthcare Since {{ hospital.incorporatedDate }}
                </h2>
                <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {{ hospital.aboutUs }}
                </p>
                <p class="text-sm text-slate-600 leading-relaxed">
                  <strong class="text-[#0F2942]">Clinical Quality Standard:</strong> {{ hospital.qualityStandard }}
                </p>

                <div class="pt-2 space-y-2">
                  <p class="text-xs font-semibold text-[#0F2942]">Medical &amp; Surgical Specialities</p>
                  <p class="text-sm text-slate-700 leading-relaxed">
                    {{ hospital.specialtiesList.join(' · ') }}
                  </p>
                </div>
              </div>

              <div class="lg:col-span-6 grid grid-cols-1 gap-4">
                <article class="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p class="text-xs font-semibold text-teal-800">Our Vision</p>
                  <p class="font-display text-lg font-bold text-[#0F2942] leading-snug">
                    “{{ hospital.vision }}”
                  </p>
                </article>

                <article class="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p class="text-xs font-semibold text-teal-800">Our Mission</p>
                  <p class="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {{ hospital.mission }}
                  </p>
                </article>

                <article class="p-5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                  <div>
                    <p class="font-semibold text-[#0F2942]">Corporate Affairs Commission (CAC) Verified</p>
                    <p>Registration {{ hospital.cacRegistration }} · Corporate Office: {{ hospital.corporateRegistryAddress }}</p>
                  </div>
                  <span class="font-mono font-bold text-[#0F2942]">{{ hospital.accreditation }}</span>
                </article>
              </div>
            </div>

            <!-- Executive Board of Directors -->
            <div class="pt-8 border-t border-slate-200 space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p class="text-xs font-medium text-teal-800">Executive Leadership</p>
                  <h3 class="font-display text-2xl font-bold text-[#0F2942]">
                    Board of Directors · Jonex Hospitals Ltd
                  </h3>
                </div>
                <p class="text-xs text-slate-500">
                  Front Desk &amp; Operational Inquiries: {{ hospital.phoneDisplay }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                @for (director of directors; track director.id) {
                  <article class="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <p class="text-xs font-medium text-teal-800">{{ director.role }}</p>
                    <h4 class="font-display text-base font-bold text-[#0F2942]">{{ director.name }}</h4>
                    <p class="text-xs text-slate-500">{{ director.credential }}</p>
                    <p class="text-xs text-slate-600 leading-relaxed pt-1">{{ director.focus }}</p>
                  </article>
                }
              </div>
            </div>
          </section>

          <!-- Interactive Google Maps Navigation Section -->
          <section id="directions" class="space-y-4">
            <div class="rounded-2xl bg-[#0F2942]/94 text-white p-6 sm:p-8 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <p class="text-xs font-medium text-teal-300">How to Get to Jonex Hospital</p>
                <h2 class="font-display text-2xl font-bold">
                  Map Navigation &amp; Directions in Aba
                </h2>
              </div>
              <a
                routerLink="/patients-and-visitors"
                class="inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-lg transition-colors self-start sm:self-center"
              >
                <span>Open Arrival, Parking &amp; Lobby Tour</span>
                <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">arrow_forward</mat-icon>
              </a>
            </div>
            <app-hospital-map />
          </section>

          <!-- Patient Accountability Reviews + Final CTA -->
          <section class="rounded-2xl bg-white/92 border border-white/80 p-6 sm:p-8 shadow-md space-y-8">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div class="space-y-1">
                <p class="text-xs font-medium text-teal-800">Community Feedback &amp; Transparency</p>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#0F2942]">
                  What Aba Patients Say About Jonex Hospital
                </h2>
              </div>
              <p class="text-sm text-slate-600 tabular-nums">
                4.4 out of 5 stars across 9 public reviews
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (review of reviews; track review.id) {
                <article class="p-6 rounded-xl bg-white border border-slate-200 flex flex-col justify-between gap-4">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-xs text-slate-500">
                      <span class="font-semibold text-[#0F2942] tabular-nums">{{ review.rating }}.0 / 5.0</span>
                      <span>{{ review.dateLabel }}</span>
                    </div>
                    <p class="text-sm text-slate-700 leading-relaxed">“{{ review.comment }}”</p>
                  </div>
                  <div class="pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <p class="font-semibold text-slate-900">{{ review.author }}</p>
                    <p>{{ review.visitType }}</p>
                  </div>
                </article>
              }
            </div>

            <div class="rounded-xl bg-[#0F2942] text-white p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <p class="text-xs font-medium text-teal-300">Direct Patient Scheduling · Ogbor Hill, Aba</p>
                <h3 class="font-display text-2xl font-bold">
                  Ready to Book Your Consultation, Surgery Review, or Diagnostic Test?
                </h3>
                <p class="text-sm text-slate-200 leading-relaxed">
                  Reserve an exact appointment time online or speak directly with our 24/7 clinical desk on {{ hospital.phoneDisplay }}.
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  routerLink="/appointments"
                  class="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F2942] bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">event_available</mat-icon>
                  <span>Book Appointment</span>
                </a>
                <a
                  routerLink="/doctors"
                  class="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white border border-white/25 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Browse Doctors</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </app-background-slideshow>
  `,
})
export class HomePage {
  private readonly router = inject(Router);
  private readonly store = inject(BookingStore);

  readonly hospital = HOSPITAL_PROFILE;
  readonly heroImage = HERO_IMAGE;
  readonly backdropSlides = HOME_BACKDROP_SLIDES;
  readonly directors = EXECUTIVE_DIRECTORS;
  readonly reviews = PATIENT_REVIEWS;
  readonly facilityFacts = FACILITY_FACTS;
  readonly doctorsCountLabel = `${DOCTOR_PROFILES.length} Featured · ${HOSPITAL_PROFILE.doctorsCount} Staff`;

  readonly hubMode = signal<'doctors' | 'sessions'>('doctors');
  readonly doctorLanguage = signal<string>('all');
  readonly doctorSearchQuery = signal<string>('');
  readonly languageOptions: readonly string[] = ['all', 'English', 'Igbo'];

  readonly tabs: readonly CategoryTab[] = [
    {id: 'all', label: 'All Services'},
    {id: 'surgery', label: 'Surgery'},
    {id: 'checkup', label: 'Checkups'},
    {id: 'diagnostic', label: 'Diagnostic Tests'},
    {id: 'maternity', label: 'Maternity & Pediatrics'},
  ];

  readonly activeTab = signal<CareCategory | 'all'>('all');

  readonly featuredDoctors = computed(() =>
    filterDoctors(
      DOCTOR_PROFILES,
      'all',
      this.doctorLanguage(),
      this.doctorSearchQuery(),
    ).slice(0, 8),
  );

  readonly visibleServices = computed(() => {
    const filtered = filterServices(CLINICAL_SERVICES, this.activeTab(), '');
    return this.activeTab() === 'all' ? filtered.slice(0, 6) : filtered;
  });

  onDoctorSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.doctorSearchQuery.set(input.value);
  }

  setTab(tab: CareCategory | 'all'): void {
    this.activeTab.set(tab);
  }

  bookCategory(category: CareCategory): void {
    this.store.selectCategoryForBooking(category);
    this.router.navigate(['/appointments'], {queryParams: {category}});
  }

  bookService(service: ClinicalService): void {
    this.store.selectServiceForBooking(service.id);
    this.router.navigate(['/appointments'], {queryParams: {service: service.id}});
  }

  bookWithDoctor(doc: DoctorProfile): void {
    this.store.selectServiceForBooking(doc.primaryServiceId);
    this.router.navigate(['/appointments'], {
      queryParams: {service: doc.primaryServiceId, doctor: doc.id},
    });
  }
}
