'use client';

import type { ComponentType } from 'react';
import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  Clapperboard,
  Code2,
  GraduationCap,
  MapPin,
  Megaphone,
  Network,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { EXPERTISE_LABELS, profile, type ExpertiseKey } from '@/data/profile';
import { VideoEmbed } from '@/components/shared/VideoEmbed';
import { VideoShelf } from '@/components/shared/VideoShelf';
import type { WindowId } from './useWindowManager';
import styles from './win7.module.css';

/* ------------------------------- About Me ------------------------------- */

function AboutContent() {
  const { identity } = profile;
  const initials = identity.name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('');

  return (
    <div>
      <div className={styles.aboutHero}>
        <span className={styles.aboutAvatar} aria-hidden>
          {initials}
        </span>
        <div>
          <p className={styles.aboutName}>{identity.name}</p>
          <p className={styles.aboutTagline}>{identity.tagline}</p>
        </div>
      </div>

      <div className={`${styles.chipRow} ${styles.contentSection}`}>
        {identity.titles.map((title) => (
          <span key={title} className={styles.chip}>
            <User size={12} aria-hidden />
            {title}
          </span>
        ))}
        <span className={styles.chip}>
          <Building2 size={12} aria-hidden />
          {identity.org}
        </span>
        <span className={styles.chip}>
          <MapPin size={12} aria-hidden />
          {identity.location}
        </span>
        <span className={styles.chip}>
          <CalendarDays size={12} aria-hidden />
          Age {identity.age}
        </span>
      </div>

      <section className={styles.contentSection} aria-label="About">
        <h2 className={styles.groupHeader}>
          <User size={13} aria-hidden />
          About
        </h2>
        <p className={styles.para}>{identity.summary}</p>
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className={styles.para}>
            {paragraph}
          </p>
        ))}
      </section>

      <section className={styles.contentSection} aria-label="Properties in IT scope">
        <h2 className={styles.groupHeader}>
          <MapPin size={13} aria-hidden />
          Properties in IT scope
        </h2>
        <div className={styles.chipRow}>
          {profile.properties.map((property) => (
            <span key={property} className={styles.chip}>
              <MapPin size={12} aria-hidden />
              {property}
            </span>
          ))}
        </div>
      </section>

      <VideoShelf section="about" compact className={styles.contentSection} />
    </div>
  );
}

/* ------------------------------- Education ------------------------------ */

function EducationContent() {
  return (
    <div>
      <section className={styles.contentSection} aria-label="Education">
        <h2 className={styles.groupHeader}>
          <GraduationCap size={13} aria-hidden />
          Education
        </h2>
        {profile.education.map((entry) => (
          <article key={entry.institution} className={styles.itemCard}>
            <h3 className={styles.itemTitle}>{entry.degree}</h3>
            <p className={styles.itemMeta}>
              {entry.institution} · {entry.startDate} · {entry.status}
            </p>
            <p className={styles.paraTight}>{entry.detail}</p>
          </article>
        ))}
      </section>

      <section className={styles.contentSection} aria-label="Certifications">
        <h2 className={styles.groupHeader}>
          <Award size={13} aria-hidden />
          Certifications
        </h2>
        {profile.certifications.map((cert) => (
          <article key={cert.title} className={styles.itemCard}>
            <h3 className={styles.itemTitle}>{cert.title}</h3>
            <p className={styles.itemMeta}>
              {cert.institution} · {cert.period}
            </p>
            <p className={styles.paraTight}>{cert.detail}</p>
          </article>
        ))}
      </section>

      <VideoShelf section="education" compact className={styles.contentSection} />
    </div>
  );
}

/* ------------------------------ Work History ---------------------------- */

