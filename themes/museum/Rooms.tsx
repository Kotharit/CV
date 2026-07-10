'use client';

import { FileText, Github, Linkedin, Mail } from 'lucide-react';
import {
  EXPERTISE_LABELS,
  profile,
  type ExperienceItem,
  type ExpertiseKey,
} from '@/data/profile';
import { useTheme } from '@/components/theme/ThemeProvider';
import { VideoShelf } from '@/components/shared/VideoShelf';
import { CrtExhibit } from './CrtExhibit';
import { MuseumLabel, Rise, RoomHeading } from './Exhibit';
import styles from './museum.module.css';

const EXPERTISE_KEYS: readonly ExpertiseKey[] = ['it', 'marketing', 'creative', 'stack'];

/* ---------------------------------------------------------------- entrance */

function EntranceRoom() {
  const { identity } = profile;
  return (
    <div className="grid items-center gap-12 md:grid-cols-[7fr_5fr] md:gap-16">
      <div className={styles.spotlit}>
        <Rise>
          <p className={styles.catalogue}>Exhibit 01 · The Permanent Collection</p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-theme-fg sm:text-5xl lg:text-7xl">
            {identity.name}
          </h1>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-theme-muted">
            {identity.titles.join(' · ')}
          </p>
          <p className="mt-2 text-sm text-theme-muted">
            {identity.org} — {identity.location} · Age {identity.age}
          </p>
          <p className={`${styles.engraved} mt-7 max-w-md text-lg leading-relaxed`}>
            {identity.tagline}
          </p>
        </Rise>
      </div>
      <Rise delay={0.15} className="md:justify-self-end">
        <aside className={`${styles.wallText} max-w-md`} aria-label="Wall text — about">
          <p className={styles.catalogue}>Wall text</p>
          <p className="mt-4 font-serif text-[15px] leading-relaxed text-theme-fg">
            {identity.summary}
          </p>
          {profile.about.map((para, i) => (
            <p key={i} className="mt-4 text-sm leading-relaxed text-theme-muted">
              {para}
            </p>
          ))}
          <VideoShelf section="about" compact className="mt-7" />
        </aside>
      </Rise>
    </div>
  );
}

/* ------------------------------------------------------------- career hall */

function CareerCanvas({ exp, index }: { exp: ExperienceItem; index: number }) {
  const bullets: readonly string[] = exp.bullets;
  return (
    <Rise delay={index * 0.12}>
      <figure className={styles.spotlit}>
        <div className={styles.frame}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-theme-muted">
            {exp.startDate} — {exp.endDate}
          </p>
          <h3 className="mt-3 font-serif text-xl text-theme-fg md:text-2xl">{exp.title}</h3>
          <p className={`${styles.engraved} mt-3 text-sm leading-relaxed`}>{exp.summary}</p>
          <ul className="mt-5 space-y-2.5 border-t border-theme-border pt-4">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-theme-muted">
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-theme-accent" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <figcaption className="mt-6">
          <MuseumLabel
            no={`Exhibit 02.${index + 1}`}
            title={exp.org}
            medium={`Career record, ${exp.startDate} — ${exp.endDate}`}
          />
        </figcaption>
      </figure>
    </Rise>
  );
}

function CareerHall() {
  return (
    <>
      <RoomHeading number="02" title="Career Hall" note="Works on long-term loan from the artist." />
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        {profile.experience.map((exp, i) => (
          <CareerCanvas key={exp.title} exp={exp} index={i} />
        ))}
      </div>
      <Rise delay={0.2} className="mt-12">
        <VideoShelf section="experience" className="max-w-xl" />
      </Rise>
    </>
  );
}

/* ----------------------------------------------------------- property wing */

function PropertyWing() {
  const itSkills: readonly string[] = profile.expertise.it;
  return (
    <>
      <RoomHeading number="03" title="Property Wing" />
      <Rise>
        <ul
          className={`${styles.spotlit} flex flex-wrap gap-2 md:gap-3`}
          aria-label="Properties in the IT scope"
        >
          {profile.properties.map((p, i) => (
            <li key={p} className={styles.plate}>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-theme-muted">
                No. {String(i + 1).padStart(2, '0')}
              </span>
              <span className="mt-1 block font-serif text-base text-theme-fg md:text-lg">{p}</span>
            </li>
          ))}
        </ul>
      </Rise>
      <Rise delay={0.15} className="mt-12">
        <MuseumLabel no="Wall label" title={EXPERTISE_LABELS.it} className="max-w-xl">
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            {itSkills.map((s) => (
              <li key={s} className="text-sm text-theme-muted">
                — {s}
              </li>
            ))}
          </ul>
        </MuseumLabel>
      </Rise>
    </>
  );
}

/* ------------------------------------------------------------------- study */

function Diploma({
  kind,
  institution,
  title,
  meta,
  detail,
  index,
}: {
  kind: string;
  institution: string;
  title: string;
  meta: string;
  detail: string;
  index: number;
}) {
  return (
    <Rise delay={index * 0.12}>
      <div className={styles.spotlit}>
        <div className={styles.diploma}>
          <p className={styles.catalogue}>{kind}</p>
          <p className="mt-5 font-serif text-xs uppercase tracking-[0.25em] text-theme-muted">
            {institution}
          </p>
          <h3 className="mt-3 font-serif text-xl leading-snug text-theme-fg md:text-2xl">
            {title}
          </h3>
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-theme-muted">{meta}</p>
          <div className={`${styles.seal} mt-7`} aria-hidden />
          <p className="mx-auto mt-6 max-w-sm text-[13px] leading-relaxed text-theme-muted">
            {detail}
          </p>
        </div>
      </div>
    </Rise>
  );
}

