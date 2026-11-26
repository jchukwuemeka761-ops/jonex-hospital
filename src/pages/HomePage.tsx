import {ArrowRight, Calendar, CalendarCheck, Phone, Search} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {BackgroundSlideshow} from '../components/BackgroundSlideshow.tsx';
import {HospitalMap} from '../components/HospitalMap.tsx';
import {useBookings} from '../core/BookingContext.tsx';
import {filterDoctors, filterServices} from '../core/booking.logic.ts';
import {
  CLINICAL_SERVICES,
  DOCTOR_PROFILES,
  EXECUTIVE_DIRECTORS,
  FACILITY_FACTS,
  HERO_IMAGE,
  HOME_BACKDROP_SLIDES,
  HOSPITAL_PROFILE,
  PATIENT_REVIEWS,
  type CareCategory,
  type ClinicalService,
  type DoctorProfile,
} from '../core/hospital-data.ts';

interface CategoryTab {
  readonly id: CareCategory | 'all';
  readonly label: string;
}

const SERVICE_TABS: readonly CategoryTab[] = [
  {id: 'all', label: 'All Services'},
  {id: 'surgery', label: 'Surgery'},
  {id: 'checkup', label: 'Checkups'},
  {id: 'diagnostic', label: 'Diagnostic Tests'},
  {id: 'maternity', label: 'Maternity & Pediatrics'},
];

const LANGUAGE_OPTIONS: readonly string[] = ['all', 'English', 'Igbo'];

