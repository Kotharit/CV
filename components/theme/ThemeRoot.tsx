'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { GlobalNav } from './GlobalNav';
import PremiereTheme from '@/themes/premiere/PremiereTheme';
import type { ThemeId } from '@/lib/themes';

/** Branded fade shown while a heavy theme chunk streams in. */
function ThemeLoading() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-theme-bg"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-theme-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-theme-border border-t-theme-accent motion-reduce:animate-none" />
        <span className="text-xs uppercase tracking-widest">Loading theme…</span>
      </div>
    </div>
  );
}

// The Premiere hero is statically imported above: it is the crawlable default
// (server-rendered semantic HTML) and contains no WebGL. Everything else is
// code-split with next/dynamic + ssr:false so Three.js and the retro layouts
// never ship in the initial bundle (Section 2 / Section 6).
const Win7Theme = dynamic(() => import('@/themes/win7/Win7Theme'), {
  ssr: false,
  loading: ThemeLoading,
});
const SpaceTheme = dynamic(() => import('@/themes/space/SpaceTheme'), {
  ssr: false,
  loading: ThemeLoading,
});
const Scroll3DTheme = dynamic(() => import('@/themes/scroll3d/Scroll3DTheme'), {
  ssr: false,
  loading: ThemeLoading,
});
const MuseumTheme = dynamic(() => import('@/themes/museum/MuseumTheme'), {
  ssr: false,
  loading: ThemeLoading,
});

export default function ThemeRoot() {
  const { effectiveTheme, hydrated, reducedMotion } = useTheme();

  // Release the pre-hydration no-flash guard (globals.css) only after the
  // stored/URL theme has actually been committed — this effect runs after the
  // render in which `hydrated` flipped, so the default theme never flashes.
  useEffect(() => {
    if (hydrated) document.documentElement.setAttribute('data-stage-ready', 'true');
  }, [hydrated]);

  // SSR and the first client render always show the default theme; the mount
  // effect in ThemeProvider then swaps to the stored/URL theme. The inline
  // script + CSS in layout.tsx hide that first frame when another theme is
  // stored, so the wrong theme never flashes.
  const active: ThemeId = hydrated ? effectiveTheme : 'premiere';

  return (
    <>
      <GlobalNav />
      <main
        id="content"
        data-theme-stage
        className="fixed inset-x-0 bottom-0 top-nav overflow-hidden bg-theme-bg"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
          >
            {/*
              HARD CONDITIONAL UNMOUNTING (Section 6): exactly one theme is in
              the tree at a time — never hidden with CSS. Unmounting an R3F
              theme triggers its native WebGL context + resource cleanup.
            */}
            {active === 'premiere' && <PremiereTheme />}
            {active === 'win7' && <Win7Theme />}
            {active === 'space' && <SpaceTheme />}
            {active === 'scroll3d' && <Scroll3DTheme />}
            {active === 'museum' && <MuseumTheme />}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