function WorkContent() {
  return (
    <div>
      <h2 className={styles.groupHeader}>
        <Briefcase size={13} aria-hidden />
        Positions
      </h2>
      {profile.experience.map((job) => (
        <article key={`${job.org} ${job.title}`} className={styles.itemCard}>
          <h3 className={styles.itemTitle}>{job.title}</h3>
          <p className={styles.itemMeta}>
            {job.org} · {job.startDate} – {job.endDate}
          </p>
          <p className={styles.paraTight}>{job.summary}</p>
          <ul className={styles.bullets}>
            {job.bullets.map((bullet) => (
              <li key={bullet.slice(0, 48)}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}

      <VideoShelf section="experience" compact className={styles.contentSection} />
    </div>
  );
}

/* ----------------------------- Video Editing ---------------------------- */

function VideoContent() {
  return (
    <div>
      <h2 className={styles.groupHeader}>
        <Clapperboard size={13} aria-hidden />
        Showcase reels
      </h2>
      <div className={styles.videoGrid}>
        {profile.showcase.map((item) => (
          <article key={item.title} className={styles.videoCard}>
            <VideoEmbed video={item.video} title={item.title} cover={item.coverImage} />
            <div className={styles.videoInfo}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemMeta}>{item.role}</p>
              <p className={styles.paraTight}>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- Expertise ------------------------------ */

const EXPERTISE_ICONS: Record<ExpertiseKey, LucideIcon> = {
  it: Network,
  marketing: Megaphone,
  creative: Clapperboard,
  stack: Code2,
};

function ExpertiseContent() {
  const keys = Object.keys(EXPERTISE_LABELS) as ExpertiseKey[];
  return (
    <div>
      <div className={styles.expGrid}>
        {keys.map((key) => {
          const Icon = EXPERTISE_ICONS[key];
          return (
            <section key={key} className={styles.itemCard} aria-label={EXPERTISE_LABELS[key]}>
              <h2 className={styles.groupHeader}>
                <Icon size={13} aria-hidden />
                {EXPERTISE_LABELS[key]}
              </h2>
              <ul className={styles.skillList}>
                {profile.expertise[key].map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <VideoShelf section="expertise" compact className={styles.contentSection} />
      <VideoShelf section="marketing" compact className={styles.contentSection} />
    </div>
  );
}

/* ------------------------------- Registry ------------------------------- */

export interface WindowDef {
  title: string;
  icon: LucideIcon;
  /** Default (restored) window size in px, clamped to the desktop on spawn. */
  size: { w: number; h: number };
  /** Explorer status-bar line, derived from profile data. */
  statusText: string;
  Content: ComponentType;
}

const totalSkills = Object.values(profile.expertise).reduce(
  (sum, list) => sum + list.length,
  0,
);

export const WINDOW_DEFS: Record<WindowId, WindowDef> = {
  about: {
    title: 'About Me',
    icon: User,
    size: { w: 640, h: 540 },
    statusText: `${profile.about.length + 1} notes · ${profile.properties.length} properties`,
    Content: AboutContent,
  },
  education: {
    title: 'Education',
    icon: GraduationCap,
    size: { w: 580, h: 470 },
    statusText: `${profile.education.length + profile.certifications.length} items`,
    Content: EducationContent,
  },
  work: {
    title: 'Work History',
    icon: Briefcase,
    size: { w: 680, h: 560 },
    statusText: `${profile.experience.length} positions`,
    Content: WorkContent,
  },
  video: {
    title: 'Video Editing',
    icon: Clapperboard,
    size: { w: 780, h: 600 },
    statusText: `${profile.showcase.length} reels`,
    Content: VideoContent,
  },
  expertise: {
    title: 'Expertise',
    icon: Wrench,
    size: { w: 640, h: 500 },
    statusText: `${totalSkills} skills · ${Object.keys(EXPERTISE_LABELS).length} groups`,
    Content: ExpertiseContent,
  },
};

/** Desktop-icon / spawn ordering. */
export const WINDOW_ORDER: readonly WindowId[] = [
  'about',
  'education',
  'work',
  'video',
  'expertise',
];