export function HomePage() {
  const navigate = useNavigate();
  const {selectCategoryForBooking, selectServiceForBooking} = useBookings();

  const [hubMode, setHubMode] = useState<'doctors' | 'sessions'>('doctors');
  const [doctorLanguage, setDoctorLanguage] = useState<string>('all');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<CareCategory | 'all'>('all');

  const doctorsCountLabel = `${DOCTOR_PROFILES.length} Featured · ${HOSPITAL_PROFILE.doctorsCount} Staff`;

  const featuredDoctors = useMemo(
    () => filterDoctors(DOCTOR_PROFILES, 'all', doctorLanguage, doctorSearchQuery).slice(0, 8),
    [doctorLanguage, doctorSearchQuery],
  );

  const visibleServices = useMemo(() => {
    const filtered = filterServices(CLINICAL_SERVICES, activeTab, '');
    return activeTab === 'all' ? filtered.slice(0, 6) : filtered;
  }, [activeTab]);

  const bookCategory = (category: CareCategory) => {
    selectCategoryForBooking(category);
    navigate(`/appointments?category=${encodeURIComponent(category)}`);
  };

  const bookService = (service: ClinicalService) => {
    selectServiceForBooking(service.id);
    navigate(`/appointments?service=${encodeURIComponent(service.id)}`);
  };

  const bookWithDoctor = (doc: DoctorProfile) => {
    selectServiceForBooking(doc.primaryServiceId);
    navigate(
      `/appointments?service=${encodeURIComponent(doc.primaryServiceId)}&doctor=${encodeURIComponent(doc.id)}`,
    );
  };

  return (
    <BackgroundSlideshow slides={HOME_BACKDROP_SLIDES}>
      <main className="text-white pt-14 sm:pt-20 pb-24 space-y-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <section className="rounded-2xl bg-sky-950/92 backdrop-blur-[2px] border border-sky-400/35 p-6 sm:p-10 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  <p className="text-sm font-semibold text-sky-300 tracking-tight">
                    Ogbor Hill, Aba · Ebenma Street · Open 24 Hours
                  </p>

                  <h1
                    className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1] max-w-xl"
                    style={{textWrap: 'balance'}}
                  >
                    Clinical, Surgical &amp; Diagnostic Care Built Around Aba Families
                  </h1>

                  <p className="text-base sm:text-lg text-sky-100 leading-relaxed max-w-xl">
                    Backed by {HOSPITAL_PROFILE.bedsCount} beds, {HOSPITAL_PROFILE.doctorsCount}{' '}
                    doctors, and {HOSPITAL_PROFILE.accreditation} standards, Jonex Hospital delivers
                    general surgery, checkups, maternity care, and diagnostic testing 24 hours a
                    day.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to="/appointments"
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-slate-950 bg-orange-400 hover:bg-orange-300 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                    >
                      <CalendarCheck className="w-5 h-5" aria-hidden="true" />
                      <span>Book an Appointment</span>
                    </Link>

                    <a
                      href={HOSPITAL_PROFILE.phoneHref}
                      className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-sky-900/90 hover:bg-sky-800 border border-sky-400/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <Phone className="w-[18px] h-[18px]" aria-hidden="true" />
                      <span className="font-mono tabular-nums">
                        {HOSPITAL_PROFILE.phoneDisplay}
                      </span>
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-sky-200 pt-2 border-t border-sky-400/25">
                    <span className="whitespace-nowrap">
                      {HOSPITAL_PROFILE.bedsCount} Beds · {HOSPITAL_PROFILE.doctorsCount} Doctors
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="whitespace-nowrap">{HOSPITAL_PROFILE.accreditation}</span>
                    <span aria-hidden="true">·</span>
                    <span className="whitespace-nowrap">English &amp; Igbo</span>
                    <span aria-hidden="true">·</span>
                    <span className="whitespace-nowrap">Est. 1994</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col">
                <figure className="relative flex-1 min-h-[290px] sm:min-h-[360px] lg:min-h-[420px] rounded-xl overflow-hidden border border-sky-400/35 bg-sky-900">
                  <img
                    src={HERO_IMAGE.src}
                    alt={HERO_IMAGE.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent px-5 py-4 text-white">
                    <p className="text-sm font-semibold">
                      499P+27M, Ebenma Street, Ogbor Hill, Aba
                    </p>
                    <p className="text-xs text-sky-100 mt-0.5">
                      Step-free main arrival ramp, card &amp; NFC contactless reception desk, 24/7
                      clinical intake
                    </p>
                  </figcaption>
                </figure>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-sky-400/25 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => bookCategory('surgery')}
                className="group text-left p-5 rounded-xl bg-rose-900/90 hover:bg-rose-800 border border-rose-400/40 transition-colors focus-visible:outline-2 focus-visible:outline-rose-300"
              >
                <div className="flex items-center justify-between text-rose-200">
                  <span className="text-xs font-semibold">01. Surgical Care</span>
                  <ArrowRight
                    className="w-5 h-5 text-rose-200 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-display text-base font-bold text-white mt-2">
                  Schedule Surgery Consult
                </p>
                <p className="text-sm text-rose-100 mt-1">
                  General surgery, pre-op anesthesia review &amp; orthopedic evaluation.
                </p>
              </button>

              <button
                type="button"
                onClick={() => bookCategory('checkup')}
                className="group text-left p-5 rounded-xl bg-blue-900/90 hover:bg-blue-800 border border-blue-400/40 transition-colors focus-visible:outline-2 focus-visible:outline-blue-300"
              >
                <div className="flex items-center justify-between text-blue-200">
                  <span className="text-xs font-semibold">02. Primary &amp; Internal</span>
                  <ArrowRight
                    className="w-5 h-5 text-blue-200 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-display text-base font-bold text-white mt-2">
                  Book Medical Checkup
                </p>
                <p className="text-sm text-blue-100 mt-1">
                  Adult annual physicals, internal medicine &amp; same-day GP visits.
                </p>
              </button>

              <button
                type="button"
                onClick={() => bookCategory('diagnostic')}
                className="group text-left p-5 rounded-xl bg-cyan-900/90 hover:bg-cyan-800 border border-cyan-400/40 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                <div className="flex items-center justify-between text-cyan-200">
                  <span className="text-xs font-semibold">03. Lab &amp; Screening</span>
                  <ArrowRight
                    className="w-5 h-5 text-cyan-200 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-display text-base font-bold text-white mt-2">
                  Reserve Diagnostic Tests
                </p>
                <p className="text-sm text-cyan-100 mt-1">
                  Blood panels, cardiac ECG, and ultrasound coordination.
                </p>
              </button>

              <button
                type="button"
                onClick={() => bookCategory('maternity')}
                className="group text-left p-5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-400/40 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <div className="flex items-center justify-between text-emerald-200">
                  <span className="text-xs font-semibold">04. Family Health</span>
                  <ArrowRight
                    className="w-5 h-5 text-emerald-200 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-display text-base font-bold text-white mt-2">
                  Maternity &amp; Pediatrics
                </p>
                <p className="text-sm text-emerald-100 mt-1">
                  Obstetrics, antenatal care, child wellness &amp; immunizations.
                </p>
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-cyan-950/92 backdrop-blur-[2px] border border-cyan-400/35 p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-cyan-300">Verified Institutional Profile</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Hospital Quick Facts &amp; Clinical Capacity
                </h2>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 hover:text-white whitespace-nowrap"
              >
                <span>Tour Lab, Reception &amp; Labor Wings</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FACILITY_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="p-5 rounded-xl border border-cyan-400/30 bg-cyan-900/85 space-y-1.5"
                >
                  <p className="text-xs font-medium text-cyan-200">{fact.label}</p>
                  <p className="font-display text-2xl font-bold text-white tabular-nums">
                    {fact.value}
                  </p>
                  <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">{fact.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="find-care"
            className={`scroll-mt-20 rounded-2xl backdrop-blur-[2px] p-6 sm:p-8 shadow-lg space-y-8 ${
              hubMode === 'doctors'
                ? 'bg-purple-950/92 border border-purple-400/40 text-purple-50'
                : 'bg-emerald-950/92 border border-orange-400/45 text-emerald-50'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p
                  className={`text-xs font-semibold ${
                    hubMode === 'doctors' ? 'text-purple-200' : 'text-orange-300'
                  }`}
                >
                  {hubMode === 'doctors'
                    ? 'Medical Specialists Directory'
                    : 'Scheduled Care & Service Booking'}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Find a Doctor &amp; Book a Session or Appointment
                </h2>
              </div>

              <div
                className={`inline-flex items-center gap-1 p-1 rounded-lg self-start border ${
                  hubMode === 'doctors'
                    ? 'bg-purple-900/90 border-purple-400/35'
                    : 'bg-emerald-900/90 border-orange-400/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setHubMode('doctors')}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    hubMode === 'doctors'
                      ? 'bg-purple-200 text-purple-950'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  Find a Doctor ({doctorsCountLabel})
                </button>
                <button
                  type="button"
                  onClick={() => setHubMode('sessions')}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    hubMode === 'sessions'
                      ? 'bg-orange-500 text-slate-950'
                      : 'text-purple-100 hover:text-white'
                  }`}
                >
                  Book a Session by Service
                </button>
              </div>
            </div>

            {hubMode === 'doctors' ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative w-full md:max-w-sm">
                    <label htmlFor="homeDoctorSearch" className="sr-only">
                      Search doctors by name or specialty
                    </label>
                    <Search
                      className="w-[18px] h-[18px] text-purple-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="homeDoctorSearch"
                      type="search"
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      placeholder="Search Dr. Eleweke, surgery, OB/GYN..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-500 border border-purple-300 rounded-lg focus:outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-300/40"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex flex-wrap gap-1 p-1 bg-purple-900/90 border border-purple-400/35 rounded-lg">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setDoctorLanguage(lang)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            doctorLanguage === lang
                              ? 'bg-purple-200 text-purple-950'
                              : 'text-purple-100 hover:text-white'
                          }`}
                        >
                          {lang === 'all' ? 'All Languages' : lang}
                        </button>
                      ))}
                    </div>
                    <Link
                      to="/doctors"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-200 hover:text-white px-3 py-2"
                    >
                      <span>Full Specialist Directory</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredDoctors.map((doc) => (
                    <article
                      key={doc.id}
                      className="rounded-xl border border-purple-300/35 bg-purple-900/90 p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-purple-200">{doc.specialty}</p>
                        <h3 className="font-display text-base font-bold text-white">{doc.name}</h3>
                        <p className="text-xs text-purple-200">{doc.credentials}</p>
                        <p className="text-xs text-purple-100 leading-relaxed line-clamp-3">
                          {doc.bio}
                        </p>
                        <p className="text-[11px] font-medium text-purple-200 pt-1">
                          Languages: {doc.languages.join(' · ')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => bookWithDoctor(doc)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-purple-950 bg-purple-200 hover:bg-white rounded-lg transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Book Session</span>
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div
                  role="tablist"
                  aria-label="Filter clinical services by department"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-emerald-900/90 border border-orange-400/35 rounded-lg"
                >
                  {SERVICE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        activeTab === tab.id
                          ? 'bg-orange-500 text-slate-950'
                          : 'text-emerald-100 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-emerald-900/90 rounded-xl border border-orange-400/35 p-6 flex flex-col justify-between gap-5"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100">
                          <span className="font-semibold text-orange-300">
                            {service.department}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{service.durationMinutes} min session</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-white font-semibold">
                            {service.feeRangeNgn}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-white">
                          {service.title}
                        </h3>

                        <p className="text-sm text-emerald-100 leading-relaxed">
                          {service.summary}
                        </p>

                        <p className="text-xs text-emerald-200 pt-1">
                          Lead Clinician:{' '}
                          <span className="font-semibold text-white">
                            {service.specialistName}
                          </span>{' '}
                          · {service.specialistRole}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-emerald-200">
                          {service.confirmOnSiteByPhone
                            ? 'On-site readiness confirmed by desk'
                            : 'Direct online slot confirmation'}
                        </span>

                        <button
                          type="button"
                          onClick={() => bookService(service)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-950 bg-orange-500 hover:bg-orange-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          <span>Book Session</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section
            id="about"
            className="scroll-mt-20 rounded-2xl bg-neutral-950/94 backdrop-blur-[2px] border border-amber-400/50 p-6 sm:p-10 shadow-lg space-y-10 text-amber-50"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-4">
                <p className="text-xs font-semibold text-amber-300">
                  About Jonex Hospital · {HOSPITAL_PROFILE.legalName} (
                  {HOSPITAL_PROFILE.cacRegistration})
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-300">
                  Trusted Aba Healthcare Since {HOSPITAL_PROFILE.incorporatedDate}
                </h2>
                <p className="text-sm sm:text-base text-amber-50/90 leading-relaxed">
                  {HOSPITAL_PROFILE.aboutUs}
                </p>
                <p className="text-sm text-amber-100/90 leading-relaxed">
                  <strong className="text-amber-300">Clinical Quality Standard:</strong>{' '}
                  {HOSPITAL_PROFILE.qualityStandard}
                </p>

                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold text-amber-300">
                    Medical &amp; Surgical Specialities
                  </p>
                  <p className="text-sm text-amber-50 leading-relaxed">
                    {HOSPITAL_PROFILE.specialtiesList.join(' · ')}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 gap-4">
                <article className="p-6 rounded-xl bg-amber-400 border border-amber-300 text-neutral-950 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">
                    Our Vision
                  </p>
                  <p className="font-display text-lg font-bold text-neutral-950 leading-snug">
                    “{HOSPITAL_PROFILE.vision}”
                  </p>
                </article>

                <article className="p-6 rounded-xl bg-black/90 border border-amber-400/45 space-y-2">
                  <p className="text-xs font-semibold text-amber-300">Our Mission</p>
                  <p className="text-sm sm:text-base text-amber-50 leading-relaxed">
                    {HOSPITAL_PROFILE.mission}
                  </p>
                </article>

                <article className="p-5 rounded-xl bg-neutral-900/95 border border-amber-400/40 flex flex-wrap items-center justify-between gap-4 text-xs text-amber-100">
                  <div>
                    <p className="font-semibold text-amber-300">
                      Corporate Affairs Commission (CAC) Verified
                    </p>
                    <p>
                      Registration {HOSPITAL_PROFILE.cacRegistration} · Corporate Office:{' '}
                      {HOSPITAL_PROFILE.corporateRegistryAddress}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-amber-300">
                    {HOSPITAL_PROFILE.accreditation}
                  </span>
                </article>
              </div>
            </div>

            <div className="pt-8 border-t border-amber-400/30 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-amber-300">Executive Leadership</p>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Board of Directors · Jonex Hospitals Ltd
                  </h3>
                </div>
                <p className="text-xs text-amber-200">
                  Front Desk &amp; Operational Inquiries: {HOSPITAL_PROFILE.phoneDisplay}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EXECUTIVE_DIRECTORS.map((director) => (
                  <article
                    key={director.id}
                    className="p-5 rounded-xl bg-black/90 border border-amber-400/40 space-y-2"
                  >
                    <p className="text-xs font-semibold text-amber-300">{director.role}</p>
                    <h4 className="font-display text-base font-bold text-white">{director.name}</h4>
                    <p className="text-xs text-amber-200">{director.credential}</p>
                    <p className="text-xs text-amber-50/90 leading-relaxed pt-1">
                      {director.focus}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="directions" className="scroll-mt-20 space-y-4">
            <div className="rounded-2xl bg-teal-950/95 text-white p-6 sm:p-8 border border-teal-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-teal-300">How to Get to Jonex Hospital</p>
                <h2 className="font-display text-2xl font-bold">
                  Map Navigation &amp; Directions in Aba
                </h2>
              </div>
              <Link
                to="/patients-and-visitors"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-950 bg-teal-300 hover:bg-teal-200 px-4 py-2.5 rounded-lg transition-colors self-start sm:self-center"
              >
                <span>Open Arrival, Parking &amp; Lobby Tour</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <HospitalMap />
          </section>

          <section className="rounded-2xl bg-rose-950/92 backdrop-blur-[2px] border border-rose-400/35 p-6 sm:p-8 shadow-lg space-y-8 text-rose-50">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-rose-200">
                  Community Feedback &amp; Transparency
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  What Aba Patients Say About Jonex Hospital
                </h2>
              </div>
              <p className="text-sm text-rose-200 tabular-nums">
                4.4 out of 5 stars across 9 public reviews
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PATIENT_REVIEWS.map((review) => (
                <article
                  key={review.id}
                  className="p-6 rounded-xl bg-rose-900/85 border border-rose-300/30 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-rose-200">
                      <span className="font-semibold text-white tabular-nums">
                        {review.rating}.0 / 5.0
                      </span>
                      <span>{review.dateLabel}</span>
                    </div>
                    <p className="text-sm text-rose-50 leading-relaxed">“{review.comment}”</p>
                  </div>
                  <div className="pt-3 border-t border-rose-700/60 text-xs text-rose-200">
                    <p className="font-semibold text-white">{review.author}</p>
                    <p>{review.visitType}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-orange-900 border border-orange-400/45 text-white p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-semibold text-orange-300">
                  Direct Patient Scheduling · Ogbor Hill, Aba
                </p>
                <h3 className="font-display text-2xl font-bold">
                  Ready to Book Your Consultation, Surgery Review, or Diagnostic Test?
                </h3>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  Reserve an exact appointment time online or speak directly with our 24/7 clinical
                  desk on {HOSPITAL_PROFILE.phoneDisplay}.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  to="/appointments"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-950 bg-orange-400 hover:bg-orange-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  <CalendarCheck className="w-[18px] h-[18px]" aria-hidden="true" />
                  <span>Book Appointment</span>
                </Link>
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white border border-emerald-300/40 bg-emerald-950/60 hover:bg-emerald-950 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Browse Doctors</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </BackgroundSlideshow>
  );
}
