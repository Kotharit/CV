// ============================================================================
// Space theme — constellation model.
// Maps the four identity centers onto viewport-percent star coordinates and
// declares which slices of `profile` each star's modal renders. All CV facts
// flow from data/profile.ts; nothing content-like is authored here.
// ============================================================================

import {
  EXPERTISE_LABELS,
  TRACK_LABELS,
  profile,
  type EducationItem,
  type ExperienceItem,
  type Milestone,
  type Profile,
  type SectionVideoKey,
  type ShowcaseItem,
} from '@/data/profile';

export type NodeId = 'it' | 'marketing' | 'film' | 'education';

export type CertificationItem = Profile['certifications'][number];

/** One renderable block inside a node's detail modal. */
export type ModalSection =
  | { kind: 'chips'; heading: string; items: readonly string[] }
  | { kind: 'experience'; heading: string; items: readonly ExperienceItem[] }
  | { kind: 'milestones'; heading: string; items: readonly Milestone[] }
  | { kind: 'education'; heading: string; items: readonly EducationItem[] }
  | { kind: 'certifications'; heading: string; items: readonly CertificationItem[] }
  | { kind: 'showcase'; heading: string; items: readonly ShowcaseItem[] };

export interface Point {
  /** Viewport-percent x [0..100]. */
  x: number;
  /** Viewport-percent y [0..100]. */
  y: number;
}

export interface Satellite {
  /** Offset from the center star, viewport-percent. */
  dx: number;
  dy: number;
  /** Dot diameter in px. */
  size: number;
}

export interface SpaceNode {
  id: NodeId;
  label: string;
  sublabel: string;
  /** Desktop position (viewport percent of the stage). */
  pos: Point;
  /** Compressed 2x2-ish position for small screens. */
  mobilePos: Point;
  satellites: readonly Satellite[];
  /** Faint wiring to related centers, drawn when this node is lit. */
  related: readonly NodeId[];
  /** Which palette var tints this star: '--accent-rgb' | '--accent-2-rgb'. */
  colorVar: '--accent-rgb' | '--accent-2-rgb';
  /** Film modal is wider to breathe around the reel grid. */
  wide?: boolean;
  /** Section-videos shelf (data/profile.ts sectionVideos) shown in the modal. */
  videos?: SectionVideoKey;
  sections: readonly ModalSection[];
}

const marketingMilestones = profile.milestones.filter((m) => m.track === 'A1');
const filmMilestones = profile.milestones.filter((m) => m.track === 'V3');

export const SPACE_NODES: readonly SpaceNode[] = [
  {
    id: 'it',
    label: EXPERTISE_LABELS.it,
    sublabel: `${profile.identity.titles[0]} · ${profile.identity.org}`,
    pos: { x: 26, y: 40 },
    mobilePos: { x: 28, y: 46 },
    satellites: [
      { dx: -7, dy: -7, size: 3 },
      { dx: 6, dy: -10, size: 2 },
      { dx: 10, dy: 3, size: 3.5 },
      { dx: -4, dy: 9, size: 2.5 },
    ],
    related: ['marketing', 'education'],
    colorVar: '--accent-rgb',
    videos: 'experience',
    sections: [
      { kind: 'chips', heading: 'Core capabilities', items: profile.expertise.it },
      { kind: 'chips', heading: 'Stack', items: profile.expertise.stack },
      { kind: 'chips', heading: 'Property coverage', items: profile.properties },
      { kind: 'experience', heading: 'Experience', items: profile.experience },
    ],
  },
  {
    id: 'marketing',
    label: EXPERTISE_LABELS.marketing,
    sublabel: `${profile.identity.titles[1]} · ${profile.identity.org}`,
    pos: { x: 68, y: 28 },
    mobilePos: { x: 72, y: 40 },
    satellites: [
      { dx: -8, dy: 5, size: 2.5 },
      { dx: 7, dy: 8, size: 3 },
      { dx: 10, dy: -4, size: 2 },
      { dx: -3, dy: -9, size: 3.5 },
    ],
    related: ['it', 'film'],
    colorVar: '--accent-2-rgb',
    videos: 'marketing',
    sections: [
      { kind: 'chips', heading: 'Core capabilities', items: profile.expertise.marketing },
      { kind: 'milestones', heading: TRACK_LABELS.A1, items: marketingMilestones },
    ],
  },
  {
    id: 'film',
    label: EXPERTISE_LABELS.creative,
    sublabel: profile.certifications[0].institution,
    pos: { x: 58, y: 66 },
    mobilePos: { x: 68, y: 76 },
    satellites: [
      { dx: -9, dy: -5, size: 2.5 },
      { dx: 8, dy: -8, size: 3 },
      { dx: 12, dy: 3, size: 2 },
      { dx: 5, dy: 10, size: 3 },
      { dx: -5, dy: 8, size: 2 },
    ],
    related: ['marketing', 'education'],
    colorVar: '--accent-2-rgb',
    wide: true,
    sections: [
      { kind: 'chips', heading: 'Craft', items: profile.expertise.creative },
      { kind: 'certifications', heading: 'Training', items: profile.certifications },
      { kind: 'milestones', heading: TRACK_LABELS.V3, items: filmMilestones },
      { kind: 'showcase', heading: 'Selected reels', items: profile.showcase },
    ],
  },
  {
    id: 'education',
    label: TRACK_LABELS.V1,
    sublabel: profile.education[0].institution,
    pos: { x: 32, y: 76 },
    mobilePos: { x: 28, y: 82 },
    satellites: [
      { dx: -8, dy: -7, size: 2 },
      { dx: 9, dy: -3, size: 3 },
      { dx: 5, dy: 8, size: 2.5 },
      { dx: -10, dy: 4, size: 3 },
    ],
    related: ['film', 'it'],
    colorVar: '--accent-rgb',
    videos: 'education',
    sections: [
      { kind: 'education', heading: 'Degree', items: profile.education },
    ],
  },
];

/** Resolve a node's center for the current breakpoint. */
export function nodePoint(node: SpaceNode, isMobile: boolean): Point {
  return isMobile ? node.mobilePos : node.pos;
}

/** Satellites sit closer to their center on small screens. */
export const SATELLITE_SCALE_MOBILE = 0.62;
