import {Calendar, CalendarCheck, Search, Stethoscope} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {BackgroundSlideshow} from '../components/BackgroundSlideshow.tsx';
import {useBookings} from '../core/BookingContext.tsx';
import {filterDoctors} from '../core/booking.logic.ts';
import {
  DOCTOR_PROFILES,
  DOCTORS_BACKDROP_SLIDES,
  EXECUTIVE_DIRECTORS,
  HOSPITAL_PROFILE,
  type CareCategory,
  type DoctorProfile,
} from '../core/hospital-data.ts';

const DOCTOR_CATEGORIES: readonly {readonly id: CareCategory | 'all'; readonly label: string}[] = [
  {id: 'all', label: 'All Specialties'},
  {id: 'surgery', label: 'Surgery'},
  {id: 'checkup', label: 'Internal Medicine'},
  {id: 'diagnostic', label: 'Cardiology & Lab'},
  {id: 'maternity', label: 'OB/GYN & Pediatrics'},
  {id: 'specialty', label: 'Dental'},
];

const LANGUAGE_FILTERS: readonly string[] = ['all', 'English', 'Igbo'];

export function DoctorsPage() {
  const navigate = useNavigate();
  const {selectServiceForBooking} = useBookings();

  const [selectedCategory, setSelectedCategory] = useState<CareCategory | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDoctors = useMemo(
    () => filterDoctors(DOCTOR_PROFILES, selectedCategory, selectedLanguage, searchQuery),
    [selectedCategory, selectedLanguage, searchQuery],
  );

  const bookWithDoctor = (doc: DoctorProfile) => {
    selectServiceForBooking(doc.primaryServiceId);
    navigate(
      `/appointments?service=${encodeURIComponent(doc.primaryServiceId)}&doctor=${encodeURIComponent(doc.id)}`,
    );
  };

  return (
    <BackgroundSlideshow slides={DOCTORS_BACKDROP_SLIDES}>
      <main className="min-h-screen pt-20 sm:pt-28 pb-24 space-y-14 text-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <section className="rounded-2xl bg-purple-950/92 backdrop-blur-[2px] border border-purple-400/40 p-8 sm:p-10 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl space-y-3">
                <p className="text-sm font-semibold text-purple-200">
                  {HOSPITAL_PROFILE.doctorsCount} Medical Doctors · {HOSPITAL_PROFILE.accreditation}{' '}
                  · English &amp; Igbo
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Find a Doctor &amp; Book a Clinical Session
                </h1>
                <p className="text-base text-purple-100 leading-relaxed">
                  Browse Jonex Hospital’s consultant surgeons, internal medicine physicians,
                  obstetricians, pediatricians, cardiologists, and visiting specialists in Ogbor
                  Hill, Aba. Select any physician to reserve a dedicated appointment window.
                </p>
              </div>

              <Link
                to="/appointments"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-950 bg-orange-400 hover:bg-orange-300 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start"
              >
                <CalendarCheck className="w-[18px] h-[18px]" aria-hidden="true" />
                <span>Open Booking Portal</span>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl bg-purple-950/92 backdrop-blur-[2px] border border-purple-400/40 p-6 sm:p-8 shadow-lg space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative w-full lg:max-w-sm">
                <label htmlFor="doctorSearchPage" className="sr-only">
                  Search doctors by name or specialty
                </label>
                <Search
                  className="w-5 h-5 text-purple-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="doctorSearchPage"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Eleweke, surgery, cardiology, Igbo..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 placeholder:text-slate-500 border border-purple-300 rounded-lg focus:outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-300/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-purple-900/90 border border-purple-400/35 rounded-lg">
                  {DOCTOR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-purple-200 text-purple-950'
                          : 'text-purple-100 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 p-1 bg-purple-900/90 border border-purple-400/35 rounded-lg">
                  {LANGUAGE_FILTERS.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                        selectedLanguage === lang
                          ? 'bg-purple-200 text-purple-950'
                          : 'text-purple-100 hover:text-white'
                      }`}
                    >
                      {lang === 'all' ? 'All Languages' : lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="p-10 rounded-xl border border-purple-300/35 bg-purple-900/85 text-center space-y-3">
                <p className="font-display text-lg font-semibold text-white">
                  No Matching Doctors Found
                </p>
                <p className="text-sm text-purple-100">
                  Reset filters or call our nursing desk at {HOSPITAL_PROFILE.phoneDisplay} for
                  on-call specialist schedules.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLanguage('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm font-bold text-purple-950 bg-purple-200 hover:bg-white rounded-lg transition-colors"
                >
                  Show All Specialists
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doc) => (
                  <article
                    key={doc.id}
                    className="rounded-xl border border-purple-300/35 bg-purple-900/90 p-6 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-purple-200">{doc.specialty}</p>
                          <h2 className="font-display text-xl font-bold text-white mt-0.5">
                            {doc.name}
                          </h2>
                          <p className="text-xs text-purple-200 mt-0.5">
                            {doc.credentials} · {doc.role}
                          </p>
                        </div>
                        <Stethoscope
                          className="w-7 h-7 text-purple-200 shrink-0"
                          aria-hidden="true"
                        />
                      </div>

                      <p className="text-sm text-purple-100 leading-relaxed">{doc.bio}</p>

                      <div className="pt-1 space-y-1 text-xs text-purple-100">
                        <p>
                          <strong className="text-white">Clinic Schedule:</strong> {doc.clinicHours}
                        </p>
                        <p>
                          <strong className="text-white">Languages:</strong>{' '}
                          {doc.languages.join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-700/60 flex flex-wrap items-center justify-between gap-3">
                      <a
                        href={HOSPITAL_PROFILE.phoneHref}
                        className="text-xs font-mono font-semibold text-purple-200 hover:text-white"
                      >
                        Verify Availability · {HOSPITAL_PROFILE.phoneDisplay}
                      </a>
                      <button
                        type="button"
                        onClick={() => bookWithDoctor(doc)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-purple-950 bg-purple-200 hover:bg-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        <span>Book Session</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-neutral-950/94 backdrop-blur-[2px] border border-amber-400/50 p-6 sm:p-8 shadow-lg space-y-6 text-amber-50">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-amber-300">
                Governance &amp; Executive Directors
              </p>
              <h2 className="font-display text-2xl font-bold text-amber-300">
                Board of Directors · {HOSPITAL_PROFILE.legalName} (
                {HOSPITAL_PROFILE.cacRegistration})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXECUTIVE_DIRECTORS.map((director) => (
                <article
                  key={director.id}
                  className="p-5 rounded-xl bg-black/90 border border-amber-400/40 space-y-2"
                >
                  <p className="text-xs font-semibold text-amber-300">{director.role}</p>
                  <h3 className="font-display text-base font-bold text-white">{director.name}</h3>
                  <p className="text-xs text-amber-200">{director.credential}</p>
                  <p className="text-xs text-amber-50/90 leading-relaxed pt-1">{director.focus}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </BackgroundSlideshow>
  );
}
