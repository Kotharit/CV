export const THEME_IDS = ['premiere', 'win7', 'space', 'scroll3d', 'museum'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = 'premiere';

/** localStorage key for the persisted theme. Keep in sync with the inline
 *  no-flash script in app/layout.tsx. */
export const THEME_STORAGE_KEY = 'tk-theme';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
  /** Theme cannot render at all without WebGL. */
  requiresWebGL: boolean;
  /** Desktop-metaphor theme: falls back to the Museum linear view on phones. */
  desktopOnly: boolean;
}

export const THEMES: readonly ThemeMeta[] = [
  {
    id: 'premiere',
    label: 'Premiere',
    description: 'Video-editor workspace (default)',
    requiresWebGL: false,
    desktopOnly: true,
  },
  {
    id: 'win7',
    label: 'Windows 7',
    description: 'Retro Aero desktop',
    requiresWebGL: false,
    desktopOnly: true,
  },
  {
    id: 'space',
    label: 'Space',
    description: 'Constellation starfield',
    requiresWebGL: true,
    desktopOnly: false,
  },
  {
    id: 'scroll3d',
    label: '3D World',
    description: 'Deep-scroll fly-through',
    requiresWebGL: true,
    desktopOnly: true,
  },
  {
    id: 'museum',
    label: 'Museum',
    description: 'Minimalist linear gallery',
    requiresWebGL: false,
    desktopOnly: false,
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value);
}

/**
 * Resolve which theme actually mounts, given device constraints.
 * The user's *chosen* theme is preserved (in storage/URL); only the
 * rendered theme is substituted.
 */
export function resolveEffectiveTheme(
  theme: ThemeId,
  opts: { isMobile: boolean; webglSupported: boolean },
): ThemeId {
  const meta = THEMES.find((t) => t.id === theme);
  if (!meta) return DEFAULT_THEME;
  if (meta.requiresWebGL && !opts.webglSupported) return 'museum';
  if (meta.desktopOnly && opts.isMobile) return 'museum';
  return theme;
}
