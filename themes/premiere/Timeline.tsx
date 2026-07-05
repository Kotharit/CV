'use client';

// Timeline — multi-track mockup fed by profile.milestones. Clips select a
// milestone panel in the Source Monitor and snap the playhead to their start;
// the playhead itself is a draggable/keyboard-operable slider whose position
// is also driven by the Source Monitor's scroll depth (via the exposed
// imperative handle — no React re-renders on the hot path).

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { Eye, Lock } from 'lucide-react';
import { TRACK_LABELS, profile, type TrackId } from '@/data/profile';
import PanelChrome from './PanelChrome';
import {
  RULER_YEARS,
  SEQUENCE_FRAMES,
  framesToTimecode,
  milestonePanelId,
  waveformPath,
  yearLabelAtFraction,
  yearTickFraction,
  type MilestoneEntry,
} from './assets';
import styles from './premiere.module.css';

export interface TimelineHandle {
  setPlayhead: (fraction: number) => void;
}

interface TimelineProps {
  activeId: string;
  onSelectMilestone: (milestone: MilestoneEntry) => void;
  className?: string;
  style?: CSSProperties;
}

const TRACK_ORDER: readonly TrackId[] = ['V3', 'V2', 'V1', 'A1'];

const TRACK_COLORS: Record<TrackId, string> = {
  V3: '#5d4e9e', // film/video — violet
  V2: '#38598a', // tech — steel blue
  V1: '#2e6b66', // education — teal
  A1: '#3c6b4f', // marketing — audio green
};

