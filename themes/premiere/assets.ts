// ---------------------------------------------------------------------------
// Premiere theme — media-bin model derived entirely from `profile`.
// Everything here is deterministic (hash-seeded, no Math.random) so the
// server render and the client hydration always agree.
// ---------------------------------------------------------------------------

import {
  EXPERTISE_LABELS,
  SECTION_VIDEO_LABELS,
  TRACK_LABELS,
  parseVideoLink,
  profile,
  sectionVideos,
  type ExpertiseKey,
  type Profile,
  type SectionVideoKey,
  type VideoSource,
} from '@/data/profile';

export type MilestoneEntry = Profile['milestones'][number];

/** One entry in the Program Monitor's screening pool. */
export interface ProgramReel {
  title: string;
  subtitle: string;
  video: VideoSource;
  cover?: string;
}

/**
 * Program Monitor pool: the showcase reels FIRST (their indices must stay
 * 0..n-1 — bin assets and "Cue in Program Monitor" buttons cue by showcase
 * index), then every pasted section video from data/profile.ts. Unfilled
 * lines surface as placeholder slots so the monitor mirrors what the CV
 * sections show.
 */
export const PROGRAM_REELS: readonly ProgramReel[] = [
  ...profile.showcase.map((reel) => ({
    title: reel.title,
    subtitle: reel.role,
    video: reel.video,
    cover: reel.coverImage,
  })),
  ...(Object.keys(sectionVideos) as SectionVideoKey[]).flatMap((key) =>
    sectionVideos[key].map((link, i) => ({
      title: `${SECTION_VIDEO_LABELS[key]} — Linked clip ${String(i + 1).padStart(2, '0')}`,
      subtitle: 'Linked footage',
      video: parseVideoLink(link) ?? ({ kind: 'youtube', id: 'PLACEHOLDER_ID' } as const),
    })),
  ),
];

export const FPS = 24;

/** Timeline domain: 2021 → mid-2026, mapped to a 5.5-minute "sequence"
 *  (1 minute of timecode ≈ 1 year of career). */
export const TIMELINE_YEAR_START = 2021;
export const TIMELINE_YEAR_SPAN = 5.5;
export const SEQUENCE_FRAMES = Math.round(TIMELINE_YEAR_SPAN * 60 * FPS);
export const RULER_YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;

