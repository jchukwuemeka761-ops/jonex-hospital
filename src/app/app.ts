import {isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HospitalAssistant} from './shared/hospital-assistant';
import {SiteFooter} from './shared/site-footer';
import {SiteHeader} from './shared/site-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter, HospitalAssistant],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly quotaExceeded = signal(false);

  private readonly onQuotaExceeded = (): void => {
    this.quotaExceeded.set(true);
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('gmp-quota-exceeded', this.onQuotaExceeded);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('gmp-quota-exceeded', this.onQuotaExceeded);
    }
  }
}

