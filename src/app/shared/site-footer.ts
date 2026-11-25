import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {HOSPITAL_PROFILE} from '../core/hospital-data';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="relative z-10 bg-white/94 backdrop-blur-md border-t border-slate-200 text-slate-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-200">
          <div class="space-y-3">
            <p class="font-display text-lg font-bold text-[#0F2942]">{{ hospital.name }}</p>
            <p class="text-sm leading-relaxed text-slate-600">
              {{ hospital.bedsCount }}-bed, {{ hospital.doctorsCount }}-doctor HAS Accredited private healthcare center serving Ogbor Hill, Aba, and Abia State 24 hours a day.
            </p>
            <p class="text-xs text-slate-500">
              {{ hospital.legalName }} · CAC {{ hospital.cacRegistration }} (Inc. {{ hospital.incorporatedDate }})
            </p>
          </div>

          <div class="space-y-3">
            <p class="font-display text-sm font-semibold text-slate-900">Ogbor Hill Facility</p>
            <p class="text-sm leading-relaxed">{{ hospital.primaryAddress }}</p>
            <p class="text-xs text-slate-500">
              Corporate Registry Office: {{ hospital.corporateRegistryAddress }}
            </p>
            <a
              [href]="hospital.phoneHref"
              class="inline-flex items-center gap-2 text-sm font-mono font-semibold text-[#0F2942] hover:text-teal-700 transition-colors pt-1"
            >
              <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">call</mat-icon>
              <span class="tabular-nums">{{ hospital.phoneDisplay }}</span>
            </a>
          </div>

          <div class="space-y-3">
            <p class="font-display text-sm font-semibold text-slate-900">Care &amp; Navigation</p>
            <ul class="space-y-2 text-sm">
              <li>
                <a routerLink="/appointments" class="hover:text-[#0F2942] hover:underline underline-offset-4">
                  Book Surgery, Checkup or Lab Test
                </a>
              </li>
              <li>
                <a routerLink="/doctors" class="hover:text-[#0F2942] hover:underline underline-offset-4">
                  Find a Doctor &amp; Book a Session
                </a>
              </li>
              <li>
                <a routerLink="/services" class="hover:text-[#0F2942] hover:underline underline-offset-4">
                  Services &amp; Hospital Infrastructure
                </a>
              </li>
              <li>
                <a routerLink="/" fragment="about" class="hover:text-[#0F2942] hover:underline underline-offset-4">
                  About Us &amp; Executive Directors
                </a>
              </li>
              <li>
                <a routerLink="/patients-and-visitors" class="hover:text-[#0F2942] hover:underline underline-offset-4">
                  Patients, Visitors &amp; Map Directions
                </a>
              </li>
            </ul>
          </div>

          <div class="space-y-3">
            <p class="font-display text-sm font-semibold text-slate-900">Quick Facts &amp; Access</p>
            <p class="text-sm font-medium text-slate-800">{{ hospital.hoursPrimary }}</p>
            <p class="text-xs leading-relaxed text-slate-500">{{ hospital.hoursClinicNote }}</p>
            <p class="text-xs leading-relaxed text-slate-600 pt-1">
              Languages: English &amp; Igbo · Wheelchair entry &amp; parking · Credit, debit &amp; NFC mobile payments.
            </p>
          </div>
        </div>

        <div class="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 {{ hospital.legalName }} · CAC {{ hospital.cacRegistration }} · Ebenma Street, Ogbor Hill, Aba.</p>
          <p>24/7 Clinical Reception &amp; Direct Telephone Confirmation: {{ hospital.phoneDisplay }}</p>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  readonly hospital = HOSPITAL_PROFILE;
}
