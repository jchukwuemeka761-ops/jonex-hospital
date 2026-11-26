import {ArrowRight, CheckCircle2, Phone, Search} from 'lucide-react';
import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {BackgroundSlideshow} from '../components/BackgroundSlideshow.tsx';
import {useBookings} from '../core/BookingContext.tsx';
import {filterServices} from '../core/booking.logic.ts';
import {
  CLINICAL_SERVICES,
  HOSPITAL_PROFILE,
  INFRASTRUCTURE_HIGHLIGHTS,
  SERVICES_BACKDROP_SLIDES,
  type CareCategory,
  type ClinicalService,
} from '../core/hospital-data.ts';

const SERVICE_CATEGORIES: readonly {readonly id: CareCategory | 'all'; readonly label: string}[] = [
  {id: 'all', label: 'All Departments'},
  {id: 'surgery', label: 'Surgery'},
  {id: 'checkup', label: 'Checkups'},
  {id: 'diagnostic', label: 'Diagnostics & Lab'},
  {id: 'maternity', label: 'Maternity & Pediatrics'},
  {id: 'specialty', label: 'Specialty'},
];

export function ServicesPage() {
  const navigate = useNavigate();
  const {selectCategoryForBooking, selectServiceForBooking} = useBookings();

  const [selectedBackdropId, setSelectedBackdropId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = useMemo(
    () => filterServices(CLINICAL_SERVICES, selectedCategory, searchQuery),
    [selectedCategory, searchQuery],
  );

  const bookCategory = (category: CareCategory) => {
    selectCategoryForBooking(category);
    navigate(`/appointments?category=${encodeURIComponent(category)}`);
  };

  const bookService = (service: ClinicalService) => {
    selectServiceForBooking(service.id);
    navigate(`/appointments?service=${encodeURIComponent(service.id)}`);
  };

  return (
    <BackgroundSlideshow slides={SERVICES_BACKDROP_SLIDES} activeSlideId={selectedBackdropId}>
      <main className="min-h-screen pt-16 sm:pt-24 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <section className="rounded-2xl bg-indigo-950/92 backdrop-blur-[2px] border border-indigo-400/35 p-8 sm:p-10 shadow-lg space-y-5">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-semibold text-indigo-300">
                Clinical Departments &amp; Facility Wings · {HOSPITAL_PROFILE.bedsCount} Beds
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Medical Services, Laboratory &amp; Hospital Infrastructure
              </h1>
              <p className="text-base text-indigo-100 leading-relaxed">
                Explore Jonex Hospital’s reception, hematology laboratory, labor &amp; delivery room,
                cardiology ultrasound suite, pediatric clinic, and dental wing—all visible across
                our background tour below.
              </p>
            </div>

            <div className="pt-3 border-t border-indigo-400/30 space-y-2">
              <p className="text-xs font-semibold text-indigo-200">
                Focus a Hospital Wing in the Background Tour:
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICES_BACKDROP_SLIDES.map((slide) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSelectedBackdropId(slide.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      selectedBackdropId === slide.id
                        ? 'bg-cyan-300 text-slate-950 border-cyan-200'
                        : 'bg-indigo-900/90 text-indigo-100 border-indigo-400/40 hover:border-cyan-300 hover:text-white'
                    }`}
                  >
                    {slide.caption}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section
            id="infrastructure"
            className="scroll-mt-20 rounded-2xl bg-teal-950/92 backdrop-blur-[2px] border border-teal-400/35 p-6 sm:p-8 shadow-lg space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-teal-300">Core Facility Capabilities</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Clinical Infrastructure &amp; Equipment Standards
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-teal-100 max-w-md">
                Click any wing to inspect its room in the full background view or jump directly into
                scheduling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {INFRASTRUCTURE_HIGHLIGHTS.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-xl border p-6 flex flex-col justify-between gap-5 transition-colors ${
                    selectedBackdropId === item.slideId
                      ? 'bg-cyan-900/95 border-cyan-300'
                      : 'bg-teal-900/85 border-teal-400/30'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-teal-200">{item.indexLabel}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedBackdropId(item.slideId)}
                        className="text-xs font-semibold text-cyan-200 hover:text-white underline underline-offset-4"
                      >
                        Show Room in Background
                      </button>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-teal-100 leading-relaxed">{item.description}</p>
                    <ul className="pt-2 space-y-1.5 text-sm text-teal-50">
                      {item.equipmentList.map((equip) => (
                        <li key={equip} className="flex items-start gap-2">
                          <CheckCircle2
                            className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{equip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-teal-700/60 flex items-center justify-between">
                    <span className="text-xs text-teal-200">{item.department}</span>
                    <button
                      type="button"
                      onClick={() => bookCategory(item.targetCategory)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-300 hover:text-orange-200 transition-colors whitespace-nowrap"
                    >
                      <span>Book in this Department</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-rose-950/92 backdrop-blur-[2px] border border-rose-400/35 p-6 sm:p-8 shadow-lg space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative w-full lg:max-w-sm">
                <label htmlFor="serviceSearch" className="sr-only">
                  Search clinical services or specialists
                </label>
                <Search
                  className="w-5 h-5 text-rose-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="serviceSearch"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search surgery, blood test, OB/GYN..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 placeholder:text-slate-500 border border-rose-300 rounded-lg focus:outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-300/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-rose-900/90 border border-rose-400/35 rounded-lg">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-rose-200 text-rose-950'
                        : 'text-rose-100 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="p-12 rounded-xl border border-rose-300/35 bg-rose-900/85 text-center space-y-3">
                <p className="font-display text-lg font-semibold text-white">
                  No Matching Services Found
                </p>
                <p className="text-sm text-rose-100">
                  Try clearing your search or switching back to All Departments.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm font-bold text-rose-950 bg-rose-200 hover:bg-white rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <article
                    key={service.id}
                    className="rounded-xl border border-rose-300/30 bg-rose-900/85 p-6 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-rose-200">
                        <span className="font-semibold text-rose-100">{service.department}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{service.durationMinutes} min session</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-white font-semibold tabular-nums">
                          {service.feeRangeNgn}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-white">{service.title}</h3>
                      <p className="text-sm text-rose-100 leading-relaxed">{service.summary}</p>
                      <p className="text-xs text-rose-200 pt-1">
                        Lead Clinician:{' '}
                        <strong className="text-white">{service.specialistName}</strong> ·{' '}
                        {service.specialistRole}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-rose-700/60 flex items-center justify-between gap-3">
                      <span className="text-xs text-rose-200">
                        {service.confirmOnSiteByPhone
                          ? 'Verify readiness by phone'
                          : 'Immediate online slots'}
                      </span>
                      <button
                        type="button"
                        onClick={() => bookService(service)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-orange-400 hover:bg-orange-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Book This Service</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-amber-400/45 bg-amber-950/90 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <h2 className="font-display text-lg font-bold text-amber-300">
                  Confirming Specialized On-Site Capabilities Before Your Visit
                </h2>
                <p className="text-sm text-amber-50 leading-relaxed">
                  {HOSPITAL_PROFILE.capabilityNotice}
                </p>
              </div>
              <a
                href={HOSPITAL_PROFILE.phoneHref}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Phone className="w-[18px] h-[18px]" aria-hidden="true" />
                <span className="font-mono tabular-nums">{HOSPITAL_PROFILE.phoneDisplay}</span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </BackgroundSlideshow>
  );
}
