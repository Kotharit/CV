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
import {
  ChevronLeft,
  ChevronRight,
  FileVideo,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react';
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
  /**
   * Suppression window: content swaps rewind the scroll container, and the
   * browser may fire clamp-generated scroll events *before* our effect runs
   * (layout clamps scrollTop synchronously on commit). Any scroll event
   * inside this window updates the scrubber UI but must not drive the
   * timeline playhead — the selection handler has already positioned it.
   */
  const suppressUntilRef = useRef(0);

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
      if (performance.now() < suppressUntilRef.current) return;
      onScrollProgress(fraction);
    });
  }, [onScrollProgress]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // New clip loaded: rewind the content area + scrubber without letting the
  // reset (or the browser's own scrollTop clamping) move the playhead.
  useEffect(() => {
    suppressUntilRef.current = performance.now() + 200;
    const el = scrollRef.current;
    if (el && el.scrollTop > 0) el.scrollTop = 0;
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
        {/*
          No key-based remount here: all ~25 CV panels stay permanently
          mounted (SEO + focus continuity); the reveal animation is a CSS
          keyframe on each panel that restarts when its hidden attr flips.
        */}
        <SourcePanels activeId={activeId} onOpenPanel={onOpenPanel} onCueReel={onCueReel} />
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
