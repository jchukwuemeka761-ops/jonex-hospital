import {Accessibility, ArrowRight, Clock, MapPin, Phone} from 'lucide-react';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {BackgroundSlideshow} from '../components/BackgroundSlideshow.tsx';
import {HospitalMap} from '../components/HospitalMap.tsx';
import {HOSPITAL_PROFILE, VISITORS_BACKDROP_SLIDES} from '../core/hospital-data.ts';

type ChecklistTab = 'surgery' | 'diagnostic' | 'maternity';

export function PatientsVisitorsPage() {
  const [activeChecklist, setActiveChecklist] = useState<ChecklistTab>('surgery');
  const [selectedBackdropId, setSelectedBackdropId] = useState<string | null>(null);

  return (
    <BackgroundSlideshow slides={VISITORS_BACKDROP_SLIDES} activeSlideId={selectedBackdropId}>
      <main className="min-h-screen pt-16 sm:pt-24 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <section className="rounded-2xl bg-amber-950/92 backdrop-blur-[2px] border border-amber-400/40 p-8 sm:p-10 shadow-lg space-y-5">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-semibold text-amber-300">
                Patients, Visitors &amp; Campus Arrival · Ogbor Hill, Aba
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Lobby, Waiting Lounge, Driveway &amp; Visitor Directions
              </h1>
              <p className="text-base text-amber-100 leading-relaxed">
                Essential information on arriving at Jonex Hospital’s covered driveway and parking
                bays on Ebenma Street, step-free lobby access, interactive directions across Aba,
                and pre-appointment checklists.
              </p>
            </div>

            <div className="pt-3 border-t border-amber-400/30 space-y-2">
              <p className="text-xs font-semibold text-amber-200">
                Preview Campus Arrival Areas in the Background Tour:
              </p>
              <div className="flex flex-wrap gap-2">
                {VISITORS_BACKDROP_SLIDES.map((slide) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSelectedBackdropId(slide.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      selectedBackdropId === slide.id
                        ? 'bg-amber-300 text-slate-950 border-amber-200'
                        : 'bg-amber-900/90 text-amber-100 border-amber-400/40 hover:border-amber-200 hover:text-white'
                    }`}
                  >
                    {slide.caption}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section id="directions" className="scroll-mt-20 space-y-4">
            <HospitalMap />
          </section>

          <section className="rounded-2xl bg-slate-950/90 backdrop-blur-[2px] border border-white/20 p-6 sm:p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <article className="p-6 rounded-xl border border-blue-400/35 bg-blue-950/92 text-blue-50 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-[22px] h-[22px] text-blue-300 shrink-0" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold">Hospital Address &amp; Registry</h2>
                </div>
                <p className="text-sm text-blue-100 leading-relaxed">
                  <strong className="text-white">Primary Clinical Campus:</strong>
                  <br />
                  {HOSPITAL_PROFILE.primaryAddress}
                </p>
                <p className="text-xs text-blue-200 leading-relaxed">
                  <strong className="text-white">Corporate Registry Address:</strong>
                  <br />
                  {HOSPITAL_PROFILE.corporateRegistryAddress} ({HOSPITAL_PROFILE.legalName} ·{' '}
                  {HOSPITAL_PROFILE.cacRegistration})
                </p>
              </article>

              <article className="p-6 rounded-xl border border-emerald-400/35 bg-emerald-950/92 text-emerald-50 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-[22px] h-[22px] text-emerald-300 shrink-0" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold">Operating Hours &amp; Phone</h2>
                </div>
                <p className="text-sm font-semibold text-white">
                  {HOSPITAL_PROFILE.hoursPrimary}
                </p>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  {HOSPITAL_PROFILE.hoursClinicNote}
                </p>
                <a
                  href={HOSPITAL_PROFILE.phoneHref}
                  className="inline-flex items-center gap-2 text-sm font-mono font-semibold text-orange-300 hover:text-orange-200 pt-1"
                >
                  <Phone className="w-[18px] h-[18px]" aria-hidden="true" />
                  <span>{HOSPITAL_PROFILE.phoneDisplay}</span>
                </a>
              </article>

              <article className="p-6 rounded-xl border border-violet-400/35 bg-violet-950/92 text-violet-50 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Accessibility
                    className="w-[22px] h-[22px] text-violet-300 shrink-0"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-lg font-bold">
                    Accessibility, Billing &amp; Languages
                  </h2>
                </div>
                <p className="text-sm text-violet-100 leading-relaxed">
                  {HOSPITAL_PROFILE.accessibility}
                </p>
                <p className="text-sm text-violet-100 leading-relaxed">
                  <strong className="text-white">Payments &amp; Languages:</strong> Credit, debit,
                  and NFC mobile payments accepted · Staffed in{' '}
                  <strong className="text-white">English &amp; Igbo</strong>.
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-2xl border border-indigo-400/35 bg-indigo-950/92 backdrop-blur-[2px] p-6 sm:p-8 shadow-lg space-y-6 text-indigo-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-white">
                  Pre-Appointment Preparation Checklists
                </h2>
                <p className="text-sm text-indigo-200">
                  Follow these steps before arriving at Ebenma Street for a smooth clinical intake.
                </p>
              </div>

              <div className="inline-flex flex-wrap gap-1 p-1 bg-indigo-900/90 border border-indigo-400/35 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setActiveChecklist('surgery')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                    activeChecklist === 'surgery'
                      ? 'bg-rose-400 text-slate-950'
                      : 'text-indigo-100 hover:text-white'
                  }`}
                >
                  Surgery Prep
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChecklist('diagnostic')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                    activeChecklist === 'diagnostic'
                      ? 'bg-cyan-300 text-slate-950'
                      : 'text-indigo-100 hover:text-white'
                  }`}
                >
                  Lab &amp; Diagnostic Prep
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChecklist('maternity')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                    activeChecklist === 'maternity'
                      ? 'bg-emerald-300 text-slate-950'
                      : 'text-indigo-100 hover:text-white'
                  }`}
                >
                  Maternity &amp; Checkups
                </button>
              </div>
            </div>

            {activeChecklist === 'surgery' && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-rose-100">
                <li className="p-4 rounded-xl bg-rose-900/85 border border-rose-300/30">
                  <strong className="block text-white mb-1">
                    1. Medical History &amp; Prior Imaging
                  </strong>
                  Bring prior ultrasound films, X-rays, blood group results, and a written list of
                  daily medications.
                </li>
                <li className="p-4 rounded-xl bg-rose-900/85 border border-rose-300/30">
                  <strong className="block text-white mb-1">2. Upfront Estimate Review</strong>
                  Request your itemized surgical, anesthesia, and inpatient medication quote during
                  your pre-op consultation.
                </li>
                <li className="p-4 rounded-xl bg-rose-900/85 border border-rose-300/30">
                  <strong className="block text-white mb-1">3. Fasting Guidelines</strong>
                  If scheduled for a procedure under anesthesia, observe strict nil-by-mouth
                  instructions given by Dr. Nwosu.
                </li>
                <li className="p-4 rounded-xl bg-rose-900/85 border border-rose-300/30">
                  <strong className="block text-white mb-1">4. Escort &amp; Discharge Support</strong>
                  Arrange a trusted family member or support companion for post-operative discharge
                  transport.
                </li>
              </ul>
            )}

            {activeChecklist === 'diagnostic' && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-cyan-100">
                <li className="p-4 rounded-xl bg-cyan-900/85 border border-cyan-300/30">
                  <strong className="block text-white mb-1">
                    1. Confirm On-Site vs. Partner Lab Scope
                  </strong>
                  Call {HOSPITAL_PROFILE.phoneDisplay} prior to specialized imaging or complex
                  pathology panels to verify same-day on-site readiness.
                </li>
                <li className="p-4 rounded-xl bg-cyan-900/85 border border-cyan-300/30">
                  <strong className="block text-white mb-1">
                    2. Overnight Fasting (8–10 Hours)
                  </strong>
                  For fasting blood glucose or lipid panels, consume only plain water from 10:00 PM
                  the evening prior.
                </li>
                <li className="p-4 rounded-xl bg-cyan-900/85 border border-cyan-300/30">
                  <strong className="block text-white mb-1">3. Cardiac ECG Preparation</strong>
                  Avoid coffee, energy drinks, or heavy exercise for 2 hours prior to a resting
                  12-lead ECG.
                </li>
                <li className="p-4 rounded-xl bg-cyan-900/85 border border-cyan-300/30">
                  <strong className="block text-white mb-1">4. Results Turnaround</strong>
                  Provide an active email and phone number at registration for prompt physician
                  review of test results.
                </li>
              </ul>
            )}

            {activeChecklist === 'maternity' && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-100">
                <li className="p-4 rounded-xl bg-emerald-900/85 border border-emerald-300/30">
                  <strong className="block text-white mb-1">
                    1. Antenatal &amp; Immunization Cards
                  </strong>
                  Bring existing antenatal clinic cards or childhood immunization booklets for
                  accurate continuity of care.
                </li>
                <li className="p-4 rounded-xl bg-emerald-900/85 border border-emerald-300/30">
                  <strong className="block text-white mb-1">2. Visitor &amp; Ward Etiquette</strong>
                  One designated support companion is welcome during consultations; keep inpatient
                  corridors calm and smoke-free.
                </li>
                <li className="p-4 rounded-xl bg-emerald-900/85 border border-emerald-300/30">
                  <strong className="block text-white mb-1">3. Pharmacy &amp; Prescriptions</strong>
                  Confirm specific prescription availability with the nursing station or our Ogbor
                  Hill front desk before departure.
                </li>
                <li className="p-4 rounded-xl bg-emerald-900/85 border border-emerald-300/30">
                  <strong className="block text-white mb-1">4. Arrive 15 Minutes Early</strong>
                  Allow time for vitals triage, registration, and step-free parking access.
                </li>
              </ul>
            )}

            <div className="pt-4 border-t border-indigo-400/30 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-indigo-100">
                Questions about visiting hours, inpatient admissions, or HMO/card billing?
              </p>
              <Link
                to="/appointments"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-950 bg-orange-400 hover:bg-orange-300 rounded-lg transition-colors"
              >
                <span>Schedule Your Visit Online</span>
                <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </BackgroundSlideshow>
  );
}
