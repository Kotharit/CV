// ============================================================================
// ⚠️  PLACEHOLDER CONTENT — invented for layout/demo purposes.
// Replace ALL metrics, dates, descriptions, links and video URLs with real
// data before publishing. Every string marked "PLACEHOLDER" (and every
// metric/date in this file) is seeded demo data, not verified fact.
//
// This file is the SINGLE SOURCE OF TRUTH: every theme renders strictly from
// the `profile` object below. Do not duplicate content inside theme code.
// ============================================================================

export type VideoSource =
  | { kind: 'youtube'; id: string } // -> <iframe> embed (Program Monitor, Win7 window)
  | { kind: 'vimeo'; id: string } // -> <iframe> embed
  | { kind: 'mp4'; url: string }; // -> <video> + video-texture for Museum CRT meshes

/** Premiere-theme timeline tracks (also used as category tags elsewhere). */
export type TrackId = 'V3' | 'V2' | 'V1' | 'A1';

export const TRACK_LABELS: Record<TrackId, string> = {
  V3: 'Film / Video Editing',
  V2: 'Tech / Infrastructure',
  V1: 'Education & BCA',
  A1: 'Marketing Operations',
};

export interface Milestone {
  /** Stable id, used as React key + deep-link anchor. */
  id: string;
  track: TrackId;
  title: string;
  detail: string;
  /** Display year(s), e.g. "2023" or "2023 – 2025". */
  period: string;
  /** Timeline clip position, fraction of the full timeline [0..1]. */
  start: number;
  /** Timeline clip length, fraction of the full timeline (0..1]. */
  length: number;
}

