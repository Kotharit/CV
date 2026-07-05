'use client';

// Premiere theme — hero/default view. A pixel-inspired tribute to a dark
// NLE workspace: Project bin (nav) · Source Monitor (content) · Program
// Monitor (reels) · multi-track Timeline (milestones).
//
// This theme is statically imported and SERVER-RENDERED: it contains no
// WebGL, touches window/document only inside effects, and keeps every CV
// section mounted in the DOM (Source Monitor tabpanels toggle with the
// hidden attribute) so crawlers and no-JS visitors get the full CV.

import { useCallback, useRef, useState, type CSSProperties } from 'react';
import TopStrip from './TopStrip';
import ProjectPanel from './ProjectPanel';
import SourceMonitor from './SourceMonitor';
import ProgramMonitor from './ProgramMonitor';
import Timeline, { type TimelineHandle } from './Timeline';
import { milestonePanelId, type ClipAsset, type MilestoneEntry } from './assets';
import styles from './premiere.module.css';

const SHOWCASE_PREFIX = 'showcase-';

function enterDelay(ms: number): CSSProperties {
  return { '--enter-delay': `${ms}ms` } as CSSProperties;
}

export default function PremiereTheme() {
  const [activeId, setActiveId] = useState<string>('about');
  const [reelIndex, setReelIndex] = useState(0);
  const timelineRef = useRef<TimelineHandle>(null);

  const handleSelectAsset = useCallback((asset: ClipAsset) => {
    setActiveId(asset.id);
    // Showcase assets double as Program Monitor cues.
    if (asset.id.startsWith(SHOWCASE_PREFIX)) {
      const index = Number(asset.id.slice(SHOWCASE_PREFIX.length));
      if (Number.isInteger(index)) setReelIndex(index);
    }
  }, []);

  const handleOpenPanel = useCallback((panelId: string) => {
    setActiveId(panelId);
  }, []);

  const handleSelectMilestone = useCallback((milestone: MilestoneEntry) => {
    setActiveId(milestonePanelId(milestone));
  }, []);

  const handleCueReel = useCallback((index: number) => {
    setReelIndex(index);
  }, []);

  // Source Monitor scroll depth → timeline playhead (imperative, rAF-throttled
  // upstream; no state updates on the scroll hot path).
  const handleScrollProgress = useCallback((fraction: number) => {
    timelineRef.current?.setPlayhead(fraction);
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-[#131313] font-sans text-theme-fg">
      <TopStrip />
      <div className={styles.workspace}>
        <ProjectPanel
          activeId={activeId}
          onSelect={handleSelectAsset}
          className={`${styles.projectPanel} ${styles.enter}`}
          style={enterDelay(0)}
        />
        <SourceMonitor
          activeId={activeId}
          onScrollProgress={handleScrollProgress}
          onOpenPanel={handleOpenPanel}
          onCueReel={handleCueReel}
          className={`${styles.sourcePanel} ${styles.enter}`}
          style={enterDelay(60)}
        />
        <ProgramMonitor
          reelIndex={reelIndex}
          onSelectReel={handleCueReel}
          className={`${styles.programPanel} ${styles.enter}`}
          style={enterDelay(120)}
        />
        <Timeline
          ref={timelineRef}
          activeId={activeId}
          onSelectMilestone={handleSelectMilestone}
          className={`${styles.timelinePanel} ${styles.enter}`}
          style={enterDelay(180)}
        />
      </div>
    </div>
  );
}
