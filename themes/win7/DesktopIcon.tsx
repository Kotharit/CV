'use client';

import type { LucideIcon } from 'lucide-react';
import styles from './win7.module.css';

interface DesktopIconProps {
  label: string;
  icon: LucideIcon;
  /** Folder shortcut vs. document (PDF) glyph. */
  glyph: 'folder' | 'pdf';
  /** Folder shortcuts open a window… */
  onOpen?: () => void;
  /** …document icons open an href in a new tab instead. */
  href?: string;
}

export function DesktopIcon({ label, icon, glyph, onOpen, href }: DesktopIconProps) {
  const Icon = icon;
  const visual =
    glyph === 'folder' ? (
      <span className={styles.folder} aria-hidden>
        <Icon size={19} strokeWidth={1.9} />
      </span>
    ) : (
      <span className={styles.file} aria-hidden>
        <Icon size={15} strokeWidth={1.9} />
        <span className={styles.fileTag}>PDF</span>
      </span>
    );

  if (href) {
    return (
      <a
        className={styles.icon}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} (opens in a new tab)`}
      >
        {visual}
        <span className={styles.iconLabel}>{label}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className={styles.icon}
      onClick={onOpen}
      aria-label={`Open ${label}`}
    >
      {visual}
      <span className={styles.iconLabel}>{label}</span>
    </button>
  );
}
