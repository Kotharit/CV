'use client';

import { Clapperboard, Film } from 'lucide-react';
import {
  SECTION_VIDEO_LABELS,
  isPlaceholderLink,
  parseVideoLink,
  sectionVideos,
  type SectionVideoKey,
} from '@/data/profile';
import { VideoEmbed } from './VideoEmbed';

interface VideoShelfProps {
  /** Which sectionVideos list (data/profile.ts) to render. */
  section: SectionVideoKey;
  /** Tighter spacing + lower max-height for dense panels (Premiere, Win7). */
  compact?: boolean;
  className?: string;
}

/** An unfilled slot: tells the owner exactly where to paste the link. */
function PlaceholderSlot({
  section,
  index,
  unreadable,
}: {
  section: SectionVideoKey;
  index: number;
  unreadable?: string;
}) {
  return (
    <div
      className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-theme-accent/40 bg-theme-accent/5 px-4 text-center"
      role="note"
      aria-label={`Empty video slot ${index + 1}`}
    >
      <Film size={18} aria-hidden className="text-theme-accent/70" />
      {unreadable ? (
        <p className="text-[11px] leading-relaxed text-theme-muted">
          Couldn&apos;t read <code className="font-mono break-all">{unreadable}</code> — use a
          YouTube/Vimeo URL or an mp4 path.
        </p>
      ) : (
        <p className="text-[11px] leading-relaxed text-theme-muted">
          Paste a YouTube link in <code className="font-mono">data/profile.ts</code>
          <br />
          <code className="font-mono">
            sectionVideos.{section}[{index}]
          </code>
        </p>
      )}
    </div>
  );
}

/**
 * "Linked footage" shelf: renders a section's pasted video links as a
 * vertical list that scrolls once it outgrows its max height — paste as
 * many links as you like in data/profile.ts and they all stay reachable.
 * Used by every theme, themed via the CSS-variable palette.
 */
export function VideoShelf({ section, compact = false, className = '' }: VideoShelfProps) {
  const links = sectionVideos[section];
  if (!links || links.length === 0) return null;

  const label = SECTION_VIDEO_LABELS[section];

  return (
    <section aria-label={`Linked footage — ${label}`} className={className}>
      <header className="mb-2 flex items-center gap-2">
        <Clapperboard size={compact ? 12 : 14} aria-hidden className="text-theme-accent" />
        <h3
          className={`font-semibold uppercase tracking-[0.14em] text-theme-muted ${
            compact ? 'text-[10px]' : 'text-[11px]'
          }`}
        >
          Linked footage
        </h3>
        <span
          className="ml-auto rounded-full border border-theme-border px-2 py-0.5 font-mono text-[9px] text-theme-muted"
          aria-label={`${links.length} ${links.length === 1 ? 'clip' : 'clips'}`}
        >
          {links.length} {links.length === 1 ? 'clip' : 'clips'}
        </span>
      </header>

      <ul
        className={`m-0 list-none space-y-3 overflow-y-auto p-0 pr-1 ${
          compact ? 'max-h-56' : 'max-h-96'
        }`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {links.map((link, i) => {
          const source = parseVideoLink(link);
          return (
            <li key={`${i}-${link}`}>
              {source ? (
                <VideoEmbed
                  video={source}
                  title={`${label} — linked clip ${i + 1}`}
                  className="rounded-md"
                />
              ) : (
                <PlaceholderSlot
                  section={section}
                  index={i}
                  unreadable={isPlaceholderLink(link) ? undefined : link}
                />
              )}
            </li>
          );
        })}
      </ul>

      {links.length > (compact ? 1 : 2) && (
        <p aria-hidden className="mt-1.5 text-right font-mono text-[9px] text-theme-muted">
          ↓ scroll for more
        </p>
      )}
    </section>
  );
}