function StudyRoom() {
  return (
    <>
      <RoomHeading number="04" title="The Study" />
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        {profile.education.map((ed, i) => (
          <Diploma
            key={ed.degree}
            kind="Degree"
            institution={ed.institution}
            title={ed.degree}
            meta={`${ed.status} · since ${ed.startDate}`}
            detail={ed.detail}
            index={i}
          />
        ))}
        {profile.certifications.map((c, i) => (
          <Diploma
            key={c.title}
            kind="Certification"
            institution={c.institution}
            title={c.title}
            meta={c.period}
            detail={c.detail}
            index={profile.education.length + i}
          />
        ))}
      </div>
      <Rise delay={0.2} className="mt-12">
        <VideoShelf section="education" className="max-w-xl" />
      </Rise>
    </>
  );
}

/* ---------------------------------------------------------- screening room */

function ScreeningRoom() {
  const { webglSupported, reducedMotion, isMobile } = useTheme();
  const crtLive = webglSupported && !reducedMotion && !isMobile;
  return (
    <>
      <RoomHeading
        number="05"
        title="Screening Room"
        note={
          crtLive
            ? 'Step closer — hover or focus a monitor to run its reel.'
            : 'Use the controls on each monitor to run its reel.'
        }
      />
      <div className="grid justify-items-center gap-10 md:grid-cols-2 md:gap-x-12">
        {profile.showcase.map((item, i) => (
          <Rise key={item.title} delay={i * 0.1} className="w-full max-w-[420px]">
            <CrtExhibit item={item} index={i} />
          </Rise>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------- expertise wall */

function ExpertiseWall() {
  return (
    <>
      <RoomHeading number="06" title="Expertise Wall" />
      <div className="grid gap-8 sm:grid-cols-2 md:gap-10">
        {EXPERTISE_KEYS.map((key, i) => {
          const items: readonly string[] = profile.expertise[key];
          return (
            <Rise key={key} delay={i * 0.08}>
              <section aria-label={EXPERTISE_LABELS[key]} className={`${styles.label} h-full`}>
                <p className={styles.catalogue}>
                  06.{i + 1} · {EXPERTISE_LABELS[key]}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {items.map((s) => (
                    <li key={s} className={styles.chip}>
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            </Rise>
          );
        })}
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
        <Rise delay={0.15}>
          <VideoShelf section="expertise" />
        </Rise>
        <Rise delay={0.22}>
          <VideoShelf section="marketing" />
        </Rise>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------- exit */

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

function ExitRoom() {
  const { identity } = profile;
  const contacts = [
    {
      label: 'Email',
      value: identity.links.email,
      href: `mailto:${identity.links.email}`,
      Icon: Mail,
      external: false,
    },
    {
      label: 'LinkedIn',
      value: stripProtocol(identity.links.linkedin),
      href: identity.links.linkedin,
      Icon: Linkedin,
      external: true,
    },
    {
      label: 'GitHub',
      value: stripProtocol(identity.links.github),
      href: identity.links.github,
      Icon: Github,
      external: true,
    },
  ];

  return (
    <>
      <RoomHeading number="07" title="Exit Through the Guest Book" />
      <Rise>
        <p className={`${styles.engraved} max-w-md text-lg leading-relaxed`}>
          Thank you for visiting the collection. Correspondence is welcome.
        </p>
        <ul className="mt-10 flex flex-col flex-wrap gap-4 sm:flex-row">
          {contacts.map(({ label, value, href, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                className={styles.plaque}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={`${label}: ${value}`}
              >
                <Icon size={16} aria-hidden />
                <span className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-[0.3em]">{label}</span>
                  <span className="font-serif text-sm leading-tight">{value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Rise>
      <Rise delay={0.12} className="mt-14">
        <a
          href={identity.resumePdf}
          download
          className={`${styles.label} inline-flex max-w-xl items-center gap-4 transition-colors hover:border-l-theme-accent2 focus-visible:border-l-theme-accent2`}
        >
          <FileText size={18} aria-hidden className="shrink-0 text-theme-accent" />
          <span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-theme-muted">
              Front desk
            </span>
            <span className="mt-1 block font-serif text-sm text-theme-fg">
              Catalogue available at the front desk —{' '}
              <span className="underline decoration-theme-accent/60 underline-offset-4">
                download the résumé (PDF)
              </span>
            </span>
          </span>
        </a>
      </Rise>
    </>
  );
}

/* ------------------------------------------------------------------- rooms */

export interface RoomDef {
  id: string;
  name: string;
  /** Screening room gets the dark wall wash. */
  dark?: boolean;
  Component: () => JSX.Element;
}

export const ROOMS: readonly RoomDef[] = [
  { id: 'entrance', name: 'Entrance', Component: EntranceRoom },
  { id: 'career', name: 'Career Hall', Component: CareerHall },
  { id: 'properties', name: 'Property Wing', Component: PropertyWing },
  { id: 'study', name: 'The Study', Component: StudyRoom },
  { id: 'screening', name: 'Screening Room', dark: true, Component: ScreeningRoom },
  { id: 'expertise', name: 'Expertise Wall', Component: ExpertiseWall },
  { id: 'exit', name: 'Exit', Component: ExitRoom },
];
