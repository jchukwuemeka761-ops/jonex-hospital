import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <header class="sticky top-0 z-40 bg-white/92 backdrop-blur-md border-b border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <a
          routerLink="/"
          (click)="closeMenu()"
          class="font-display text-xl font-bold tracking-tight text-[#0F2942] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        >
          Jonex Hospital
        </a>

        <nav
          aria-label="Primary navigation"
          class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            routerLink="/services"
            routerLinkActive="text-[#0F2942] underline underline-offset-8 decoration-2 decoration-teal-700"
            class="hover:text-[#0F2942] hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Services &amp; Infrastructure
          </a>
          <a
            routerLink="/doctors"
            routerLinkActive="text-[#0F2942] underline underline-offset-8 decoration-2 decoration-teal-700"
            class="hover:text-[#0F2942] hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Find a Doctor
          </a>
          <a
            routerLink="/appointments"
            routerLinkActive="text-[#0F2942] underline underline-offset-8 decoration-2 decoration-teal-700"
            class="hover:text-[#0F2942] hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Appointments
          </a>
          <a
            routerLink="/"
            fragment="about"
            class="hover:text-[#0F2942] hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            About
          </a>
          <a
            routerLink="/patients-and-visitors"
            routerLinkActive="text-[#0F2942] underline underline-offset-8 decoration-2 decoration-teal-700"
            class="hover:text-[#0F2942] hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Patients &amp; Visitors
          </a>
        </nav>

        <div class="flex items-center gap-3 shrink-0">
          <a
            routerLink="/appointments"
            class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F2942] hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">calendar_today</mat-icon>
            <span>Book Appointment</span>
          </a>

          <button
            type="button"
            (click)="toggleMenu()"
            [attr.aria-expanded]="mobileOpen()"
            aria-controls="mobile-nav-drawer"
            aria-label="Toggle navigation menu"
            class="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <mat-icon>{{ mobileOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      @if (mobileOpen()) {
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          class="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2"
        >
          <a
            routerLink="/services"
            (click)="closeMenu()"
            class="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Services &amp; Infrastructure
          </a>
          <a
            routerLink="/doctors"
            (click)="closeMenu()"
            class="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Find a Doctor
          </a>
          <a
            routerLink="/appointments"
            (click)="closeMenu()"
            class="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Appointments
          </a>
          <a
            routerLink="/"
            fragment="about"
            (click)="closeMenu()"
            class="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            About &amp; Directors
          </a>
          <a
            routerLink="/patients-and-visitors"
            (click)="closeMenu()"
            class="block px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Patients &amp; Visitors
          </a>
          <div class="pt-2">
            <a
              routerLink="/appointments"
              (click)="closeMenu()"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#0F2942] rounded-lg"
            >
              <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">calendar_today</mat-icon>
              <span>Book Appointment</span>
            </a>
          </div>
        </nav>
      }
    </header>
  `,
})
export class SiteHeader {
  readonly mobileOpen = signal(false);

  toggleMenu(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.mobileOpen.set(false);
  }
}
