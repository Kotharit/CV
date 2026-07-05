'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  FileDown,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Power,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { profile } from '@/data/profile';
import styles from './win7.module.css';

interface ProgramLink {
  key: string;
  label: string;
  sub: string;
  href: string;
  icon: LucideIcon;
  download?: boolean;
  external?: boolean;
  accent?: boolean;
}

const PROGRAMS: readonly ProgramLink[] = [
  {
    key: 'resume',
    label: 'Download Résumé',
    sub: 'PDF document',
    href: profile.identity.resumePdf,
    icon: FileDown,
    download: true,
    accent: true,
  },
  {
    key: 'email',
    label: 'Email',
    sub: profile.identity.links.email,
    href: `mailto:${profile.identity.links.email}`,
    icon: Mail,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    sub: profile.identity.links.linkedin,
    href: profile.identity.links.linkedin,
    icon: Linkedin,
    external: true,
  },
  {
    key: 'github',
    label: 'GitHub',
    sub: profile.identity.links.github,
    href: profile.identity.links.github,
    icon: Github,
    external: true,
  },
];

interface StartMenuProps {
  orbRef: RefObject<HTMLButtonElement>;
  reducedMotion: boolean;
  onClose: () => void;
  /** Playful "Shut down": closes every open window along with the menu. */
  onShutDown: () => void;
}

export function StartMenu({ orbRef, reducedMotion, onClose, onShutDown }: StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const [query, setQuery] = useState('');

  // Close on outside click / Escape (listeners torn down on unmount).
  useEffect(() => {
    const onDocPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (orbRef.current?.contains(target)) return; // orb toggles itself
      onClose();
    };
    const onDocKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        orbRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [onClose, orbRef]);

  useEffect(() => {
    firstItemRef.current?.focus();
  }, []);

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? PROGRAMS.filter((p) => p.label.toLowerCase().includes(normalized))
    : PROGRAMS;

  const initials = profile.identity.name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('');

  return (
    <motion.div
      ref={menuRef}
      id="win7-start-menu"
      role="dialog"
      aria-label="Start menu"
      className={styles.startMenu}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: reducedMotion ? 0.05 : 0.16, ease: 'easeOut' }}
    >
      <div className={styles.startColumns}>
        <div className={styles.startLeft}>
          {filtered.map((program, index) => {
            const Icon = program.icon;
            return (
              <a
                key={program.key}
                ref={index === 0 ? firstItemRef : undefined}
                className={styles.programItem}
                href={program.href}
                {...(program.download ? { download: true } : {})}
                {...(program.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <span
                  className={`${styles.programIcon} ${
                    program.accent ? styles.programIconAccent : ''
                  }`}
                  aria-hidden
                >
                  <Icon size={16} />
                </span>
                <span className={styles.programText}>
                  <span className={styles.programLabel}>{program.label}</span>
                  <span className={styles.programSub}>{program.sub}</span>
                </span>
              </a>
            );
          })}
          {filtered.length === 0 && (
            <p className={styles.noResults}>No items match your search.</p>
          )}
        </div>

        <div className={styles.startRight}>
          <span className={styles.avatar} aria-hidden>
            {initials}
          </span>
          <p className={styles.startName}>{profile.identity.name}</p>
          <p className={styles.startTitles}>{profile.identity.titles.join(' · ')}</p>
          <p className={styles.startFact}>
            <Building2 size={13} aria-hidden />
            {profile.identity.org}
          </p>
          <p className={styles.startFact}>
            <MapPin size={13} aria-hidden />
            {profile.identity.location}
          </p>
        </div>
      </div>

      <div className={styles.startFooter}>
        <div className={styles.searchWrap}>
          <Search size={13} aria-hidden className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchBox}
            aria-label="Search programs"
            placeholder="Search programs and files"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <button
          type="button"
          className={styles.shutdownBtn}
          title="Closes all open windows"
          onClick={onShutDown}
        >
          <Power size={13} aria-hidden />
          Shut down
        </button>
      </div>
    </motion.div>
  );
}
