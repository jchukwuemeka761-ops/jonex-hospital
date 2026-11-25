import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {Router, RouterLink} from '@angular/router';
import {BookingStore} from '../core/booking-store';
import {filterDoctors} from '../core/booking.logic';
import {
  CareCategory,
  DOCTOR_PROFILES,
  DoctorProfile,
  DOCTORS_BACKDROP_SLIDES,
  EXECUTIVE_DIRECTORS,
  HOSPITAL_PROFILE,
} from '../core/hospital-data';
import {BackgroundSlideshow} from '../shared/background-slideshow';

@Component({
  selector: 'app-doctors-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackgroundSlideshow, MatIconModule, RouterLink],
  template: `
    <app-background-slideshow [slides]="backdropSlides">
      <main class="min-h-screen pt-20 sm:pt-28 pb-24 space-y-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <!-- Page Header Glass Container -->
          <section class="rounded-2xl bg-white/90 border border-white/80 p-8 sm:p-10 shadow-md">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div class="max-w-3xl space-y-3">
                <p class="text-sm font-medium text-teal-800">
                  {{ hospital.doctorsCount }} Medical Doctors · {{ hospital.accreditation }} · English &amp; Igbo
                </p>
                <h1 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F2942]">
                  Find a Doctor &amp; Book a Clinical Session
                </h1>
                <p class="text-base text-slate-600 leading-relaxed">
                  Browse Jonex Hospital’s consultant surgeons, internal medicine physicians, obstetricians, pediatricians, cardiologists, and visiting specialists in Ogbor Hill, Aba. Select any physician to reserve a dedicated appointment window.
                </p>
              </div>

              <a
                routerLink="/appointments"
                class="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start"
              >
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">event_available</mat-icon>
                <span>Open Booking Portal</span>
              </a>
            </div>
          </section>

          <!-- Search & Multi-Filter Control Strip + Specialist Cards -->
          <section class="rounded-2xl bg-white/92 border border-white/80 p-6 sm:p-8 shadow-md space-y-8">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="relative w-full lg:max-w-sm">
                <label for="doctorSearchPage" class="sr-only">Search doctors by name or specialty</label>
                <mat-icon class="!text-[20px] !w-[20px] !h-[20px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</mat-icon>
                <input
                  id="doctorSearchPage"
                  type="search"
                  [value]="searchQuery()"
                  (input)="onSearchInput($event)"
                  placeholder="Search Eleweke, surgery, cardiology, Igbo..."
                  class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  @for (cat of categories; track cat.id) {
                    <button
                      type="button"
                      (click)="selectedCategory.set(cat.id)"
                      class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                      [class]="selectedCategory() === cat.id
                        ? 'bg-[#0F2942] text-white'
                        : 'text-slate-600 hover:text-slate-900'"
                    >
                      {{ cat.label }}
                    </button>
                  }
                </div>

                <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  @for (lang of languageFilters; track lang) {
                    <button
                      type="button"
                      (click)="selectedLanguage.set(lang)"
                      class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                      [class]="selectedLanguage() === lang
                        ? 'bg-teal-800 text-white'
                        : 'text-slate-600 hover:text-slate-900'"
                    >
                      {{ lang === 'all' ? 'All Languages' : lang }}
                    </button>
                  }
                </div>
              </div>
            </div>

            @if (filteredDoctors().length === 0) {
              <div class="p-10 rounded-xl border border-slate-200 bg-white text-center space-y-3">
                <p class="font-display text-lg font-semibold text-slate-900">No Matching Doctors Found</p>
                <p class="text-sm text-slate-600">Reset filters or call our nursing desk at {{ hospital.phoneDisplay }} for on-call specialist schedules.</p>
                <button
                  type="button"
                  (click)="resetFilters()"
                  class="px-4 py-2 text-sm font-semibold text-white bg-[#0F2942] rounded-lg"
                >
                  Show All Specialists
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (doc of filteredDoctors(); track doc.id) {
                  <article class="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-5">
                    <div class="space-y-3">
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <p class="text-xs font-medium text-teal-800">{{ doc.specialty }}</p>
                          <h2 class="font-display text-xl font-bold text-[#0F2942] mt-0.5">{{ doc.name }}</h2>
                          <p class="text-xs text-slate-500 mt-0.5">{{ doc.credentials }} · {{ doc.role }}</p>
                        </div>
                        <mat-icon class="!text-[28px] !w-[28px] !h-[28px] text-[#0F2942]/80 shrink-0">medical_services</mat-icon>
                      </div>

                      <p class="text-sm text-slate-600 leading-relaxed">{{ doc.bio }}</p>

                      <div class="pt-1 space-y-1 text-xs text-slate-600">
                        <p>
                          <strong class="text-slate-800">Clinic Schedule:</strong> {{ doc.clinicHours }}
                        </p>
                        <p>
                          <strong class="text-slate-800">Languages:</strong> {{ doc.languages.join(' · ') }}
                        </p>
                      </div>
                    </div>

                    <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <a
                        [href]="hospital.phoneHref"
                        class="text-xs font-mono font-semibold text-slate-600 hover:text-[#0F2942]"
                      >
                        Verify Availability · {{ hospital.phoneDisplay }}
                      </a>
                      <button
                        type="button"
                        (click)="bookWithDoctor(doc)"
                        class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">calendar_month</mat-icon>
                        <span>Book Session</span>
                      </button>
                    </div>
                  </article>
                }
              </div>
            }
          </section>

          <!-- Executive Leadership Snapshot -->
          <section class="rounded-2xl bg-white/92 border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
            <div class="space-y-1.5">
              <p class="text-xs font-medium text-teal-800">Governance &amp; Executive Directors</p>
              <h2 class="font-display text-2xl font-bold text-[#0F2942]">
                Board of Directors · {{ hospital.legalName }} ({{ hospital.cacRegistration }})
              </h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              @for (director of directors; track director.id) {
                <article class="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <p class="text-xs font-medium text-teal-800">{{ director.role }}</p>
                  <h3 class="font-display text-base font-bold text-[#0F2942]">{{ director.name }}</h3>
                  <p class="text-xs text-slate-500">{{ director.credential }}</p>
                  <p class="text-xs text-slate-600 leading-relaxed pt-1">{{ director.focus }}</p>
                </article>
              }
            </div>
          </section>
        </div>
      </main>
    </app-background-slideshow>
  `,
})
export class DoctorsPage {
  private readonly router = inject(Router);
  private readonly store = inject(BookingStore);

