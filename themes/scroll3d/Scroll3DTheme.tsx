'use client';

/**
 * Scroll3D theme — a continuous neon tunnel fly-through driven by scroll.
 *
 * 3D mode:   R3F <Canvas> + drei <ScrollControls>; the camera travels -Z with
 *            the damped scroll offset while content stations (plain DOM via
 *            <Scroll html>) fade/tilt through their scroll intervals.
 * Fallback:  when the visitor prefers reduced motion the Canvas is never
 *            mounted — the same seven stations render as an ordinary
 *            vertically-scrolling page.
 *
 * The shell guarantees desktop + WebGL for this theme (phones and no-WebGL
 * visitors are rerouted to Museum before this component mounts).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scroll, ScrollControls } from '@react-three/drei';
import { useTheme } from '@/components/theme/ThemeProvider';
import { TunnelScene } from './Tunnel';
import { STATIONS, Stations3D, StationsFlat } from './Stations';
import { ProgressRail } from './ProgressRail';
import styles from './scroll3d.module.css';

const LAST = STATIONS.length - 1;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function Scroll3DTheme() {
  const { reducedMotion } = useTheme();
  return reducedMotion ? <FlatExperience /> : <TunnelExperience />;
}

/* ------------------------------------------------------------------------ */
/* 3D fly-through                                                           */
/* ------------------------------------------------------------------------ */

function TunnelExperience() {
  const [active, setActive] = useState(0);
  const fillRef = useRef<HTMLDivElement>(null);
  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const focusCleanupRef = useRef<(() => void) | null>(null);

  /** Per-frame bridge out of the Canvas: HUD fill + active station index. */
  const handleFrame = useCallback((offset: number) => {
    const progress = clamp01(offset);
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleY(${progress.toFixed(4)})`;
    }
    const idx = Math.round(progress * LAST);
    setActive((prev) => (prev === idx ? prev : idx));
  }, []);

  /**
   * drei's ScrollControls owns two elements we care about:
   *  - `el`     the actual scroller (we jump/keyboard-drive it)
   *  - `fixed`  the sticky overflow-hidden box holding the DOM stations.
   * When keyboard focus lands on an off-screen station the browser scrolls
   * `fixed` (not `el`); we translate that into real `el` scroll so tabbing
   * through the page flies the camera instead of desyncing the layers.
   */
  const registerScroll = useCallback(
    (el: HTMLDivElement, fixed: HTMLDivElement) => {
      focusCleanupRef.current?.();
      scrollElRef.current = el;
      el.tabIndex = 0;
      el.setAttribute('role', 'region');
      el.setAttribute(
        'aria-label',
        'Portfolio fly-through — scroll or use arrow keys to travel between stations',
      );
      el.classList.add(styles.scroller);
      const onFixedScroll = () => {
        if (fixed.scrollTop !== 0) {
          el.scrollTop += fixed.scrollTop;
          fixed.scrollTop = 0;
        }
      };
      fixed.addEventListener('scroll', onFixedScroll, { passive: true });
      focusCleanupRef.current = () => {
        fixed.removeEventListener('scroll', onFixedScroll);
      };
    },
    [],
  );

  useEffect(
    () => () => {
      focusCleanupRef.current?.();
      focusCleanupRef.current = null;
      scrollElRef.current = null;
    },
    [],
  );

  // First-class keyboard flight: arrows nudge, PageUp/Down hop a station,
  // Home/End jump to the ends. Never fights text fields or modified keys.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const el = scrollElRef.current;
      if (!el) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }
      const max = el.scrollHeight - el.clientHeight;
      const station = max / LAST;
      let next: number;
      switch (event.key) {
        case 'ArrowDown':
          next = el.scrollTop + 120;
          break;
        case 'ArrowUp':
          next = el.scrollTop - 120;
          break;
        case 'PageDown':
          next = el.scrollTop + station;
          break;
        case 'PageUp':
          next = el.scrollTop - station;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = max;
          break;
        default:
          return;
      }
      event.preventDefault();
      el.scrollTop = Math.min(max, Math.max(0, next));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Instant scrollTop set — ScrollControls' damping turns it into a glide.
  const jumpTo = useCallback((index: number) => {
    const el = scrollElRef.current;
    if (!el) return;
    el.scrollTop = ((el.scrollHeight - el.clientHeight) * index) / LAST;
  }, []);

  return (
    <div className="relative h-full w-full bg-[#070b16]">
      <Canvas
        dpr={[1, 2]}
        flat
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 60, near: 0.1, far: 260, position: [0, 0, 6] }}
      >
        <ScrollControls pages={STATIONS.length} damping={0.2}>
          <TunnelScene onFrame={handleFrame} registerScroll={registerScroll} />
          <Scroll html style={{ width: '100%' }}>
            <Stations3D />
          </Scroll>
        </ScrollControls>
      </Canvas>

      {/* Decorative overlays — above drei's scroller, never intercept input. */}
      <div className={`${styles.vignette} z-10`} aria-hidden />
      <div className={`${styles.scanlines} z-10`} aria-hidden />

      <ProgressRail
        stations={STATIONS}
        active={active}
        onJump={jumpTo}
        fillRef={fillRef}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Reduced-motion fallback: same stations, ordinary page scroll, no WebGL   */
/* ------------------------------------------------------------------------ */

function FlatExperience() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const registerSection = useCallback((index: number, el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const progress = max > 0 ? clamp01(el.scrollTop / max) : 0;
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleY(${progress.toFixed(4)})`;
    }
    const mid = el.scrollTop + el.clientHeight * 0.45;
    let idx = 0;
    sectionRefs.current.forEach((section, i) => {
      if (section && section.offsetTop <= mid) idx = i;
    });
    setActive((prev) => (prev === idx ? prev : idx));
  }, []);

  // Initialize fill/active once sections have laid out.
  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  const jumpTo = useCallback((index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="region"
        aria-label="Portfolio stations"
        className={`${styles.flatBg} ${styles.scroller} relative h-full w-full overflow-y-auto`}
      >
        <StationsFlat registerSection={registerSection} />
      </div>
      <ProgressRail
        stations={STATIONS}
        active={active}
        onJump={jumpTo}
        fillRef={fillRef}
      />
    </div>
  );
}
