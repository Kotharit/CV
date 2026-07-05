'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Clapperboard,
  Landmark,
  AppWindow,
  Rocket,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { THEMES, type ThemeId } from '@/lib/themes';
import { useTheme } from './ThemeProvider';

const THEME_ICONS: Record<ThemeId, LucideIcon> = {
  premiere: Clapperboard,
  win7: AppWindow,
  space: Sparkles,
  scroll3d: Rocket,
  museum: Landmark,
};

/**
 * Global theme switcher — a keyboard-operable menu button (ArrowUp/Down,
 * Home/End, Esc). WebGL-dependent themes are hidden when unsupported;
 * desktop-metaphor themes are labelled on phones (they fall back to the
 * Museum linear view). Number keys 1–5 also switch themes globally (see
 * ThemeRoot), mirrored here as kbd hints.
 */
export function ThemeSwitcher() {
  const { theme, setTheme, webglSupported, isMobile, hydrated } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const available = THEMES.filter((t) => !t.requiresWebGL || webglSupported);
  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const ActiveIcon = THEME_ICONS[active.id];

  // Close on outside click / Escape — listeners removed on cleanup.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Focus the active option when the menu opens.
  useEffect(() => {
    if (!open) return;
    const options = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!options?.length) return;
    const selected = Array.from(options).find((o) => o.getAttribute('aria-selected') === 'true');
    (selected ?? options[0]).focus();
  }, [open]);

  // Roving focus inside the menu.
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const options = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!options?.length) return;
    const list = Array.from(options);
    const idx = list.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = idx < 0 ? 0 : (idx + 1) % list.length;
    else if (e.key === 'ArrowUp') next = idx < 0 ? list.length - 1 : (idx - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    if (next >= 0) {
      e.preventDefault();
      list[next].focus();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Switch theme, current theme: ${active.label}`}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-md border border-[var(--nav-border)] bg-[var(--nav-chip)] px-3 text-sm font-medium text-[var(--nav-fg)] transition-colors hover:border-theme-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent"
      >
        <ActiveIcon size={15} aria-hidden />
        <span className="hidden sm:inline">{active.label}</span>
        <ChevronDown
          size={14}
          aria-hidden
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={menuRef}
            role="listbox"
            aria-label="Portfolio theme"
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-11 z-overlay w-64 overflow-hidden rounded-lg border border-[var(--nav-border)] bg-[var(--nav-menu)] p-1 shadow-2xl backdrop-blur-xl"
          >
            {available.map((t) => {
              const Icon = THEME_ICONS[t.id];
              const selected = t.id === theme;
              const mobileFallback = hydrated && isMobile && t.desktopOnly;
              const shortcut = THEMES.findIndex((meta) => meta.id === t.id) + 1;
              return (
                <li key={t.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                      buttonRef.current?.focus();
                    }}
                    className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-theme-accent ${
                      selected
                        ? 'bg-theme-accent/15 text-[var(--nav-fg)]'
                        : 'text-[var(--nav-fg)] hover:bg-theme-accent/10'
                    }`}
                  >
                    <Icon size={16} aria-hidden className="mt-0.5 shrink-0 opacity-80" />
                    <span className="flex-1">
                      <span className="block font-medium">
                        {t.label}
                        {mobileFallback && (
                          <span className="ml-2 rounded bg-theme-accent/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                            desktop
                          </span>
                        )}
                      </span>
                      <span className="block text-xs opacity-60">
                        {mobileFallback ? 'Shows linear view on phones' : t.description}
                      </span>
                    </span>
                    {!isMobile && (
                      <kbd
                        aria-hidden
                        className="mt-0.5 hidden rounded border border-[var(--nav-border)] px-1.5 py-0.5 font-mono text-[10px] opacity-50 sm:block"
                      >
                        {shortcut}
                      </kbd>
                    )}
                    {selected && <Check size={16} aria-hidden className="mt-0.5 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