  readonly hospital = HOSPITAL_PROFILE;
  readonly backdropSlides = DOCTORS_BACKDROP_SLIDES;
  readonly directors = EXECUTIVE_DIRECTORS;

  readonly categories: readonly {readonly id: CareCategory | 'all'; readonly label: string}[] = [
    {id: 'all', label: 'All Specialties'},
    {id: 'surgery', label: 'Surgery'},
    {id: 'checkup', label: 'Internal Medicine'},
    {id: 'diagnostic', label: 'Cardiology & Lab'},
    {id: 'maternity', label: 'OB/GYN & Pediatrics'},
    {id: 'specialty', label: 'Dental'},
  ];

  readonly languageFilters: readonly string[] = ['all', 'English', 'Igbo'];

  readonly selectedCategory = signal<CareCategory | 'all'>('all');
  readonly selectedLanguage = signal<string>('all');
  readonly searchQuery = signal<string>('');

  readonly filteredDoctors = computed(() =>
    filterDoctors(
      DOCTOR_PROFILES,
      this.selectedCategory(),
      this.selectedLanguage(),
      this.searchQuery(),
    ),
  );

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.selectedLanguage.set('all');
    this.searchQuery.set('');
  }

  bookWithDoctor(doc: DoctorProfile): void {
    this.store.selectServiceForBooking(doc.primaryServiceId);
    this.router.navigate(['/appointments'], {
      queryParams: {
        service: doc.primaryServiceId,
        doctor: doc.id,
      },
    });
  }
}
