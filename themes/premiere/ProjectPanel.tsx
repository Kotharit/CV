'use client';

// Project panel — the media-bin tree that acts as the primary CV navigation.
// Bins expand/collapse; assets are toggle buttons that load Source Monitor
// panels (blue selection bar on the active row).

import { useState, type CSSProperties } from 'react';
import {
  ChevronRight,
  FileAudio,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
} from 'lucide-react';
import PanelChrome from './PanelChrome';
import {
  ASSET_COUNT,
  BINS,
  framesToTimecode,
  type AssetKind,
  type ClipAsset,
} from './assets';
import styles from './premiere.module.css';

interface ProjectPanelProps {
  activeId: string;
  onSelect: (asset: ClipAsset) => void;
  className?: string;
  style?: CSSProperties;
}

function AssetIcon({ kind }: { kind: AssetKind }) {
  if (kind === 'video') {
    return <FileVideo size={12} aria-hidden className="flex-none text-[#7fb0e8]" />;
  }
  if (kind === 'audio') {
    return <FileAudio size={12} aria-hidden className="flex-none text-[#7fce8f]" />;
  }
  return <FileText size={12} aria-hidden className="flex-none text-[#bdbdbd]" />;
}

export default function ProjectPanel({ activeId, onSelect, className = '', style }: ProjectPanelProps) {
  const [openBins, setOpenBins] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(BINS.map((bin) => [bin.id, true])),
  );

  const toggleBin = (binId: string) =>
    setOpenBins((prev) => ({ ...prev, [binId]: !prev[binId] }));

  return (
    <section aria-label="Project panel — CV media bins" className={`${styles.panel} ${className}`} style={style}>
      <PanelChrome title="Project: taha_kothari_portfolio" />

      <div
        aria-hidden
        className="grid flex-none grid-cols-[minmax(0,1fr)_58px_minmax(0,88px)] items-center gap-2 border-b border-[#2a2a2a] bg-[#232323] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-theme-muted"
      >
        <span className="pl-[18px]">Name</span>
        <span className="text-right">Duration</span>
        <span>Info</span>
      </div>

      <nav
        aria-label="CV sections"
        tabIndex={0}
        className={`${styles.scrollArea} min-h-0 flex-1 overflow-y-auto py-1`}
      >
        <ul className="m-0 list-none p-0">
          {BINS.map((bin) => {
            const open = !!openBins[bin.id];
            return (
              <li key={bin.id}>
                <button
                  type="button"
                  className={styles.binRow}
                  aria-expanded={open}
                  aria-controls={`${bin.id}-assets`}
                  onClick={() => toggleBin(bin.id)}
                >
                  <ChevronRight
                    size={11}
                    aria-hidden
                    className={`flex-none text-theme-muted transition-transform duration-150 motion-reduce:transition-none ${
                      open ? 'rotate-90' : ''
                    }`}
                  />
                  {open ? (
                    <FolderOpen size={12} aria-hidden className="flex-none text-theme-accent" />
                  ) : (
                    <Folder size={12} aria-hidden className="flex-none text-theme-accent" />
                  )}
                  <span className="min-w-0 truncate font-medium">{bin.label}</span>
                  <span className="ml-auto flex-none pr-1 font-mono text-[9px] text-theme-muted">
                    {bin.assets.length}
                  </span>
                </button>

                <ul id={`${bin.id}-assets`} hidden={!open} className="m-0 list-none p-0">
                  {bin.assets.map((asset) => {
                    const selected = activeId === asset.id;
                    return (
                      <li key={asset.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelect(asset)}
                          className={`${styles.assetRow} ${selected ? styles.assetSelected : ''}`}
                        >
                          <span className="flex min-w-0 items-center gap-1.5">
                            <AssetIcon kind={asset.kind} />
                            <span className="truncate">{asset.name}</span>
                          </span>
                          <span className="text-right font-mono text-[9px] tabular-nums text-theme-muted">
                            {asset.durationFrames > 0
                              ? framesToTimecode(asset.durationFrames)
                              : '—'}
                          </span>
                          <span className="truncate text-[9px] text-theme-muted">{asset.meta}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="flex-none border-t border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 font-mono text-[9px] text-theme-muted">
        {ASSET_COUNT} items · 1 sequence · 5 bins
      </footer>
    </section>
  );
}
