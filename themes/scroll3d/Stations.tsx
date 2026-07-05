'use client';

/**
 * Content stations for the Scroll3D theme.
 *
 * IMPORTANT: in 3D mode these components render inside drei's `<Scroll html>`
 * secondary React root, where app-level contexts (ThemeProvider) are NOT
 * available — everything they need arrives via props or module imports.
 * drei bridges its own scroll context + the R3F store, so `useScroll` /
 * `useFrame` are safe inside `Station3DShell`.
 */

import { useRef, type ComponentType, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Camera,
  ChevronDown,
  Clapperboard,
  Database,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Megaphone,
  Network,
} from 'lucide-react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import {
  EXPERTISE_LABELS,
  TRACK_LABELS,
  profile,
  type Milestone,
} from '@/data/profile';
import { VideoEmbed } from '@/components/shared/VideoEmbed';
import styles from './scroll3d.module.css';

export interface StationContentProps {
  /** False in the reduced-motion flat fallback: no looping animation. */
  motionOk: boolean;
}

export interface StationDef {
  id: string;
  /** Short label for the HUD rail. */
  label: string;
  headingId: string;
  Content: ComponentType<StationContentProps>;
}

const STAGE_HEIGHT = 'calc(100vh - var(--nav-h))';

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function findMilestone(id: string): Milestone {
  return profile.milestones.find((m) => m.id === id) ?? profile.milestones[0];
}

/* ------------------------------------------------------------------------ */
/* Shared atoms                                                             */
/* ------------------------------------------------------------------------ */

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className={styles.eyebrow}>{children}</p>;
}

function StationHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-2 text-3xl font-extrabold tracking-tight text-theme-fg">
      {children}
    </h2>
  );
}

