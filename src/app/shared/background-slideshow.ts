import {isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {BackdropSlide} from '../core/hospital-data';

@Component({
  selector: 'app-background-slideshow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative isolate min-h-screen overflow-x-clip">
      <!-- Fixed Full-Viewport Working Background Slideshow (Crystal Clear Top-to-Bottom) -->
      <div
        class="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-slate-900"
        aria-hidden="true"
      >
        @for (slide of slides(); track slide.id; let idx = $index) {
          <img
            [src]="slide.src"
            [alt]="slide.alt"
            referrerpolicy="no-referrer"
            class="absolute inset-0 w-full h-full object-cover object-[center_18%] transition-opacity duration-[1600ms] ease-in-out"
            [class]="[
              idx === activeIndex() ? 'opacity-100' : 'opacity-0',
              idx === activeIndex()
                ? (idx % 2 === 0 ? 'animate-kenburns-a' : 'animate-kenburns-b')
                : ''
            ]"
          />
        }

        <!-- Subtle directional daylight veil that keeps the background vividly visible while framing foreground cards -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-transparent to-slate-950/25"
        ></div>
      </div>

      <!-- Foreground Page Flow -->
      <div class="relative z-10">
        <ng-content />
      </div>
    </div>
  `,
})
export class BackgroundSlideshow implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly slides = input.required<readonly BackdropSlide[]>();
  readonly activeSlideId = input<string | null>(null);
  readonly intervalMs = input<number>(6000);

  readonly activeIndex = signal(0);

  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const requestedId = this.activeSlideId();
      const list = this.slides();
      if (!requestedId || list.length === 0) {
        return;
      }
      const matchIndex = list.findIndex((s) => s.id === requestedId);
      if (matchIndex >= 0) {
        this.activeIndex.set(matchIndex);
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerId = setInterval(() => {
      const total = this.slides().length;
      if (total > 1) {
        this.activeIndex.update((i) => (i + 1) % total);
      }
    }, this.intervalMs());
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
