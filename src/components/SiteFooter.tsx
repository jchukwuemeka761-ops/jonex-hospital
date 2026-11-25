import {Phone} from 'lucide-react';
import {Link} from 'react-router-dom';
import {HOSPITAL_PROFILE} from '../core/hospital-data.ts';

export function SiteFooter() {
  return (
    <footer className="relative z-10 bg-white/95 border-t border-slate-200 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-200">
          <div className="space-y-3">
            <p className="font-display text-lg font-bold text-[#0F2942]">{HOSPITAL_PROFILE.name}</p>
            <p className="text-sm leading-relaxed text-slate-600">
              {HOSPITAL_PROFILE.bedsCount}-bed, {HOSPITAL_PROFILE.doctorsCount}-doctor{' '}
              {HOSPITAL_PROFILE.accreditation} private healthcare center serving Ogbor Hill, Aba, and
              Abia State 24 hours a day.
            </p>
            <p className="text-xs text-slate-500">
              {HOSPITAL_PROFILE.legalName} · CAC {HOSPITAL_PROFILE.cacRegistration} (Inc.{' '}
              {HOSPITAL_PROFILE.incorporatedDate})
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-display text-sm font-semibold text-slate-900">Ogbor Hill Facility</p>
            <p className="text-sm leading-relaxed">{HOSPITAL_PROFILE.primaryAddress}</p>
            <p className="text-xs text-slate-500">
              Corporate Registry Office: {HOSPITAL_PROFILE.corporateRegistryAddress}
            </p>
            <a
              href={HOSPITAL_PROFILE.phoneHref}
              className="inline-flex items-center gap-2 text-sm font-mono font-semibold text-[#0F2942] hover:text-teal-700 transition-colors pt-1"
            >
              <Phone className="w-[17px] h-[17px]" aria-hidden="true" />
              <span className="tabular-nums">{HOSPITAL_PROFILE.phoneDisplay}</span>
            </a>
          </div>

          <div className="space-y-3">
            <p className="font-display text-sm font-semibold text-slate-900">
              Care &amp; Navigation
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/appointments"
                  className="hover:text-[#0F2942] hover:underline underline-offset-4"
                >
                  Book Surgery, Checkup or Lab Test
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors"
                  className="hover:text-[#0F2942] hover:underline underline-offset-4"
                >
                  Find a Doctor &amp; Book a Session
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-[#0F2942] hover:underline underline-offset-4"
                >
                  Services &amp; Hospital Infrastructure
                </Link>
              </li>
              <li>
                <Link
                  to="/#about"
                  className="hover:text-[#0F2942] hover:underline underline-offset-4"
                >
                  About Us &amp; Executive Directors
                </Link>
              </li>
              <li>
                <Link
                  to="/patients-and-visitors"
                  className="hover:text-[#0F2942] hover:underline underline-offset-4"
                >
                  Patients, Visitors &amp; Map Directions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-display text-sm font-semibold text-slate-900">
              Quick Facts &amp; Access
            </p>
            <p className="text-sm font-medium text-slate-800">{HOSPITAL_PROFILE.hoursPrimary}</p>
            <p className="text-xs leading-relaxed text-slate-500">
              {HOSPITAL_PROFILE.hoursClinicNote}
            </p>
            <p className="text-xs leading-relaxed text-slate-600 pt-1">
              Languages: English &amp; Igbo · Wheelchair entry &amp; parking · Credit, debit &amp;
              NFC mobile payments.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 {HOSPITAL_PROFILE.legalName} · CAC {HOSPITAL_PROFILE.cacRegistration} · Ebenma
            Street, Ogbor Hill, Aba.
          </p>
          <p>
            24/7 Clinical Reception &amp; Direct Telephone Confirmation:{' '}
            {HOSPITAL_PROFILE.phoneDisplay}
          </p>
        </div>
      </div>
    </footer>
  );
}
