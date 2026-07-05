'use client';

/**
 * Fixed HUD: vertical progress rail with one glowing dot per station and a
 * "0N / 07" counter. Purely presentational — the theme shell owns the scroll
 * state and mutates `fillRef` imperatively (no re-render per frame).
 */

import type { RefObject } from 'react';
import styles from './scroll3d.module.css';

interface ProgressRailProps {
  stations: readonly { id: string; label: string }[];
  active: number;
  onJump: (index: number) => void;
  /** The gradient fill bar; parent sets `transform: scaleY(progress)`. */
  fillRef: RefObject<HTMLDivElement>;
}

export function ProgressRail({ stations, active, onJump, fillRef }: ProgressRailProps) {
  return (
    <nav
      aria-label="Portfolio stations"
      className="pointer-events-none absolute right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center"
    >
      <div className={styles.rail}>
        <div className={styles.railTrack} aria-hidden />
        <div ref={fillRef} className={styles.railFill} aria-hidden />
        <ol className={styles.dotList}>
          {stations.map((station, i) => (
            <li key={station.id} className="flex">
              <button
                type="button"
                onClick={() => onJump(i)}
                className={`${styles.dot} ${i === active ? styles.dotActive : ''} pointer-events-auto`}
                aria-label={`Fly to station ${i + 1} of ${stations.length}: ${station.label}`}
                aria-current={i === active ? 'true' : undefined}
              >
                <span className={styles.dotLabel} aria-hidden>
                  {station.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-4 select-none font-mono text-[11px] tracking-[0.2em] text-theme-muted">
        <span className="text-theme-accent">
          {String(active + 1).padStart(2, '0')}
        </span>{' '}
        / {String(stations.length).padStart(2, '0')}
      </p>
    </nav>
  );
}
