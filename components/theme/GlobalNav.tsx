'use client';

import { FileDown, Mail } from 'lucide-react';
import { profile } from '@/data/profile';
import { ThemeSwitcher } from './ThemeSwitcher';

/**
 * Persistent utility bar rendered above every theme. Guarantees the résumé
 * download and theme switching are reachable from any theme (Section 7).
 * Colors resolve from per-theme CSS variables so the bar blends in.
 */
export function GlobalNav() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-nav flex h-nav items-center gap-3 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] px-3 backdrop-blur-md sm:px-5"
      role="banner"
    >
      <a
        href="/"
        className="flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent"
        aria-label={`${profile.identity.name} — home`}
      >
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-md bg-theme-accent font-mono text-xs font-bold text-black"
        >
          TK
        </span>
        <span className="hidden text-sm font-semibold text-[var(--nav-fg)] md:inline">
          {profile.identity.name}
        </span>
      </a>

      <span className="hidden flex-1 truncate text-xs text-[var(--nav-fg)] opacity-50 lg:block">
        {profile.identity.titles.join(' · ')} — {profile.identity.org}
      </span>
      <span className="flex-1 lg:hidden" />

      <a
        href={`mailto:${profile.identity.links.email}`}
        className="hidden h-9 items-center gap-2 rounded-md border border-[var(--nav-border)] bg-[var(--nav-chip)] px-3 text-sm text-[var(--nav-fg)] transition-colors hover:border-theme-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent sm:flex"
        aria-label="Email Taha Kothari"
      >
        <Mail size={15} aria-hidden />
        <span className="hidden md:inline">Contact</span>
      </a>

      <a
        href={profile.identity.resumePdf}
        download
        className="flex h-9 items-center gap-2 rounded-md bg-theme-accent px-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent"
      >
        <FileDown size={15} aria-hidden />
        <span>Résumé</span>
      </a>

      <ThemeSwitcher />
    </header>
  );
}
