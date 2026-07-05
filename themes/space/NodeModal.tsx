'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { VideoEmbed } from '@/components/shared/VideoEmbed';
import type { ModalSection, SpaceNode } from './constellations';

interface NodeModalProps {
  node: SpaceNode;
  reducedMotion: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, iframe, video, [tabindex]:not([tabindex="-1"])';

function ChipRow({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-theme-fg/90"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ section }: { section: ModalSection }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-accent">
        {section.heading}
      </h3>

      {section.kind === 'chips' && <ChipRow items={section.items} />}

      {section.kind === 'experience' && (
        <div className="space-y-5">
          {section.items.map((item) => (
            <article key={`${item.org}-${item.title}`} className="space-y-2">
              <header>
                <p className="font-semibold leading-snug text-theme-fg">{item.title}</p>
                <p className="font-mono text-xs text-theme-muted">
                  {item.org} · {item.startDate} – {item.endDate}
                </p>
              </header>
              <p className="text-sm leading-relaxed text-theme-fg/85">{item.summary}</p>
              <ul className="space-y-1.5">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-theme-muted">
                    <span aria-hidden="true" className="mt-[2px] select-none text-theme-accent2">
                      ✦
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {section.kind === 'milestones' && (
        <ul className="space-y-4">
          {section.items.map((m) => (
            <li key={m.id} className="grid gap-x-4 gap-y-1 sm:grid-cols-[7.5rem_1fr]">
              <span className="font-mono text-xs leading-6 text-theme-accent2">{m.period}</span>
              <div>
                <p className="font-semibold leading-snug text-theme-fg">{m.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-theme-muted">{m.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {section.kind === 'education' && (
        <div className="space-y-4">
          {section.items.map((item) => (
            <article key={item.institution} className="space-y-2">
              <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-semibold leading-snug text-theme-fg">{item.degree}</p>
                <span className="rounded-full border border-theme-accent/40 bg-theme-accent/10 px-2.5 py-0.5 text-[11px] text-theme-accent">
                  {item.status}
                </span>
              </header>
              <p className="font-mono text-xs text-theme-muted">
                {item.institution} · {item.startDate}
              </p>
              <p className="text-sm leading-relaxed text-theme-fg/85">{item.detail}</p>
            </article>
          ))}
        </div>
      )}

      {section.kind === 'certifications' && (
        <div className="space-y-4">
          {section.items.map((item) => (
            <article key={item.title} className="space-y-1.5">
              <p className="font-semibold leading-snug text-theme-fg">{item.title}</p>
              <p className="font-mono text-xs text-theme-muted">
                {item.institution} · {item.period}
              </p>
              <p className="text-sm leading-relaxed text-theme-fg/85">{item.detail}</p>
            </article>
          ))}
        </div>
      )}

      {section.kind === 'showcase' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {section.items.map((item) => (
            <figure
              key={item.title}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
            >
              <VideoEmbed video={item.video} title={item.title} cover={item.coverImage} />
              <figcaption className="space-y-0.5 p-3">
                <p className="text-sm font-semibold text-theme-fg">{item.title}</p>
                <p className="font-mono text-[11px] text-theme-accent2">{item.role}</p>
                <p className="text-xs leading-relaxed text-theme-muted">{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Glassmorphic detail dialog for a constellation node. Focus moves in on
 * open, Tab is trapped inside, Esc / backdrop / ✕ close it, and the caller
 * restores focus to the originating star button.
 */
export default function NodeModal({ node, reducedMotion, onClose }: NodeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `space-modal-title-${node.id}`;

  // Move focus into the dialog on open.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Esc closes; Tab cycles inside the dialog.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.getClientRects().length > 0);
      if (focusables.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && root.contains(active);
      if (e.shiftKey) {
        if (!inside || active === first || active === root) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const duration = reducedMotion ? 0 : 0.28;

  return (
    <div className="absolute inset-0 z-modal grid place-items-center p-4 sm:p-8">
      {/* Backdrop — supplementary close affordance (Esc + ✕ also close). */}
      <motion.div
        className="absolute inset-0 bg-[#05070f]/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl ${
          node.wide ? 'max-w-3xl' : 'max-w-xl'
        }`}
        initial={{ opacity: 0, scale: 0.92, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration, ease: 'easeOut' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/10 p-2 text-theme-fg transition-colors hover:bg-white/20"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="overflow-y-auto overscroll-contain p-6 sm:p-8">
          <header className="mb-6 border-b border-white/10 pb-5 pr-10">
            <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-theme-accent2">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-theme-accent shadow-[0_0_8px_2px_rgb(var(--accent-rgb)/0.6)]"
              />
              Constellation
            </p>
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-theme-fg sm:text-2xl">
              {node.label}
            </h2>
            <p className="mt-1 text-sm text-theme-muted">{node.sublabel}</p>
          </header>

          <div className="space-y-7">
            {node.sections.map((section) => (
              <Section key={section.heading} section={section} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
