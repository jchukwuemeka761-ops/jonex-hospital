import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {BookingStore} from '../core/booking-store';
import {filterServices} from '../core/booking.logic';
import {
  CareCategory,
  CLINICAL_SERVICES,
  ClinicalService,
  HOSPITAL_PROFILE,
  INFRASTRUCTURE_HIGHLIGHTS,
  SERVICES_BACKDROP_SLIDES,
} from '../core/hospital-data';
import {BackgroundSlideshow} from '../shared/background-slideshow';

@Component({
  selector: 'app-services-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackgroundSlideshow, MatIconModule],
  template: `
    <app-background-slideshow
      [slides]="backdropSlides"
      [activeSlideId]="selectedBackdropId()"
    >
      <main class="min-h-screen pt-16 sm:pt-24 pb-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <!-- Header Block -->
          <section class="rounded-2xl bg-white/90 border border-white/80 p-8 sm:p-10 shadow-md space-y-5">
            <div class="max-w-3xl space-y-3">
              <p class="text-sm font-medium text-teal-800">
                Clinical Departments &amp; Facility Wings · {{ hospital.bedsCount }} Beds
              </p>
              <h1 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F2942]">
                Medical Services, Laboratory &amp; Hospital Infrastructure
              </h1>
              <p class="text-base text-slate-600 leading-relaxed">
                Explore Jonex Hospital’s reception, hematology laboratory, labor &amp; delivery room, cardiology ultrasound suite, pediatric clinic, and dental wing—all visible across our background tour below.
              </p>
            </div>

            <!-- Interactive Background Room Tour Switcher -->
            <div class="pt-3 border-t border-slate-200/80 space-y-2">
              <p class="text-xs font-semibold text-slate-700">
                Focus a Hospital Wing in the Background Tour:
              </p>
              <div class="flex flex-wrap gap-2">
                @for (slide of backdropSlides; track slide.id) {
                  <button
                    type="button"
                    (click)="focusRoom(slide.id)"
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

          <!-- Infrastructure Wings Grid (No repeated thumbnails; links straight into Background Tour + Booking) -->
          <section id="infrastructure" class="rounded-2xl bg-white/90 border border-white/80 p-6 sm:p-8 shadow-md space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div class="space-y-1">
                <p class="text-xs font-medium text-teal-800">Core Facility Capabilities</p>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-[#0F2942]">
                  Clinical Infrastructure &amp; Equipment Standards
                </h2>
              </div>
              <p class="text-xs sm:text-sm text-slate-600 max-w-md">
                Click any wing to inspect its room in the full background view or jump directly into scheduling.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (item of infrastructure; track item.id) {
                <article
                  class="rounded-xl border p-6 flex flex-col justify-between gap-5 transition-colors"
                  [class]="selectedBackdropId() === item.slideId
                    ? 'bg-teal-50/75 border-teal-700'
                    : 'bg-white/95 border-slate-200'"
                >
                  <div class="space-y-2.5">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-xs font-medium text-teal-800">{{ item.indexLabel }}</p>
                      <button
                        type="button"
                        (click)="focusRoom(item.slideId)"
                        class="text-xs font-semibold text-[#0F2942] hover:text-teal-700 underline underline-offset-4"
                      >
                        Show Room in Background
                      </button>
                    </div>
                    <h3 class="font-display text-xl font-bold text-[#0F2942]">
                      {{ item.title }}
                    </h3>
                    <p class="text-sm text-slate-600 leading-relaxed">
                      {{ item.description }}
                    </p>
                    <ul class="pt-2 space-y-1.5 text-sm text-slate-700">
                      @for (equip of item.equipmentList; track equip) {
                        <li class="flex items-start gap-2">
                          <mat-icon class="!text-[17px] !w-[17px] !h-[17px] text-teal-700 mt-0.5 shrink-0">check_circle</mat-icon>
                          <span>{{ equip }}</span>
                        </li>
                      }
                    </ul>
                  </div>

                  <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span class="text-xs text-slate-500">{{ item.department }}</span>
                    <button
                      type="button"
                      (click)="bookCategory(item.targetCategory)"
                      class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2942] hover:text-teal-700 transition-colors whitespace-nowrap"
                    >
                      <span>Book in this Department</span>
                      <mat-icon class="!text-[17px] !w-[17px] !h-[17px]">arrow_forward</mat-icon>
                    </button>
                  </div>
                </article>
              }
            </div>
          </section>

          <!-- Search + Clinical Directory Grid -->
          <section class="rounded-2xl bg-white/92 border border-white/80 p-6 sm:p-8 shadow-md space-y-8">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="relative w-full lg:max-w-sm">
                <label for="serviceSearch" class="sr-only">Search clinical services or specialists</label>
                <mat-icon class="!text-[20px] !w-[20px] !h-[20px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</mat-icon>
                <input
                  id="serviceSearch"
                  type="search"
                  [value]="searchQuery()"
                  (input)="onSearchInput($event)"
                  placeholder="Search surgery, blood test, OB/GYN..."
                  class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div class="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                @for (cat of categories; track cat.id) {
                  <button
                    type="button"
                    (click)="selectedCategory.set(cat.id)"
                    class="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap"
                    [class]="selectedCategory() === cat.id
                      ? 'bg-white text-[#0F2942] shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'"
                  >
                    {{ cat.label }}
                  </button>
                }
              </div>
            </div>

            @if (filteredServices().length === 0) {
              <div class="p-12 rounded-xl border border-slate-200 bg-white text-center space-y-3">
                <p class="font-display text-lg font-semibold text-slate-900">No Matching Services Found</p>
                <p class="text-sm text-slate-600">Try clearing your search or switching back to All Departments.</p>
                <button
                  type="button"
                  (click)="resetFilters()"
                  class="px-4 py-2 text-sm font-semibold text-white bg-[#0F2942] rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (service of filteredServices(); track service.id) {
                  <article class="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-4">
                    <div class="space-y-2">
                      <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span class="font-medium text-teal-800">{{ service.department }}</span>
                        <span aria-hidden="true">·</span>
                        <span class="tabular-nums">{{ service.durationMinutes }} min session</span>
                        <span aria-hidden="true">·</span>
                        <span class="font-mono text-slate-800 tabular-nums">{{ service.feeRangeNgn }}</span>
                      </div>
                      <h3 class="font-display text-lg font-bold text-[#0F2942]">{{ service.title }}</h3>
                      <p class="text-sm text-slate-600 leading-relaxed">{{ service.summary }}</p>
                      <p class="text-xs text-slate-500 pt-1">
                        Lead Clinician: <strong class="text-slate-800">{{ service.specialistName }}</strong> · {{ service.specialistRole }}
                      </p>
                    </div>

                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span class="text-xs text-slate-500">
                        {{ service.confirmOnSiteByPhone ? 'Verify readiness by phone' : 'Immediate online slots' }}
                      </span>
                      <button
                        type="button"
                        (click)="bookService(service)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Book This Service</span>
                        <mat-icon class="!text-[15px] !w-[15px] !h-[15px]">arrow_forward</mat-icon>
                      </button>
                    </div>
                  </article>
                }
              </div>
            }

            <!-- Capability Transparency Notice -->
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-2 max-w-3xl">
                <h2 class="font-display text-lg font-bold text-[#0F2942]">
                  Confirming Specialized On-Site Capabilities Before Your Visit
                </h2>
                <p class="text-sm text-slate-600 leading-relaxed">
                  {{ hospital.capabilityNotice }}
                </p>
              </div>
              <a
                [href]="hospital.phoneHref"
                class="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">call</mat-icon>
                <span class="font-mono tabular-nums">{{ hospital.phoneDisplay }}</span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </app-background-slideshow>
  `,
})
export class ServicesPage {
  private readonly router = inject(Router);
  private readonly store = inject(BookingStore);
  readonly hospital = HOSPITAL_PROFILE;
  readonly backdropSlides = SERVICES_BACKDROP_SLIDES;
  readonly infrastructure = INFRASTRUCTURE_HIGHLIGHTS;

  readonly selectedBackdropId = signal<string | null>(null);

  readonly categories: readonly {readonly id: CareCategory | 'all'; readonly label: string}[] = [
    {id: 'all', label: 'All Departments'},
    {id: 'surgery', label: 'Surgery'},
    {id: 'checkup', label: 'Checkups'},
    {id: 'diagnostic', label: 'Diagnostics & Lab'},
    {id: 'maternity', label: 'Maternity & Pediatrics'},
    {id: 'specialty', label: 'Specialty'},
  ];

  readonly selectedCategory = signal<CareCategory | 'all'>('all');
  readonly searchQuery = signal<string>('');

  readonly filteredServices = computed(() =>
    filterServices(CLINICAL_SERVICES, this.selectedCategory(), this.searchQuery()),
  );

  focusRoom(slideId: string): void {
    this.selectedBackdropId.set(slideId);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
  }

  bookCategory(category: CareCategory): void {
    this.store.selectCategoryForBooking(category);
    this.router.navigate(['/appointments'], {queryParams: {category}});
  }

  bookService(service: ClinicalService): void {
    this.store.selectServiceForBooking(service.id);
    this.router.navigate(['/appointments'], {queryParams: {service: service.id}});
  }
}
