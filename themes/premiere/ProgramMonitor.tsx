'use client';

// Program Monitor — screening room for the showcase reels. Prev/next reel
// selector (buttons + arrow keys), amber record dot, safe-margin overlays.

import { type CSSProperties, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { SkipBack, SkipForward } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { VideoEmbed } from '@/components/shared/VideoEmbed';
import PanelChrome from './PanelChrome';
import { PROGRAM_REELS } from './assets';
import styles from './premiere.module.css';

interface ProgramMonitorProps {
  reelIndex: number;
  onSelectReel: (index: number) => void;
  className?: string;
  style?: CSSProperties;
}

export default function ProgramMonitor({
  reelIndex,
  onSelectReel,
  className = '',
  style,
}: ProgramMonitorProps) {
  const { hydrated, reducedMotion } = useTheme();

  // Showcase reels + every pasted section video (see assets.ts).
  const reels = PROGRAM_REELS;
  const count = reels.length;

  // Owner-editable pool — guard total emptiness (avoids modulo-by-zero).
  if (count === 0) {
    return (
      <section
        aria-label="Program monitor — showcase screening room"
        className={`${styles.panel} ${className}`}
        style={style}
      >
        <PanelChrome title="Program Monitor" />
        <div className={styles.monitorArea}>
          <p className="m-auto max-w-xs px-6 text-center text-xs leading-relaxed text-theme-muted">
            Nothing cued — add showcase reels or paste links into{' '}
            <code className="font-mono">sectionVideos</code> in{' '}
            <code className="font-mono">data/profile.ts</code>.
          </p>
        </div>
      </section>
    );
  }

  const index = ((reelIndex % count) + count) % count;
  const reel = reels[index];

  const goPrev = () => onSelectReel((index - 1 + count) % count);
  const goNext = () => onSelectReel((index + 1) % count);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <section
      aria-label="Program monitor — showcase screening room"
      className={`${styles.panel} ${className}`}
      style={style}
    >
      <PanelChrome
        title="Program Monitor"
        right={
          <span aria-hidden className="font-mono text-[9px] tracking-wider text-theme-muted">
            FULL · 1/2
          </span>
        }
      />
      <h2 className="sr-only">Showcase</h2>

      <div className={styles.monitorArea}>
        <motion.div
          key={index}
          className={styles.monitorFit}
          initial={hydrated && !reducedMotion ? { opacity: 0.25 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
        >
          <VideoEmbed video={reel.video} title={reel.title} cover={reel.cover} />
          <div aria-hidden className={styles.safeMargins}>
            <span className={styles.safeOuter} />
            <span className={styles.safeInner} />
          </div>
          <div
            aria-hidden
            className="absolute left-2 top-2 z-20 flex items-center gap-1.5 rounded-sm bg-black/55 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-theme-accent"
          >
            <span className={styles.recDot} /> REC
          </div>
        </motion.div>
      </div>

      {/* Arrow keys work while focus is on either transport button. */}
      <div
        className="flex flex-none items-center gap-2 border-t border-[#2a2a2a] bg-[#1a1a1a] px-2 py-2"
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous reel"
          className="flex-none rounded-sm border border-[#3a3a3a] bg-[#2c2c2c] p-1.5 text-theme-fg transition-colors hover:border-[#3f8ae0] hover:text-white"
        >
          <SkipBack size={13} aria-hidden />
        </button>

        <div className="min-w-0 flex-1 text-center" aria-live="polite">
          <p className="truncate text-[12px] font-medium text-theme-fg">{reel.title}</p>
          <p className="truncate font-mono text-[9px] uppercase tracking-wider text-theme-muted">
            {reel.subtitle} · {String(index + 1).padStart(2, '0')} /{' '}
            {String(count).padStart(2, '0')}
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next reel"
          className="flex-none rounded-sm border border-[#3a3a3a] bg-[#2c2c2c] p-1.5 text-theme-fg transition-colors hover:border-[#3f8ae0] hover:text-white"
        >
          <SkipForward size={13} aria-hidden />
        </button>
      </div>
    </section>
  );
}
