'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemeId,
  resolveEffectiveTheme,
  type ThemeId,
} from '@/lib/themes';
import { detectWebGLSupport, useIsMobile, usePrefersReducedMotion } from '@/lib/hooks';

interface ThemeContextValue {
  /** Theme the visitor chose (persisted + shareable). */
  theme: ThemeId;
  /** Theme actually mounted after mobile / WebGL constraints. */
  effectiveTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  /** False during SSR + first client paint (renders the default theme). */
  hydrated: boolean;
  webglSupported: boolean;
  isMobile: boolean;
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server & first client render agree on the default theme; the inline
  // script in layout.tsx has already stamped the *real* choice on <html>
  // (before first paint) and we adopt it in the mount effect below.
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const initial = document.documentElement.dataset.theme;
    if (isThemeId(initial)) setThemeState(initial);
    setWebglSupported(detectWebGLSupport());
    setHydrated(true);
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) — theme still switches */
    }
    // Keep the URL shareable: ?theme=… always reflects the active theme.
    const url = new URL(window.location.href);
    url.searchParams.set('theme', next);
    window.history.replaceState(null, '', url.toString());
  }, []);

  const effectiveTheme = useMemo(
    () => resolveEffectiveTheme(theme, { isMobile, webglSupported }),
    [theme, isMobile, webglSupported],
  );

  const value = useMemo(
    () => ({
      theme,
      effectiveTheme,
      setTheme,
      hydrated,
      webglSupported,
      isMobile,
      reducedMotion,
    }),
    [theme, effectiveTheme, setTheme, hydrated, webglSupported, isMobile, reducedMotion],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
