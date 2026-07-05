'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppWindow, Landmark, Rocket, Sparkles, X, type LucideIcon } from 'lucide-react';
import { DEFAULT_THEME, THEMES, type ThemeId } from '@/lib/themes';
import { useTheme } from './ThemeProvider';

const HINT_STORAGE_KEY = 'tk-hint-dismissed';
const SHOW_DELAY_MS = 1800;
const AUTO_HIDE_MS = 16000;

const HINT_ICONS: Partial<Record<ThemeId, LucideIcon>> = {
  win7: AppWindow,
  space: Sparkles,
  scroll3d: Rocket,
  museum: Landmark,
};

/**
 * One-time discoverability nudge: the theme switcher is this site's
 * signature feature, so first-time desktop visitors get a small card with
 * one-tap shortcuts into the other four modes. Dismissed forever by ✕,
 * switching theme, or a timeout; never shown on phones or after the visitor
 * has already switched once.
 */
export function ThemeHint() {
  const { theme, setTheme, hydrated, isMobile, webglSupported, reducedMotion } = useTheme();
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);

  const dismiss = (persist = true) => {
    dismissedRef.current = true;
    setVisible(false);
    if (persist) {
      try {
        localStorage.setItem(HINT_STORAGE_KEY, '1');
      } catch {
        /* private mode — the session-local flag still prevents re-shows */
      }
    }
  };

  // Show once, after a beat, only for fresh desktop visitors on the default theme.
  useEffect(() => {
    if (!hydrated || isMobile || theme !== DEFAULT_THEME) return;
    try {
      if (localStorage.getItem(HINT_STORAGE_KEY)) return;
    } catch {
      /* storage unavailable — still show; ref guards this session */
    }
    if (dismissedRef.current) return;
    const show = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    const hide = window.setTimeout(() => dismiss(), SHOW_DELAY_MS + AUTO_HIDE_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isMobile, theme]);

  // Switching theme by any means counts as "discovered".
  useEffect(() => {
    if (theme !== DEFAULT_THEME && visible) dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const others = THEMES.filter(
    (t) => t.id !== DEFAULT_THEME && (!t.requiresWebGL || webglSupported),
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="status"
          aria-label="Theme modes available"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
          transition={{ duration: reducedMotion ? 0.1 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-3 top-[calc(var(--nav-h)+10px)] z-overlay w-[19rem] rounded-xl border border-[var(--nav-border)] bg-[var(--nav-menu)] p-4 shadow-2xl backdrop-blur-xl"
        >
          <span
            aria-hidden
            className="absolute -top-1.5 right-10 h-3 w-3 rotate-45 border-l border-t border-[var(--nav-border)] bg-[var(--nav-menu)]"
          />
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--nav-fg)]">
              Five ways to view this CV
            </p>
            <button
              type="button"
              onClick={() => dismiss()}
              aria-label="Dismiss hint"
              className="-mr-1 -mt-1 rounded-md p-1 text-[var(--nav-fg)] opacity-60 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--nav-fg)] opacity-60">
            You&apos;re in the video-editor workspace. Jump straight into another mode:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {others.map((t) => {
              const Icon = HINT_ICONS[t.id] ?? Sparkles;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    dismiss();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-[var(--nav-border)] bg-[var(--nav-chip)] px-2.5 py-2 text-xs font-medium text-[var(--nav-fg)] transition-colors hover:border-theme-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent"
                >
                  <Icon size={14} aria-hidden className="shrink-0 text-theme-accent" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