export const profile = {
  identity: {
    name: 'Taha Kothari',
    age: 24,
    location: 'Mumbai, India',
    titles: ['Head of IT', 'Head of Marketing'],
    org: 'Hatimi Retreats Pvt. Ltd.',
    tagline:
      'IT & Marketing lead by day, video editor by craft — building systems and stories.',
    summary:
      'PLACEHOLDER: Technology and marketing leader for a multi-property hospitality group — owning physical and digital infrastructure across seven-plus retreat properties, steering a custom Ruby on Rails booking platform for 24+ months, and cutting films after hours.',
    resumePdf: '/taha-kothari-resume.pdf', // TODO: replace with the real PDF in /public
    links: {
      email: 'hello@example.com', // TODO
      linkedin: 'https://linkedin.com/in/PLACEHOLDER', // TODO
      github: 'https://github.com/PLACEHOLDER', // TODO
    },
  },

  about: [
    'PLACEHOLDER: I run the technology backbone of Hatimi Retreats — a hospitality group operating retreat properties across Western India. That means everything from network, Wi-Fi, CCTV and intercom architecture on the ground, to supervising software development and a custom Ruby on Rails & MySQL booking portal I have steered for over two years.',
    'PLACEHOLDER: In parallel I head marketing operations — brand systems, digital presence and campaign delivery — and I am a trained video editor (Aevy Video Mastery School), cutting brand films, walkthroughs and short-form series for the group.',
  ],

  /** Properties covered by the IT scope. PLACEHOLDER ordering/completeness. */
  properties: [
    'Lonavala',
    'Matheran',
    'Mt. Abu',
    'Panchgani',
    'Dumas',
    'Zainee Bungalow',
    'Others',
  ],

  experience: [
    {
      org: 'Hatimi Retreats Pvt. Ltd.',
      title: 'Head of IT & Head of Marketing',
      startDate: '2023',
      endDate: 'present',
      summary:
        'Owns technology infrastructure and marketing operations across a multi-property hospitality group.',
      bullets: [
        'PLACEHOLDER: Consolidated surveillance across 8 properties onto a unified VMS, cutting incident response ~40%.',
        'PLACEHOLDER: Led 24-month build of a custom Rails/MySQL booking portal serving 6 resort locations.',
        'PLACEHOLDER: Rebuilt network, Wi-Fi, and intercom architecture across Lonavala, Matheran, Mt. Abu, Panchgani.',
        'PLACEHOLDER: Runs marketing operations — brand system, digital presence, campaign delivery.',
      ],
    },
    {
      org: 'Hatimi Retreats Pvt. Ltd. (Estate Dept.)',
      title: 'IT In-charge, Estate Department',
      startDate: '2021',
      endDate: '2023',
      summary: 'Ground-level IT ownership across estate properties.',
      bullets: [
        'PLACEHOLDER: Deployed CCTV, fingerprint attendance, staff email and NAS across sites.',
        'PLACEHOLDER: Supervised external vendors delivering a property management system.',
      ],
    },
  ],

  education: [
    {
      institution: 'Amity University Online',
      degree: 'Bachelor of Computer Applications (BCA)',
      status: 'In progress — Semester III',
      startDate: '2024',
      detail:
        'PLACEHOLDER: Coursework spanning programming fundamentals, databases, networking and web technologies — pursued alongside full-time leadership roles.',
    },
  ],

  certifications: [
    {
      institution: 'Aevy Video Mastery School',
      title: 'Advanced Video Editing & Film Production',
      period: '2022', // PLACEHOLDER date
      detail:
        'PLACEHOLDER: Intensive training in narrative editing, motion graphics, color grading and short-form film production.',
    },
  ],

  expertise: {
    it: [
      'Network & Wi-Fi architecture',
      'CCTV / VMS',
      'Software dev supervision',
      'Cloud & deployment',
    ],
    marketing: [
      'Brand systems',
      'Digital presence',
      'Campaign ops',
      'Content strategy',
    ],
    creative: [
      'Video editing',
      'Motion graphics',
      'Color grading',
      'Short-form film',
    ],
    stack: ['Ruby on Rails', 'MySQL', 'Next.js', 'TypeScript', 'React'],
  },

  // Showcase reels — PLACEHOLDER video sources. Swap IDs/URLs for real reels.
  showcase: [
    {
      title: 'Hatimi Retreats — Brand Film',
      role: 'Editor / Director',
      description: 'PLACEHOLDER cinematic property film.',
      coverImage: '/covers/brand-film.svg',
      video: { kind: 'youtube', id: 'PLACEHOLDER_ID' },
    },
    {
      title: 'Lonavala Property Walkthrough',
      role: 'Editor',
      description: 'PLACEHOLDER resort walkthrough reel.',
      coverImage: '/covers/lonavala.svg',
      video: { kind: 'mp4', url: '/reels/sample.mp4' },
    },
    {
      title: 'Event Recap — Highlight Cut',
      role: 'Editor',
      description: 'PLACEHOLDER fast-paced event recap.',
      coverImage: '/covers/event.svg',
      video: { kind: 'youtube', id: 'PLACEHOLDER_ID' },
    },
    {
      title: 'Short-Form Social Series',
      role: 'Editor',
      description: 'PLACEHOLDER vertical social edits.',
      coverImage: '/covers/social.svg',
      video: { kind: 'vimeo', id: 'PLACEHOLDER_ID' },
    },
  ],

  /**
   * Career milestones — PLACEHOLDER dates & positions.
   * Rendered as clips on the Premiere timeline (track/start/length),
   * as fly-through stations in the Scroll3D theme, and as history
   * entries elsewhere. Timeline domain ≈ 2021 → mid-2026.
   */
  milestones: [
    // V2 — Tech / Infrastructure
    {
      id: 'cctv-rollout',
      track: 'V2',
      title: 'CCTV & attendance rollout',
      detail:
        'PLACEHOLDER: Deployed CCTV, fingerprint attendance, staff email and NAS across estate properties.',
      period: '2021 – 2022',
      start: 0.0,
      length: 0.2,
    },
    {
      id: 'network-rebuild',
      track: 'V2',
      title: 'Network & intercom rebuild',
      detail:
        'PLACEHOLDER: Rebuilt Wi-Fi, LAN and intercom architecture across Lonavala, Matheran, Mt. Abu and Panchgani.',
      period: '2022 – 2023',
      start: 0.22,
      length: 0.18,
    },
    {
      id: 'rails-portal',
      track: 'V2',
      title: 'Rails/MySQL booking portal',
      detail:
        'PLACEHOLDER: 24+ months steering a custom Ruby on Rails & MySQL property booking portal serving 6 resort locations.',
      period: '2023 – present',
      start: 0.42,
      length: 0.55,
    },
    // A1 — Marketing
    {
      id: 'brand-system',
      track: 'A1',
      title: 'Brand system & digital presence',
      detail:
        'PLACEHOLDER: Built the group brand system and rebuilt the digital presence across web and social.',
      period: '2023 – 2024',
      start: 0.4,
      length: 0.22,
    },
    {
      id: 'campaign-ops',
      track: 'A1',
      title: 'Campaign operations',
      detail:
        'PLACEHOLDER: Runs always-on campaign delivery and cross-functional marketing projects.',
      period: '2024 – present',
      start: 0.64,
      length: 0.33,
    },
    // V1 — Education
    {
      id: 'bca-amity',
      track: 'V1',
      title: 'BCA — Amity University Online',
      detail:
        'PLACEHOLDER: Bachelor of Computer Applications, currently in Semester III, pursued alongside full-time roles.',
      period: '2024 – present',
      start: 0.58,
      length: 0.39,
    },
    // V3 — Film / Video
    {
      id: 'aevy-mastery',
      track: 'V3',
      title: 'Aevy Video Mastery School',
      detail:
        'PLACEHOLDER: Advanced video editing & film production training — narrative editing, motion graphics, color grading.',
      period: '2022',
      start: 0.18,
      length: 0.14,
    },
    {
      id: 'brand-film',
      track: 'V3',
      title: 'Hatimi brand film & walkthroughs',
      detail:
        'PLACEHOLDER: Directed and edited the group brand film plus property walkthrough reels.',
      period: '2024',
      start: 0.55,
      length: 0.18,
    },
    {
      id: 'social-series',
      track: 'V3',
      title: 'Short-form social series',
      detail:
        'PLACEHOLDER: Ongoing vertical short-form series — fast-turnaround edits for social.',
      period: '2025 – present',
      start: 0.76,
      length: 0.21,
    },
  ] satisfies Milestone[],
} as const;

