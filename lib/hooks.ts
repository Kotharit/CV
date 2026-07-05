'use client';

import { useEffect, useState } from 'react';

/** Subscribe to a media query. Returns `fallback` until mounted (SSR-safe). */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(fallback);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True below the 768px breakpoint (phones / small tablets). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** Honors the OS-level reduced-motion preference. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * One-time WebGL capability probe. Kept out of render: call from an effect.
 * The probe context is explicitly released so it never lingers as one of the
 * browser's limited live GL contexts.
 */
export function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