function TagRow({ label, tags }: { label: string; tags: readonly string[] }) {
  return (
    <div className="mt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-theme-muted">
        {label}
      </p>
      <ul className="mt-2 flex flex-wrap gap-2" aria-label={label}>
        {tags.map((t) => (
          <li key={t} className={styles.tag}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MilestoneCard({ m, icon }: { m: Milestone; icon?: ReactNode }) {
  return (
    <article className={styles.card}>
      <div className="flex items-center gap-2 text-theme-accent">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
          {m.period}
        </span>
      </div>
      <h3 className="mt-1.5 text-sm font-bold text-theme-fg">{m.title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-theme-muted">{m.detail}</p>
    </article>
  );
}

/* ------------------------------------------------------------------------ */
/* Station 1 — Intro                                                        */
/* ------------------------------------------------------------------------ */

function IntroStation({ motionOk }: StationContentProps) {
  const { identity } = profile;
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
      <Eyebrow>
        {identity.org} · {identity.location}
      </Eyebrow>
      <h1
        id="s3d-intro"
        className={`${styles.neonTitle} mt-4 text-6xl font-black tracking-tight xl:text-7xl`}
      >
        {identity.name}
      </h1>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {identity.titles.map((title, i) => (
          <span
            key={title}
            className={`${styles.titleChip} ${i % 2 === 1 ? styles.titleChipAlt : ''}`}
          >
            {title}
          </span>
        ))}
      </div>
      <p className="mt-7 max-w-xl text-base leading-relaxed text-theme-muted">
        {identity.tagline}
      </p>

      <div className="mt-16 flex flex-col items-center gap-2 text-theme-accent">
        <span className="font-mono text-[11px] uppercase tracking-[0.35em]">
          Scroll to fly
        </span>
        {motionOk ? (
          <motion.span
            aria-hidden
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={22} />
          </motion.span>
        ) : (
          <ChevronDown size={22} aria-hidden />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Station 2 — Rails Portal lifecycle                                       */
/* ------------------------------------------------------------------------ */

/** Presentation chrome — placeholder phase names for the portal arc. */
const PORTAL_PHASES = ['Discovery', 'Build', 'Launch', 'Iterate'] as const;

function PortalStation(_: StationContentProps) {
  const portal = findMilestone('rails-portal');
  const lead = profile.experience[0];
  const portalBullet =
    lead.bullets.find((b) => /portal/i.test(b)) ?? lead.bullets[0];

  return (
    <div className={`${styles.panel} mx-auto max-w-3xl p-8 text-center`}>
      <Eyebrow>Flagship · {portal.period}</Eyebrow>
      <StationHeading id="s3d-portal">{portal.title}</StationHeading>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-theme-muted">
        {portal.detail}
      </p>

      <blockquote className="mx-auto mt-5 max-w-xl rounded-xl border border-theme-accent2/30 bg-theme-accent2/5 px-5 py-4 text-left">
        <div className="flex items-start gap-3">
          <Database size={16} aria-hidden className="mt-0.5 shrink-0 text-theme-accent2" />
          <p className="text-xs leading-relaxed text-theme-fg">{portalBullet}</p>
        </div>
        <footer className="mt-2 pl-7 font-mono text-[10px] uppercase tracking-[0.2em] text-theme-muted">
          {lead.title} · {lead.org}
        </footer>
      </blockquote>

      <ol className={styles.phaseStrip} aria-label="Portal lifecycle phases (placeholder)">
        {PORTAL_PHASES.map((phase, i) => (
          <li key={phase} className={styles.phase}>
            <span className={styles.phaseDot} aria-hidden />
            <span className="font-mono text-[10px] text-theme-muted">
              0{i + 1}
            </span>
            <span className="text-xs font-semibold text-theme-fg">{phase}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-theme-muted">
        Placeholder phase breakdown of the 24-month arc
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Station 3 — IT deployments across properties                             */
/* ------------------------------------------------------------------------ */

function InfraStation({ motionOk }: StationContentProps) {
  const cctv = findMilestone('cctv-rollout');
  const network = findMilestone('network-rebuild');

  return (
    <div className={`${styles.panel} mx-auto max-w-4xl p-8`}>
      <Eyebrow>{TRACK_LABELS.V2}</Eyebrow>
      <StationHeading id="s3d-infra">IT Deployments Across Properties</StationHeading>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-theme-muted">
        Coverage
      </p>
      <ul className="mt-2 flex flex-wrap gap-2.5" aria-label="Properties covered">
        {profile.properties.map((prop, i) => (
          <li
            key={prop}
            className={`${styles.propChip} ${motionOk ? styles.propChipFloat : ''}`}
            style={motionOk ? { animationDelay: `${(i % 5) * 0.45}s` } : undefined}
          >
            {prop}
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <MilestoneCard m={cctv} icon={<Camera size={15} aria-hidden />} />
        <MilestoneCard m={network} icon={<Network size={15} aria-hidden />} />
      </div>

      <TagRow label={EXPERTISE_LABELS.it} tags={profile.expertise.it} />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Station 4 — Marketing operations                                         */
/* ------------------------------------------------------------------------ */

function MarketingStation(_: StationContentProps) {
  const marketingMilestones = profile.milestones.filter((m) => m.track === 'A1');
  const lead = profile.experience[0];
  const marketingBullet = lead.bullets.find((b) => /marketing/i.test(b));

  return (
    <div className={`${styles.panel} mx-auto max-w-3xl p-8`}>
      <div className="flex items-center gap-3">
        <Megaphone size={18} aria-hidden className="text-theme-accent2" />
        <Eyebrow>Track A1</Eyebrow>
      </div>
      <StationHeading id="s3d-marketing">{TRACK_LABELS.A1}</StationHeading>
      {marketingBullet && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-theme-muted">
          {marketingBullet}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {marketingMilestones.map((m) => (
          <MilestoneCard key={m.id} m={m} />
        ))}
      </div>

      <TagRow label={EXPERTISE_LABELS.marketing} tags={profile.expertise.marketing} />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Station 5 — Education orbit                                              */
/* ------------------------------------------------------------------------ */

function EducationStation(_: StationContentProps) {
  return (
    <div className={`${styles.panel} mx-auto max-w-3xl p-8`}>
      <div className="flex items-center gap-3">
        <GraduationCap size={18} aria-hidden className="text-theme-accent" />
        <Eyebrow>{TRACK_LABELS.V1}</Eyebrow>
      </div>
      <StationHeading id="s3d-education">Education Orbit</StationHeading>

      {profile.education.map((edu) => (
        <article key={edu.institution} className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-theme-fg">{edu.degree}</h3>
            <span className={styles.statusBadge}>{edu.status}</span>
          </div>
          <p className="mt-1 text-sm text-theme-accent">
            {edu.institution}
            <span className="text-theme-muted"> · since {edu.startDate}</span>
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-theme-muted">
            {edu.detail}
          </p>
        </article>
      ))}

      <div className="mt-6 border-t border-theme-border pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-theme-muted">
          Certifications
        </p>
        {profile.certifications.map((cert) => (
          <article key={cert.title} className={`${styles.card} mt-3`}>
            <div className="flex items-center gap-2 text-theme-accent2">
              <Award size={15} aria-hidden />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
                {cert.period}
              </span>
            </div>
            <h3 className="mt-1.5 text-sm font-bold text-theme-fg">{cert.title}</h3>
            <p className="mt-0.5 text-xs text-theme-accent">{cert.institution}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-theme-muted">
              {cert.detail}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Station 6 — Showcase bay                                                 */
/* ------------------------------------------------------------------------ */

function ShowcaseStation(_: StationContentProps) {
  return (
    <div className={`${styles.panel} mx-auto max-w-4xl p-7`}>
      <div className="flex items-center gap-3">
        <Clapperboard size={18} aria-hidden className="text-theme-accent2" />
        <Eyebrow>{TRACK_LABELS.V3}</Eyebrow>
      </div>
      <StationHeading id="s3d-showcase">Showcase Bay</StationHeading>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {profile.showcase.map((item) => (
          <li
            key={item.title}
            className="overflow-hidden rounded-xl border border-theme-border bg-theme-bg/60"
          >
            <VideoEmbed video={item.video} title={item.title} cover={item.coverImage} />
            <div className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="truncate text-sm font-bold text-theme-fg">
                  {item.title}
                </h3>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-theme-accent">
                  {item.role}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-theme-muted">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Station 7 — Outro / contact                                              */
/* ------------------------------------------------------------------------ */

function ContactStation(_: StationContentProps) {
  const { identity } = profile;
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 text-center">
      <Eyebrow>End of the line · 07 / 07</Eyebrow>
      <h2
        id="s3d-contact"
        className={`${styles.neonTitle} mt-4 text-4xl font-black tracking-tight xl:text-5xl`}
      >
        Get in touch
      </h2>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-theme-muted">
        The tunnel ends here — the conversation doesn&apos;t. Systems, stories, or
        both: the inbox is open.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <a href={`mailto:${identity.links.email}`} className={styles.contactLink}>
          <Mail size={16} aria-hidden className="text-theme-accent" />
          {identity.links.email}
        </a>
        <a
          href={identity.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          <Linkedin size={16} aria-hidden className="text-theme-accent" />
          LinkedIn
        </a>
        <a
          href={identity.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          <Github size={16} aria-hidden className="text-theme-accent" />
          GitHub
        </a>
      </div>

      <p className="mt-14 font-mono text-[10px] uppercase tracking-[0.3em] text-theme-muted">
        {identity.name} · {identity.location} — thanks for flying
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Station registry                                                         */
/* ------------------------------------------------------------------------ */

export const STATIONS: readonly StationDef[] = [
  { id: 'intro', label: 'Intro', headingId: 's3d-intro', Content: IntroStation },
  { id: 'portal', label: 'Rails Portal', headingId: 's3d-portal', Content: PortalStation },
  { id: 'infra', label: 'IT Deployments', headingId: 's3d-infra', Content: InfraStation },
  { id: 'marketing', label: 'Marketing Ops', headingId: 's3d-marketing', Content: MarketingStation },
  { id: 'education', label: 'Education', headingId: 's3d-education', Content: EducationStation },
  { id: 'showcase', label: 'Showcase Bay', headingId: 's3d-showcase', Content: ShowcaseStation },
  { id: 'contact', label: 'Contact', headingId: 's3d-contact', Content: ContactStation },
];

/* ------------------------------------------------------------------------ */
/* 3D-mode shells: scroll-linked fade / tilt driven imperatively (no React  */
/* re-render per frame).                                                    */
/* ------------------------------------------------------------------------ */

function Station3DShell({
  index,
  headingId,
  children,
}: {
  index: number;
  headingId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    const node = ref.current;
    if (!node || !scroll) return;
    const pos = scroll.offset * (STATIONS.length - 1);
    const d = pos - index; // <0 approaching, >0 receding
    const abs = Math.abs(d);
    const opacity = clamp(1.25 - abs * 1.55, 0, 1);
    node.style.opacity = opacity.toFixed(3);
    node.style.transform = `perspective(1100px) translateY(${(d * -46).toFixed(1)}px) rotateX(${clamp(d * 9, -14, 14).toFixed(2)}deg) scale(${(1 - Math.min(abs, 1) * 0.06).toFixed(3)})`;
  });

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-full items-center justify-center px-6"
      style={{ height: STAGE_HEIGHT }}
    >
      <div
        ref={ref}
        className={`${styles.clamp} w-full py-4 will-change-transform`}
        style={{ opacity: index === 0 ? 1 : 0 }}
      >
        {children}
      </div>
    </section>
  );
}

/** Mounted inside drei's `<Scroll html>` — one full-stage section per station. */
export function Stations3D() {
  return (
    <div className="w-full">
      {STATIONS.map((station, i) => (
        <Station3DShell key={station.id} index={i} headingId={station.headingId}>
          <station.Content motionOk />
        </Station3DShell>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Flat fallback: plain vertically-scrolling sections (reduced motion).     */
/* ------------------------------------------------------------------------ */

export function StationsFlat({
  registerSection,
}: {
  registerSection: (index: number, el: HTMLElement | null) => void;
}) {
  return (
    <div className="w-full">
      {STATIONS.map((station, i) => (
        <section
          key={station.id}
          ref={(el) => registerSection(i, el)}
          aria-labelledby={station.headingId}
          className="flex w-full items-center justify-center px-6 py-16"
          style={{ minHeight: STAGE_HEIGHT }}
        >
          <div className="w-full">
            <station.Content motionOk={false} />
          </div>
        </section>
      ))}
    </div>
  );
}
