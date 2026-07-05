'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme/ThemeProvider';
import styles from './museum.module.css';

/**
 * Entrance animation for exhibits: a gentle fade/rise as the piece scrolls
 * into view. Renders a plain <div> when the visitor prefers reduced motion.
 */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { reducedMotion } = useTheme();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Room header: catalogue number + serif title with a brass rule. */
export function RoomHeading({
  number,
  title,
  note,
}: {
  number: string;
  title: string;
  note?: string;
}) {
  return (
    <header className="mb-8 md:mb-12">
      <Rise>
        <p className={styles.catalogue}>Exhibit {number}</p>
        <div className="mt-2 flex items-baseline gap-5">
          <h2 className="font-serif text-2xl text-theme-fg md:text-4xl">{title}</h2>
          <span
            aria-hidden
            className="hidden h-px flex-1 bg-gradient-to-r from-theme-accent/70 to-transparent md:block"
          />
        </div>
        {note && <p className="mt-2 text-xs italic text-theme-muted">{note}</p>}
      </Rise>
    </header>
  );
}

/** Small museum label card — tiny uppercase catalogue line + serif title. */
export function MuseumLabel({
  no,
  title,
  medium,
  children,
  className = '',
}: {
  no: string;
  title: string;
  medium?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.label} ${className}`}>
      <p className={styles.catalogue}>{no}</p>
      <p className="mt-1.5 font-serif text-sm text-theme-fg">{title}</p>
      {medium && <p className="mt-0.5 text-xs italic text-theme-muted">{medium}</p>}
      {children}
    </div>
  );
}