export function yearTickFraction(year: number): number {
  return (year - TIMELINE_YEAR_START) / TIMELINE_YEAR_SPAN;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Human-readable position on the timeline, e.g. "Mar 2023". */
export function yearLabelAtFraction(fraction: number): string {
  const y = TIMELINE_YEAR_START + fraction * TIMELINE_YEAR_SPAN;
  const year = Math.floor(y);
  const month = MONTHS[Math.min(11, Math.max(0, Math.floor((y - year) * 12)))];
  return `${month} ${year}`;
}

export function framesToTimecode(frames: number): string {
  const total = Math.max(0, Math.round(frames));
  const ff = total % FPS;
  const secs = Math.floor(total / FPS);
  const ss = secs % 60;
  const mm = Math.floor(secs / 60) % 60;
  const hh = Math.floor(secs / 3600);
  return [hh, mm, ss, ff].map((n) => String(n).padStart(2, '0')).join(':');
}

export function msToTimecode(ms: number): string {
  return framesToTimecode((ms / 1000) * FPS);
}

/** Small deterministic string hash (for fake durations / codec picks). */
export function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(h, 31) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic fake audio-waveform path for a 100×24 viewBox. */
export function waveformPath(seed: string, bars = 42): string {
  let x = hashSeed(seed) || 1;
  const rand = () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
  const step = 100 / bars;
  const w = (step * 0.55).toFixed(2);
  let d = '';
  for (let i = 0; i < bars; i++) {
    const amp = 2.5 + rand() * 8.5;
    const px = (i * step).toFixed(2);
    d += `M${px} ${(12 - amp).toFixed(2)}h${w}v${(amp * 2).toFixed(2)}h-${w}z`;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Bins & assets
// ---------------------------------------------------------------------------

export type AssetKind = 'video' | 'audio' | 'text';

export interface ClipAsset {
  /** Also the id of the Source Monitor panel this asset opens. */
  id: string;
  name: string;
  kind: AssetKind;
  durationFrames: number;
  /** Fake codec / size metadata column. */
  meta: string;
  binLabel: string;
}

export interface Bin {
  id: string;
  label: string;
  assets: readonly ClipAsset[];
}

const VIDEO_CODECS = [
  'ProRes 422 · 1080p',
  'H.264 · 4K UHD',
  'ProRes 4444 · 1080p',
  'DNxHR HQ · 1080p',
];

function toFileName(input: string): string {
  return input
    .replace(/&/g, 'and')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeAsset(id: string, name: string, kind: AssetKind, binLabel: string): ClipAsset {
  const h = hashSeed(id);
  const meta =
    kind === 'video'
      ? VIDEO_CODECS[h % VIDEO_CODECS.length]
      : kind === 'audio'
        ? 'WAV · 48 kHz · 24-bit'
        : `${(h % 38) + 2} KB · UTF-8`;
  const durationFrames = kind === 'text' ? 0 : (25 + (h % 320)) * FPS;
  return { id, name, kind, durationFrames, meta, binLabel };
}

const EXPERTISE_KEYS = Object.keys(EXPERTISE_LABELS) as ExpertiseKey[];

const BIN_ABOUT = '01_About';
const BIN_EDUCATION = '02_Education';
const BIN_EXPERIENCE = '03_Work_Experience';
const BIN_EXPERTISE = '04_Core_Expertise';
const BIN_SHOWCASE = '05_Showcase';

export const BINS: readonly Bin[] = [
  {
    id: 'bin-about',
    label: BIN_ABOUT,
    assets: [makeAsset('about', 'About.txt', 'text', BIN_ABOUT)],
  },
  {
    id: 'bin-education',
    label: BIN_EDUCATION,
    assets: [
      makeAsset('education', 'Education.mp4', 'video', BIN_EDUCATION),
      ...profile.education.map((e, i) => {
        const acronym = /\(([^)]+)\)/.exec(e.degree)?.[1] ?? e.degree;
        const inst = e.institution.split(/\s+/)[0] ?? e.institution;
        return makeAsset(
          `education-${i}`,
          `${toFileName(`${acronym}_${inst}`)}.mp4`,
          'video',
          BIN_EDUCATION,
        );
      }),
      ...profile.certifications.map((c, i) => {
        const inst = c.institution.split(/\s+/)[0] ?? c.institution;
        return makeAsset(`cert-${i}`, `${toFileName(inst)}_Cert.txt`, 'text', BIN_EDUCATION);
      }),
    ],
  },
  {
    id: 'bin-experience',
    label: BIN_EXPERIENCE,
    assets: [
      makeAsset('experience', 'Work_Experience.mov', 'video', BIN_EXPERIENCE),
      ...profile.experience.map((e, i) =>
        makeAsset(`experience-${i}`, `${toFileName(e.title)}.mov`, 'video', BIN_EXPERIENCE),
      ),
    ],
  },
  {
    id: 'bin-expertise',
    label: BIN_EXPERTISE,
    assets: [
      makeAsset('expertise', 'Core_Expertise.wav', 'audio', BIN_EXPERTISE),
      ...EXPERTISE_KEYS.map((key) =>
        makeAsset(
          `expertise-${key}`,
          `${toFileName(EXPERTISE_LABELS[key])}.wav`,
          'audio',
          BIN_EXPERTISE,
        ),
      ),
    ],
  },
  {
    id: 'bin-showcase',
    label: BIN_SHOWCASE,
    assets: profile.showcase.map((s, i) =>
      makeAsset(`showcase-${i}`, `${toFileName(s.title)}.mp4`, 'video', BIN_SHOWCASE),
    ),
  },
];

export const ASSET_COUNT = BINS.reduce((n, bin) => n + bin.assets.length, 0);

export const ASSET_BY_ID: ReadonlyMap<string, ClipAsset> = new Map(
  BINS.flatMap((bin) => bin.assets).map((asset) => [asset.id, asset] as const),
);

// ---------------------------------------------------------------------------
// Milestone panels (timeline clips open these in the Source Monitor)
// ---------------------------------------------------------------------------

const MILESTONE_PANEL_PREFIX = 'milestone-';

export function milestonePanelId(m: MilestoneEntry): string {
  return `${MILESTONE_PANEL_PREFIX}${m.id}`;
}

export const MILESTONE_BY_PANEL_ID: ReadonlyMap<string, MilestoneEntry> = new Map(
  profile.milestones.map((m) => [milestonePanelId(m), m] as const),
);

// ---------------------------------------------------------------------------
// Source Monitor header metadata
// ---------------------------------------------------------------------------

export interface PanelMeta {
  fileName: string;
  kicker: string;
  inFrames: number;
  outFrames: number;
  durFrames: number;
}

export function getPanelMeta(panelId: string): PanelMeta {
  const asset = ASSET_BY_ID.get(panelId);
  if (asset) {
    const inFrames = hashSeed(`${panelId}:in`) % (30 * FPS);
    return {
      fileName: asset.name,
      kicker: `${asset.binLabel} / ${asset.name}`,
      inFrames,
      outFrames: inFrames + asset.durationFrames,
      durFrames: asset.durationFrames,
    };
  }
  const milestone = MILESTONE_BY_PANEL_ID.get(panelId);
  if (milestone) {
    const inFrames = Math.round(milestone.start * SEQUENCE_FRAMES);
    const outFrames = Math.round((milestone.start + milestone.length) * SEQUENCE_FRAMES);
    return {
      fileName: `${toFileName(milestone.title)}.seq`,
      kicker: `Timeline / ${milestone.track} · ${TRACK_LABELS[milestone.track]}`,
      inFrames,
      outFrames,
      durFrames: Math.max(0, outFrames - inFrames),
    };
  }
  return { fileName: 'Untitled', kicker: '', inFrames: 0, outFrames: 0, durFrames: 0 };
}
