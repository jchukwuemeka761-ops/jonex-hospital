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
      <main className="min-h-screen pt-16 sm:pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <section className="rounded-2xl bg-white/95 border border-white/80 p-8 sm:p-10 shadow-md space-y-5">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-medium text-teal-800">
                Clinical Departments &amp; Facility Wings · {HOSPITAL_PROFILE.bedsCount} Beds
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0F2942]">
                Medical Services, Laboratory &amp; Hospital Infrastructure
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                Explore Jonex Hospital’s reception, hematology laboratory, labor &amp; delivery room,
                cardiology ultrasound suite, pediatric clinic, and dental wing—all visible across
                our background tour below.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/80 space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Focus a Hospital Wing in the Background Tour:
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICES_BACKDROP_SLIDES.map((slide) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSelectedBackdropId(slide.id)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      selectedBackdropId === slide.id
                        ? 'bg-[#0F2942] text-white border-[#0F2942]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-700'
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
            className="rounded-2xl bg-white/95 border border-white/80 p-6 sm:p-8 shadow-md space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-teal-800">Core Facility Capabilities</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F2942]">
                  Clinical Infrastructure &amp; Equipment Standards
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md">
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
                      ? 'bg-teal-50/80 border-teal-700'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-teal-800">{item.indexLabel}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedBackdropId(item.slideId)}
                        className="text-xs font-semibold text-[#0F2942] hover:text-teal-700 underline underline-offset-4"
                      >
                        Show Room in Background
                      </button>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#0F2942]">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    <ul className="pt-2 space-y-1.5 text-sm text-slate-700">
                      {item.equipmentList.map((equip) => (
                        <li key={equip} className="flex items-start gap-2">
                          <CheckCircle2
                            className="w-4 h-4 text-teal-700 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{equip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{item.department}</span>
                    <button
                      type="button"
                      onClick={() => bookCategory(item.targetCategory)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2942] hover:text-teal-700 transition-colors whitespace-nowrap"
                    >
                      <span>Book in this Department</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white/95 border border-white/80 p-6 sm:p-8 shadow-md space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative w-full lg:max-w-sm">
                <label htmlFor="serviceSearch" className="sr-only">
                  Search clinical services or specialists
                </label>
                <Search
                  className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="serviceSearch"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search surgery, blood test, OB/GYN..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-white text-[#0F2942] shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="p-12 rounded-xl border border-slate-200 bg-white text-center space-y-3">
                <p className="font-display text-lg font-semibold text-slate-900">
                  No Matching Services Found
                </p>
                <p className="text-sm text-slate-600">
                  Try clearing your search or switching back to All Departments.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#0F2942] rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <article
                    key={service.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-teal-800">{service.department}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{service.durationMinutes} min session</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-800 tabular-nums">
                          {service.feeRangeNgn}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#0F2942]">
                        {service.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{service.summary}</p>
                      <p className="text-xs text-slate-500 pt-1">
                        Lead Clinician:{' '}
                        <strong className="text-slate-800">{service.specialistName}</strong> ·{' '}
                        {service.specialistRole}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        {service.confirmOnSiteByPhone
                          ? 'Verify readiness by phone'
                          : 'Immediate online slots'}
                      </span>
                      <button
                        type="button"
                        onClick={() => bookService(service)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Book This Service</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <h2 className="font-display text-lg font-bold text-[#0F2942]">
                  Confirming Specialized On-Site Capabilities Before Your Visit
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {HOSPITAL_PROFILE.capabilityNotice}
                </p>
              </div>
              <a
                href={HOSPITAL_PROFILE.phoneHref}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
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
