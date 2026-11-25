import {useEffect, useState, type ReactNode} from 'react';
import type {BackdropSlide} from '../core/hospital-data.ts';

interface BackgroundSlideshowProps {
  readonly slides: readonly BackdropSlide[];
  readonly activeSlideId?: string | null;
  readonly intervalMs?: number;
  readonly children: ReactNode;
}

export function BackgroundSlideshow({
  slides,
  activeSlideId = null,
  intervalMs = 6000,
  children,
}: BackgroundSlideshowProps) {
  const [autoIndex, setAutoIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, intervalMs]);

  const requestedIndex =
    activeSlideId && slides.length > 0
      ? slides.findIndex((s) => s.id === activeSlideId)
      : -1;
  const activeIndex =
    requestedIndex >= 0
      ? requestedIndex
      : slides.length > 0
        ? autoIndex % slides.length
        : 0;

  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <div
        className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-slate-900"
        aria-hidden="true"
      >
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          const animClass = isActive
            ? idx % 2 === 0
              ? 'animate-kenburns-a'
              : 'animate-kenburns-b'
            : '';
          return (
            <img
              key={slide.id}
              src={slide.src}
              alt={slide.alt}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-[center_18%] transition-opacity duration-[1600ms] ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              } ${animClass}`}
            />
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-transparent to-slate-950/25" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
