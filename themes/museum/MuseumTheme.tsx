'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { ROOMS } from './Rooms';
import styles from './museum.module.css';

/**
 * Museum — minimalist linear gallery.
 * Desktop: full-viewport rooms in a horizontal scroll-snap track (wheel,
 * swipe, arrow keys, prev/next controls, room dots). Mobile (<768px): the
 * same rooms stacked vertically — this doubles as the site-wide fallback,
 * so CV content is readable immediately with zero WebGL required.
 */
export default function MuseumTheme() {
  const { isMobile, reducedMotion } = useTheme();

  if (isMobile) return <VerticalGallery />;
  return <HorizontalGallery reducedMotion={reducedMotion} />;
}

/* ------------------------------------------------------------------ mobile */

function VerticalGallery() {
  return (
    <div
      data-gallery-root
      className={`${styles.roomScroll} h-full w-full overflow-y-auto`}
      role="region"
      aria-label="Gallery"
    >
      {ROOMS.map((room) => (
        <section
          key={room.id}
          aria-label={room.name}
          className={`${room.dark ? styles.screeningRoom : styles.room} px-5 py-14 sm:px-8`}
        >
          <div className="mx-auto max-w-2xl">
            <room.Component />
          </div>
        </section>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- desktop */

function HorizontalGallery({ reducedMotion }: { reducedMotion: boolean }) {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);

  // Track the active room from scroll position (rAF-throttled).
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        setCurrent(Math.max(0, Math.min(ROOMS.length - 1, idx)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Vertical wheel gestures STEP between rooms. Free scrolling
  // (scrollLeft += deltaY) is impossible on a snap-mandatory track: the
  // browser re-snaps every programmatic scroll to the nearest snap point,
  // so a ~100px wheel tick just twitches and lands back on the same room.
  // Instead, deltas accumulate (normalized across deltaMode) until they
  // express clear intent, then the gallery advances exactly one room.
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    let intent = 0;
    let lastWheel = 0;
    let lastStep = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // native horizontal
      const roomScroll = (e.target as HTMLElement).closest<HTMLElement>('[data-room-scroll]');
      if (roomScroll) {
        const canScrollDown =
          e.deltaY > 0 &&
          roomScroll.scrollTop + roomScroll.clientHeight < roomScroll.scrollHeight - 1;
        const canScrollUp = e.deltaY < 0 && roomScroll.scrollTop > 0;
        if (canScrollDown || canScrollUp) return; // let the wall text scroll
      }
      e.preventDefault();
      const now = performance.now();
      if (now - lastStep < 450) return; // one room per gesture while gliding
      if (now - lastWheel > 300) intent = 0; // stale intent decays
      lastWheel = now;
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      intent += e.deltaY * scale;
      if (Math.abs(intent) < 60) return;
      const dir = intent > 0 ? 1 : -1;
      intent = 0;
      lastStep = now;
      const index = Math.round(el.scrollLeft / el.clientWidth);
      const next = Math.max(0, Math.min(ROOMS.length - 1, index + dir));
      el.scrollTo({
        left: next * el.clientWidth,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [reducedMotion]);

  const goTo = useCallback(
    (index: number) => {
      const el = galleryRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(ROOMS.length - 1, index));
      el.scrollTo({
        left: clamped * el.clientWidth,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    },
    [reducedMotion],
  );

  return (
    <div className="relative h-full w-full">
      <div
        ref={galleryRef}
        data-gallery-root
        tabIndex={0}
        role="region"
        aria-label="Gallery — scroll horizontally through the rooms"
        className={`${styles.gallery} flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden`}
      >
        {ROOMS.map((room) => (
          <section
            key={room.id}
            aria-label={room.name}
            className={`${room.dark ? styles.screeningRoom : styles.room} h-full w-full shrink-0 snap-start`}
          >
            <div
              data-room-scroll
              className={`${styles.roomScroll} h-full overflow-y-auto px-10 pb-32 pt-14 lg:px-16`}
            >
              <div className="mx-auto max-w-6xl">
                <room.Component />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Gallery wayfinding — prev/next + room placard with dots. */}
      <nav
        aria-label="Gallery rooms"
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-5"
      >
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          aria-label="Previous room"
          className={`${styles.controlBtn} pointer-events-auto`}
        >
          <ChevronLeft size={18} aria-hidden />
        </button>

        <div className={`${styles.placard} pointer-events-auto`}>
          <span className="text-[10px] uppercase tracking-[0.3em] text-theme-muted">
            {String(current + 1).padStart(2, '0')} · {ROOMS[current].name}
          </span>
          <div className="flex items-center gap-2">
            {ROOMS.map((room, i) => (
              <button
                key={room.id}
                type="button"
                aria-label={`Room ${i + 1}: ${room.name}`}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => goTo(i)}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={current === ROOMS.length - 1}
          aria-label="Next room"
          className={`${styles.controlBtn} pointer-events-auto`}
        >
          <ChevronRight size={18} aria-hidden />
        </button>
      </nav>
    </div>
  );
}
