import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {HOSPITAL_PROFILE, VISITORS_BACKDROP_SLIDES} from '../core/hospital-data';
import {BackgroundSlideshow} from '../shared/background-slideshow';
import {HospitalMap} from '../shared/hospital-map';

type ChecklistTab = 'surgery' | 'diagnostic' | 'maternity';

@Component({
  selector: 'app-patients-visitors-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackgroundSlideshow, HospitalMap, MatIconModule, RouterLink],
  template: `
    <app-background-slideshow
      [slides]="backdropSlides"
      [activeSlideId]="selectedBackdropId()"
    >
      <main class="min-h-screen pt-16 sm:pt-24 pb-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <!-- Page Header + Interactive Waiting Room / Lobby / Driveway / Garage Backdrop Selector -->
          <section class="rounded-2xl bg-white/90 border border-white/80 p-8 sm:p-10 shadow-md space-y-5">
            <div class="max-w-3xl space-y-3">
              <p class="text-sm font-medium text-teal-800">
                Patients, Visitors &amp; Campus Arrival · Ogbor Hill, Aba
              </p>
              <h1 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F2942]">
                Lobby, Waiting Lounge, Driveway &amp; Visitor Directions
              </h1>
              <p class="text-base text-slate-600 leading-relaxed">
                Essential information on arriving at Jonex Hospital’s covered driveway and parking bays on Ebenma Street, step-free lobby access, interactive directions across Aba, and pre-appointment checklists.
              </p>
            </div>

            <div class="pt-3 border-t border-slate-200/80 space-y-2">
              <p class="text-xs font-semibold text-slate-700">
                Preview Campus Arrival Areas in the Background Tour:
              </p>
              <div class="flex flex-wrap gap-2">
                @for (slide of backdropSlides; track slide.id) {
                  <button
                    type="button"
                    (click)="focusCampusArea(slide.id)"
                    class="px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                    [class]="selectedBackdropId() === slide.id
                      ? 'bg-[#0F2942] text-white border-[#0F2942]'
                      : 'bg-white/90 text-slate-700 border-slate-200 hover:border-teal-700'"
                  >
                    {{ slide.caption }}
                  </button>
                }
              </div>
            </div>
          </section>

          <!-- Interactive Google Map Navigation Section -->
          <section id="directions" class="space-y-4">
            <app-hospital-map />
          </section>

          <!-- Location, Hours, Accessibility & Payments -->
          <section class="rounded-2xl bg-white/92 border border-white/80 p-6 sm:p-8 shadow-md">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <article class="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
                <div class="flex items-center gap-2 text-[#0F2942]">
                  <mat-icon class="!text-[22px] !w-[22px] !h-[22px] text-teal-700">location_on</mat-icon>
                  <h2 class="font-display text-lg font-bold">Hospital Address &amp; Registry</h2>
                </div>
                <p class="text-sm text-slate-700 leading-relaxed">
                  <strong>Primary Clinical Campus:</strong><br />
                  {{ hospital.primaryAddress }}
                </p>
                <p class="text-xs text-slate-500 leading-relaxed">
                  <strong>Corporate Registry Address:</strong><br />
                  {{ hospital.corporateRegistryAddress }} ({{ hospital.legalName }} · {{ hospital.cacRegistration }})
                </p>
              </article>

              <article class="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
                <div class="flex items-center gap-2 text-[#0F2942]">
                  <mat-icon class="!text-[22px] !w-[22px] !h-[22px] text-teal-700">schedule</mat-icon>
                  <h2 class="font-display text-lg font-bold">Operating Hours &amp; Phone</h2>
                </div>
                <p class="text-sm font-semibold text-slate-900">{{ hospital.hoursPrimary }}</p>
                <p class="text-sm text-slate-600 leading-relaxed">{{ hospital.hoursClinicNote }}</p>
                <a
                  [href]="hospital.phoneHref"
                  class="inline-flex items-center gap-2 text-sm font-mono font-semibold text-[#0F2942] hover:text-teal-700 pt-1"
                >
                  <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">call</mat-icon>
                  <span>{{ hospital.phoneDisplay }}</span>
                </a>
              </article>

              <article class="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
                <div class="flex items-center gap-2 text-[#0F2942]">
                  <mat-icon class="!text-[22px] !w-[22px] !h-[22px] text-teal-700">accessible</mat-icon>
                  <h2 class="font-display text-lg font-bold">Accessibility, Billing &amp; Languages</h2>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">{{ hospital.accessibility }}</p>
                <p class="text-sm text-slate-700 leading-relaxed">
                  <strong>Payments &amp; Languages:</strong> Credit, debit, and NFC mobile payments accepted · Staffed in <strong>English &amp; Igbo</strong>.
                </p>
              </article>
            </div>
          </section>

          <!-- Interactive Pre-Visit Preparation Checklists -->
          <section class="rounded-2xl border border-white/80 bg-white/93 p-6 sm:p-8 shadow-md space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <h2 class="font-display text-2xl font-bold text-[#0F2942]">
                  Pre-Appointment Preparation Checklists
                </h2>
                <p class="text-sm text-slate-600">
                  Follow these steps before arriving at Ebenma Street for a smooth clinical intake.
                </p>
              </div>

              <div class="inline-flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg self-start">
                <button
                  type="button"
                  (click)="activeChecklist.set('surgery')"
                  class="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors"
                  [class]="activeChecklist() === 'surgery' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-slate-900'"
                >
                  Surgery Prep
                </button>
                <button
                  type="button"
                  (click)="activeChecklist.set('diagnostic')"
                  class="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors"
                  [class]="activeChecklist() === 'diagnostic' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-slate-900'"
                >
                  Lab &amp; Diagnostic Prep
                </button>
                <button
                  type="button"
                  (click)="activeChecklist.set('maternity')"
                  class="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors"
                  [class]="activeChecklist() === 'maternity' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-slate-900'"
                >
                  Maternity &amp; Checkups
                </button>
              </div>
            </div>

            @switch (activeChecklist()) {
              @case ('surgery') {
                <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">1. Medical History &amp; Prior Imaging</strong>
                    Bring prior ultrasound films, X-rays, blood group results, and a written list of daily medications.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">2. Upfront Estimate Review</strong>
                    Request your itemized surgical, anesthesia, and inpatient medication quote during your pre-op consultation.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">3. Fasting Guidelines</strong>
                    If scheduled for a procedure under anesthesia, observe strict nil-by-mouth instructions given by Dr. Nwosu.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">4. Escort &amp; Discharge Support</strong>
                    Arrange a trusted family member or support companion for post-operative discharge transport.
                  </li>
                </ul>
              }
              @case ('diagnostic') {
                <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">1. Confirm On-Site vs. Partner Lab Scope</strong>
                    Call {{ hospital.phoneDisplay }} prior to specialized imaging or complex pathology panels to verify same-day on-site readiness.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">2. Overnight Fasting (8–10 Hours)</strong>
                    For fasting blood glucose or lipid panels, consume only plain water from 10:00 PM the evening prior.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">3. Cardiac ECG Preparation</strong>
                    Avoid coffee, energy drinks, or heavy exercise for 2 hours prior to a resting 12-lead ECG.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">4. Results Turnaround</strong>
                    Provide an active email and phone number at registration for prompt physician review of test results.
                  </li>
                </ul>
              }
              @case ('maternity') {
                <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">1. Antenatal &amp; Immunization Cards</strong>
                    Bring existing antenatal clinic cards or childhood immunization booklets for accurate continuity of care.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">2. Visitor &amp; Ward Etiquette</strong>
                    One designated support companion is welcome during consultations; keep inpatient corridors calm and smoke-free.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">3. Pharmacy &amp; Prescriptions</strong>
                    Confirm specific prescription availability with the nursing station or our Ogbor Hill front desk before departure.
                  </li>
                  <li class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <strong class="block text-[#0F2942] mb-1">4. Arrive 15 Minutes Early</strong>
                    Allow time for vitals triage, registration, and step-free parking access.
                  </li>
                </ul>
              }
            }

            <div class="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <p class="text-sm text-slate-600">
                Questions about visiting hours, inpatient admissions, or HMO/card billing?
              </p>
              <a
                routerLink="/appointments"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors"
              >
                <span>Schedule Your Visit Online</span>
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">arrow_forward</mat-icon>
              </a>
            </div>
          </section>
        </div>
      </main>
    </app-background-slideshow>
  `,
})
export class PatientsVisitorsPage {
  readonly hospital = HOSPITAL_PROFILE;
  readonly backdropSlides = VISITORS_BACKDROP_SLIDES;
  readonly activeChecklist = signal<ChecklistTab>('surgery');
  readonly selectedBackdropId = signal<string | null>(null);

  focusCampusArea(slideId: string): void {
    this.selectedBackdropId.set(slideId);
  }
}
