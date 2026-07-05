'use client';

// Thin app-menu strip: decorative editor menus, the project name, a running
// free-run timecode — and the page's single <h1>.

import { useEffect, useRef } from 'react';
import { profile } from '@/data/profile';
import { useTheme } from '@/components/theme/ThemeProvider';
import { msToTimecode } from './assets';

const MENU_LABELS = ['File', 'Edit', 'Clip', 'Sequence', 'Markers', 'Graphics', 'Window', 'Help'];

export default function TopStrip() {
  const { reducedMotion } = useTheme();
  const tcRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = tcRef.current;
    if (!el) return;
    const start = performance.now();
    const paint = () => {
      el.textContent = msToTimecode(performance.now() - start);
    };

    if (reducedMotion) {
      // Dial the free-run clock down to once a second.
      const id = window.setInterval(paint, 1000);
      return () => window.clearInterval(id);
    }

    let raf = 0;
    const loop = () => {
      paint();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <div className="flex h-8 flex-none select-none items-center gap-4 border-b border-[#2c2c2c] bg-[#131313] px-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <h1 className="whitespace-nowrap text-xs font-semibold tracking-wide text-theme-fg">
          {profile.identity.name}
        </h1>
        <p className="hidden truncate text-[10px] text-theme-muted md:block">
          {profile.identity.titles.join(' · ')} — {profile.identity.org}
        </p>
      </div>

      <div aria-hidden className="hidden items-center gap-3 text-[11px] text-[#8c8c8c] lg:flex">
        {MENU_LABELS.map((label) => (
          <span key={label} className="cursor-default hover:text-[#c9c9c9]">
            {label}
          </span>
        ))}
      </div>

      <div className="ml-auto flex flex-none items-center gap-3">
        <span aria-hidden className="hidden font-mono text-[10px] text-theme-muted sm:block">
          taha_kothari_portfolio.prproj
        </span>
        <span
          ref={tcRef}
          aria-hidden
          className="font-mono text-[11px] tabular-nums text-theme-accent"
        >
          00:00:00:00
        </span>
      </div>
    </div>
  );
}