// ============================================================================
// SECTION VIDEOS — paste your YouTube links below, one per line. That's it.
//
// Every CV section across ALL themes renders these through the shared
// <VideoShelf> component (components/shared/VideoShelf.tsx), and the
// Premiere theme's Program Monitor cycles through them after the showcase
// reels. Add as many links per section as you want — the shelf becomes a
// scrollable list automatically.
//
// Accepted link forms (anything YouTube-shaped works):
//   https://www.youtube.com/watch?v=dQw4w9WgXcQ
//   https://youtu.be/dQw4w9WgXcQ
//   https://www.youtube.com/shorts/dQw4w9WgXcQ
//   dQw4w9WgXcQ                          (bare 11-char video id)
//   https://vimeo.com/76979871           (Vimeo works too)
//   /reels/my-clip.mp4                   (local/remote mp4 file)
//
// Lines containing "PLACEHOLDER" render as an intentional "paste a link
// here" slot instead of a broken player.
// ============================================================================

export type SectionVideoKey =
  | 'about'
  | 'education'
  | 'experience'
  | 'expertise'
  | 'marketing';

export const SECTION_VIDEO_LABELS: Record<SectionVideoKey, string> = {
  about: 'About',
  education: 'Education',
  experience: 'Work Experience',
  expertise: 'Core Expertise',
  marketing: 'Marketing',
};

export const sectionVideos: Record<SectionVideoKey, readonly string[]> = {
  about: [
    'PLACEHOLDER_YOUTUBE_LINK', // ← replace with e.g. https://youtu.be/XXXXXXXXXXX
    'PLACEHOLDER_YOUTUBE_LINK',
  ],
  education: [
    'PLACEHOLDER_YOUTUBE_LINK',
  ],
  experience: [
    'PLACEHOLDER_YOUTUBE_LINK',
    'PLACEHOLDER_YOUTUBE_LINK',
  ],
  expertise: [
    'PLACEHOLDER_YOUTUBE_LINK',
  ],
  marketing: [
    'PLACEHOLDER_YOUTUBE_LINK',
  ],
};

/** True for seeded "paste a link here" lines in sectionVideos. */
export function isPlaceholderLink(link: string): boolean {
  return link.trim() === '' || link.includes('PLACEHOLDER');
}

/**
 * Turn a pasted link (any common YouTube/Vimeo URL form, a bare YouTube id,
 * or an mp4 path) into a playable VideoSource. Returns null when the line
 * isn't recognizable — the UI then shows a "couldn't read this link" slot
 * instead of a broken embed.
 */
export function parseVideoLink(link: string): VideoSource | null {
  const trimmed = link.trim();
  if (!trimmed || isPlaceholderLink(trimmed)) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return { kind: 'youtube', id: trimmed };
  }
  const youtube = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (youtube) return { kind: 'youtube', id: youtube[1] };

  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: 'vimeo', id: vimeo[1] };

  if (trimmed.startsWith('/') || /\.(mp4|webm|mov)(\?|#|$)/i.test(trimmed)) {
    return { kind: 'mp4', url: trimmed };
  }
  return null;
}

export type Profile = typeof profile;
export type ExperienceItem = Profile['experience'][number];
export type EducationItem = Profile['education'][number];
export type ShowcaseItem = Profile['showcase'][number];
export type ExpertiseKey = keyof Profile['expertise'];

export const EXPERTISE_LABELS: Record<ExpertiseKey, string> = {
  it: 'IT & Infrastructure',
  marketing: 'Marketing',
  creative: 'Film & Video',
  stack: 'Tech Stack',
};

/** True when a showcase video still points at seeded placeholder data. */
export function isPlaceholderVideo(video: VideoSource): boolean {
  return (
    (video.kind === 'youtube' || video.kind === 'vimeo') &&
    video.id.includes('PLACEHOLDER')
  );
}