const Timeline = forwardRef<TimelineHandle, TimelineProps>(function Timeline(
  { activeId, onSelectMilestone, className = '', style },
  ref,
) {
  const laneAreaRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const handleElRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const fractionRef = useRef(0);
  const draggingRef = useRef(false);

  const apply = useCallback((raw: number) => {
    const fraction = Math.min(1, Math.max(0, raw));
    fractionRef.current = fraction;
    const pct = `${(fraction * 100).toFixed(3)}%`;
    if (playheadRef.current) playheadRef.current.style.left = pct;
    if (tcRef.current) tcRef.current.textContent = framesToTimecode(fraction * SEQUENCE_FRAMES);
    const yearLabel = yearLabelAtFraction(fraction);
    if (yearRef.current) yearRef.current.textContent = yearLabel;
    const handle = handleElRef.current;
    if (handle) {
      handle.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
      handle.setAttribute('aria-valuetext', yearLabel);
    }
  }, []);

  useImperativeHandle(ref, () => ({ setPlayhead: apply }), [apply]);

  const byTrack = useMemo(() => {
    const groups: Record<TrackId, MilestoneEntry[]> = { V3: [], V2: [], V1: [], A1: [] };
    for (const milestone of profile.milestones) groups[milestone.track].push(milestone);
    return groups;
  }, []);

  const fractionFromClientX = useCallback((clientX: number) => {
    const rect = laneAreaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return (clientX - rect.left) / rect.width;
  }, []);

  // Pointer capture keeps the drag on the originating element — no window
  // listeners to leak.
  const startDrag = (e: PointerEvent<HTMLElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(fractionFromClientX(e.clientX));
  };
  const moveDrag = (e: PointerEvent<HTMLElement>) => {
    if (draggingRef.current) apply(fractionFromClientX(e.clientX));
  };
  const endDrag = () => {
    draggingRef.current = false;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    let next = fractionRef.current;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next -= step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next += step;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    apply(next);
  };

  return (
    <section
      aria-label="Career timeline"
      className={`${styles.panel} ${className}`}
      style={style}
    >
      <PanelChrome title="Timeline: taha_kothari_portfolio" />
      <h2 className="sr-only">Career Milestones</h2>

      <div className="grid min-h-0 flex-1 grid-cols-[148px_minmax(0,1fr)]">
        {/* Track heads ---------------------------------------------------- */}
        <div className="flex min-w-0 flex-col border-r border-[#0e0e0e]">
          <div className="flex h-7 flex-none items-baseline gap-2 border-b border-[#0e0e0e] bg-[#1a1a1a] px-2">
            <span
              ref={tcRef}
              aria-hidden
              className="font-mono text-[11px] leading-7 tabular-nums text-theme-accent"
            >
              00:00:00:00
            </span>
            <span
              ref={yearRef}
              aria-hidden
              className="hidden truncate font-mono text-[9px] text-theme-muted lg:inline"
            >
              Jan 2021
            </span>
          </div>
          {TRACK_ORDER.map((track) => (
            <div
              key={track}
              className="flex min-h-0 flex-1 items-center gap-1.5 border-b border-[#0e0e0e] bg-[#1e1e1e] px-2"
            >
              <span className="w-5 flex-none font-mono text-[10px] font-semibold text-theme-fg">
                {track}
              </span>
              <span aria-hidden className="flex flex-none items-center gap-1 text-[#5f5f5f]">
                <Eye size={10} />
                <Lock size={10} />
              </span>
              <span className="min-w-0 truncate text-[10px] text-theme-muted">
                {TRACK_LABELS[track]}
              </span>
            </div>
          ))}
        </div>

        {/* Ruler + lanes + playhead --------------------------------------- */}
        <div ref={laneAreaRef} className="relative flex min-w-0 flex-col">
          <div
            aria-hidden
            className={styles.ruler}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {RULER_YEARS.map((year) => (
              <span
                key={year}
                className="absolute bottom-0 top-0 border-l border-[#4a4a4a] pl-1 font-mono text-[9px] leading-[22px] text-theme-muted"
                style={{ left: `${(yearTickFraction(year) * 100).toFixed(3)}%` }}
              >
                {year}
              </span>
            ))}
          </div>

          <div className={styles.lanes}>
            {TRACK_ORDER.map((track) => (
              <div
                key={track}
                className={`relative min-h-0 flex-1 border-b border-[#141414] ${
                  track === 'A1' ? styles.laneAudio : styles.laneVideo
                }`}
              >
                {byTrack[track].map((milestone) => {
                  const selected = activeId === milestonePanelId(milestone);
                  return (
                    <button
                      key={milestone.id}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${milestone.title} — ${milestone.period} — ${TRACK_LABELS[track]}`}
                      title={`${milestone.title} · ${milestone.period}`}
                      onClick={() => {
                        apply(milestone.start);
                        onSelectMilestone(milestone);
                      }}
                      className={`${styles.clip} ${
                        track === 'A1' ? styles.clipAudio : styles.clipVideo
                      } ${selected ? styles.clipSelected : ''}`}
                      style={
                        {
                          left: `${(milestone.start * 100).toFixed(3)}%`,
                          width: `${(milestone.length * 100).toFixed(3)}%`,
                          '--clip-c': TRACK_COLORS[track],
                        } as CSSProperties
                      }
                    >
                      <span className={styles.clipName}>
                        <span>{milestone.title}</span>
                        <span className={styles.clipFx} aria-hidden>
                          fx
                        </span>
                      </span>
                      {track === 'A1' ? (
                        <svg
                          aria-hidden
                          focusable="false"
                          className={styles.wave}
                          viewBox="0 0 100 24"
                          preserveAspectRatio="none"
                        >
                          <path d={waveformPath(milestone.id)} fill="rgba(214, 245, 222, 0.5)" />
                        </svg>
                      ) : (
                        <span className={styles.clipPeriod} aria-hidden>
                          {milestone.period}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Playhead spans ruler + lanes */}
          <div ref={playheadRef} className={styles.playhead} style={{ left: '0%' }}>
            <div
              ref={handleElRef}
              role="slider"
              tabIndex={0}
              aria-label="Timeline playhead"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              aria-valuetext="Jan 2021"
              className={styles.playheadHandle}
              onKeyDown={handleKeyDown}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

export default Timeline;
