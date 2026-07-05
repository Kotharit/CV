'use client';

// Source Monitor — shows the selected asset/milestone as a "clip".
// The content area's scroll depth drives the Timeline playhead (rAF-throttled)
// and the footer scrubber/timecode, all updated imperatively so scrolling
// never re-renders React.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  FileVideo,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import PanelChrome from './PanelChrome';
import SourcePanels from './SourcePanels';
import { framesToTimecode, getPanelMeta } from './assets';
import styles from './premiere.module.css';

interface SourceMonitorProps {
  activeId: string;
  onScrollProgress: (fraction: number) => void;
  onOpenPanel: (panelId: string) => void;
  onCueReel: (index: number) => void;
  className?: string;
  style?: CSSProperties;
}

export default function SourceMonitor({
  activeId,
  onScrollProgress,
  onOpenPanel,
  onCueReel,
  className = '',
  style,
}: SourceMonitorProps) {
  const { hydrated, reducedMotion } = useTheme();

  const meta = useMemo(() => getPanelMeta(activeId), [activeId]);
  const metaRef = useRef(meta);
  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const currentTcRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  /** One-shot guard: programmatic scroll resets must not move the playhead. */
  const suppressRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = scrollRef.current;
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      const fraction = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      const pct = `${(fraction * 100).toFixed(2)}%`;
      if (fillRef.current) fillRef.current.style.width = pct;
      if (knobRef.current) knobRef.current.style.left = pct;
      if (currentTcRef.current) {
        currentTcRef.current.textContent = framesToTimecode(
          metaRef.current.inFrames + fraction * metaRef.current.durFrames,
        );
      }
      if (suppressRef.current) {
        suppressRef.current = false;
        return;
      }
      onScrollProgress(fraction);
    });
  }, [onScrollProgress]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // New clip loaded: rewind the content area + scrubber without touching
  // the timeline playhead (a clip click has already snapped it).
  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollTop > 0) {
      suppressRef.current = true;
      el.scrollTop = 0;
    }
    if (fillRef.current) fillRef.current.style.width = '0%';
    if (knobRef.current) knobRef.current.style.left = '0%';
    if (currentTcRef.current) {
      currentTcRef.current.textContent = framesToTimecode(getPanelMeta(activeId).inFrames);
    }
  }, [activeId]);

  return (
    <section aria-label="Source monitor — section content" className={`${styles.panel} ${className}`} style={style}>
      <PanelChrome title="Source Monitor" />

      {/* Clip strip: name + in/out timecodes */}
      <div className="flex flex-none items-center gap-3 border-b border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5">
        <FileVideo size={12} aria-hidden className="flex-none text-theme-muted" />
        <span className="min-w-0 truncate font-mono text-[11px] text-theme-fg">
          {meta.fileName}
        </span>
        <span
          aria-hidden
          className="ml-auto hidden flex-none gap-3 font-mono text-[9px] tabular-nums text-theme-muted xl:flex"
        >
          <span>
            <span className="text-[#5f5f5f]">IN </span>
            {framesToTimecode(meta.inFrames)}
          </span>
          <span>
            <span className="text-[#5f5f5f]">OUT </span>
            {framesToTimecode(meta.outFrames)}
          </span>
        </span>
      </div>

      {/* Scrollable clip content — every CV section stays mounted inside. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="region"
        aria-label="Selected section content"
        className={`${styles.scrollArea} min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#191919]`}
      >
        <motion.div
          key={activeId}
          initial={hydrated && !reducedMotion ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
        >
          <SourcePanels activeId={activeId} onOpenPanel={onOpenPanel} onCueReel={onCueReel} />
        </motion.div>
      </div>

      {/* Scrubber + fake transport (decorative) */}
      <div className="flex-none border-t border-[#2a2a2a] bg-[#1a1a1a] px-3 pb-1.5 pt-2">
        <div className={styles.scrubber} aria-hidden>
          <div ref={fillRef} className={styles.scrubberFill} />
          <div ref={knobRef} className={styles.scrubberKnob} />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            ref={currentTcRef}
            aria-hidden
            className="font-mono text-[11px] tabular-nums text-[#4da3ff]"
          >
            {framesToTimecode(meta.inFrames)}
          </span>
          <span aria-hidden className="flex items-center gap-2.5 text-theme-muted">
            <SkipBack size={13} />
            <ChevronLeft size={14} />
            <Play size={14} className="text-theme-fg" />
            <ChevronRight size={14} />
            <SkipForward size={13} />
          </span>
          <span aria-hidden className="font-mono text-[11px] tabular-nums text-theme-muted">
            {framesToTimecode(meta.durFrames)}
          </span>
        </div>
      </div>
    </section>
  );
}
