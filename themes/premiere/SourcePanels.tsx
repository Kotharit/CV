'use client';

// Every CV section rendered as a stacked "clip" panel. ALL panels stay
// mounted in the DOM (hidden attribute toggles visibility) so the
// server-rendered HTML carries the complete CV for crawlers and no-JS
// visitors on the default view.

import type { ReactNode } from 'react';
import { ChevronRight, Github, Linkedin, Mail, MonitorPlay } from 'lucide-react';
import {
  EXPERTISE_LABELS,
  TRACK_LABELS,
  profile,
  type ExpertiseKey,
} from '@/data/profile';
import { framesToTimecode, getPanelMeta, milestonePanelId } from './assets';
import { VideoShelf } from '@/components/shared/VideoShelf';
import styles from './premiere.module.css';

interface SourcePanelsProps {
  activeId: string;
  /** Open another Source Monitor panel (used by overview index rows). */
  onOpenPanel: (panelId: string) => void;
  /** Cue a showcase reel in the Program Monitor. */
  onCueReel: (index: number) => void;
}

const EXPERTISE_KEYS = Object.keys(EXPERTISE_LABELS) as ExpertiseKey[];

/* -- small presentational helpers ---------------------------------------- */

function Panel({
  id,
  activeId,
  children,
}: {
  id: string;
  activeId: string;
  children: ReactNode;
}) {
  // All panels stay mounted (SEO/no-JS); the CSS entrance animation restarts
  // naturally whenever `hidden` flips off. tabIndex=-1 makes the panel a
  // programmatic focus target for index-row navigation (see PremiereTheme).
  return (
    <section
      id={`sm-panel-${id}`}
      hidden={activeId !== id}
      tabIndex={-1}
      className={`${styles.panelIn} px-4 py-4 md:px-6 md:py-5`}
    >
      {children}
    </section>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-theme-muted">
      {children}
    </p>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="mt-1 text-base font-semibold text-[#ececec] md:text-lg">{children}</h2>;
}

function Chip({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 text-[11px] leading-relaxed ${
        accent
          ? 'border-[#6a4a12] bg-[#2c2413] text-theme-accent'
          : 'border-[#3a3a3a] bg-[#2c2c2c] text-theme-fg'
      }`}
    >
      {children}
    </span>
  );
}

function ChipList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 flex list-none flex-wrap gap-1.5 p-0">
      {items.map((item) => (
        <li key={item}>
          <Chip>{item}</Chip>
        </li>
      ))}
    </ul>
  );
}

/** Index row used inside overview panels to jump to a detail panel. */
function IndexRow({
  onClick,
  primary,
  secondary,
}: {
  onClick: () => void;
  primary: string;
  secondary: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-sm border border-[#333] bg-[#242424] px-3 py-2 text-left transition-colors hover:border-[#3f8ae0] hover:bg-[#28303a]"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-theme-fg">{primary}</span>
        <span className="block truncate text-[11px] text-theme-muted">{secondary}</span>
      </span>
      <ChevronRight
        size={14}
        aria-hidden
        className="flex-none text-theme-muted transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </button>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 list-none space-y-2 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="border-l-2 border-[#3f8ae0] pl-3 text-[13px] leading-relaxed text-theme-fg"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function InOutRow({ panelId }: { panelId: string }) {
  const meta = getPanelMeta(panelId);
  return (
    <p aria-hidden className="mt-2 font-mono text-[9px] tracking-wider text-[#5f5f5f]">
      IN {framesToTimecode(meta.inFrames)} · OUT {framesToTimecode(meta.outFrames)} · DUR{' '}
      {framesToTimecode(meta.durFrames)}
    </p>
  );
}

/* -- the panels ----------------------------------------------------------- */

export default function SourcePanels({ activeId, onOpenPanel, onCueReel }: SourcePanelsProps) {
  const { identity } = profile;

  return (
    <div>
      {/* 01 — About ------------------------------------------------------- */}
      <Panel id="about" activeId={activeId}>
        <Kicker>01_About / About.txt</Kicker>
        <Heading>About</Heading>
        <p className="mt-2 text-[13px] italic leading-relaxed text-theme-accent">
          {identity.tagline}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-theme-fg">{identity.summary}</p>
        {profile.about.map((paragraph) => (
          <p key={paragraph} className="mt-3 text-[13px] leading-relaxed text-theme-muted">
            {paragraph}
          </p>
        ))}

        <dl className="mt-5 grid grid-cols-[92px_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t border-[#2c2c2c] pt-4 text-[12px]">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-theme-muted">Roles</dt>
          <dd className="text-theme-fg">{identity.titles.join(' · ')}</dd>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-theme-muted">Org</dt>
          <dd className="text-theme-fg">{identity.org}</dd>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-theme-muted">Base</dt>
          <dd className="text-theme-fg">{identity.location}</dd>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-theme-muted">Age</dt>
          <dd className="text-theme-fg">{identity.age}</dd>
        </dl>

        <h3 className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-theme-muted">
          IT scope — properties
        </h3>
        <ChipList items={profile.properties} />

        <h3 className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-theme-muted">
          Reach out
        </h3>
        <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
          <li>
            <a
              href={`mailto:${identity.links.email}`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#3a3a3a] bg-[#2c2c2c] px-2.5 py-1 text-[11px] text-theme-fg transition-colors hover:border-[#3f8ae0] hover:text-white"
            >
              <Mail size={12} aria-hidden /> Email
            </a>
          </li>
          <li>
            <a
              href={identity.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#3a3a3a] bg-[#2c2c2c] px-2.5 py-1 text-[11px] text-theme-fg transition-colors hover:border-[#3f8ae0] hover:text-white"
            >
              <Linkedin size={12} aria-hidden /> LinkedIn
            </a>
          </li>
          <li>
            <a
              href={identity.links.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#3a3a3a] bg-[#2c2c2c] px-2.5 py-1 text-[11px] text-theme-fg transition-colors hover:border-[#3f8ae0] hover:text-white"
            >
              <Github size={12} aria-hidden /> GitHub
            </a>
          </li>
        </ul>
        <VideoShelf section="about" compact className="mt-6" />
        <InOutRow panelId="about" />
      </Panel>

      {/* 02 — Education overview ------------------------------------------ */}
      <Panel id="education" activeId={activeId}>
        <Kicker>02_Education / Education.mp4</Kicker>
        <Heading>Education</Heading>
        <ul className="mt-4 list-none space-y-2 p-0">
          {profile.education.map((entry, i) => (
            <li key={entry.institution}>
              <IndexRow
                onClick={() => onOpenPanel(`education-${i}`)}
                primary={entry.degree}
                secondary={`${entry.institution} · ${entry.startDate} · ${entry.status}`}
              />
            </li>
          ))}
        </ul>
        <h3 className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-theme-muted">
          Certifications
        </h3>
        <ul className="mt-3 list-none space-y-2 p-0">
          {profile.certifications.map((cert, i) => (
            <li key={cert.title}>
              <IndexRow
                onClick={() => onOpenPanel(`cert-${i}`)}
                primary={cert.title}
                secondary={`${cert.institution} · ${cert.period}`}
              />
            </li>
          ))}
        </ul>
        <VideoShelf section="education" compact className="mt-6" />
        <InOutRow panelId="education" />
      </Panel>

      {/* 02 — Education entries ------------------------------------------- */}
      {profile.education.map((entry, i) => (
        <Panel key={entry.institution} id={`education-${i}`} activeId={activeId}>
          <Kicker>02_Education</Kicker>
          <Heading>{entry.degree}</Heading>
          <p className="mt-1 text-[12px] text-theme-muted">
            {entry.institution} · since {entry.startDate}
          </p>
          <p className="mt-3">
            <Chip accent>{entry.status}</Chip>
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-theme-fg">{entry.detail}</p>
          <InOutRow panelId={`education-${i}`} />
        </Panel>
      ))}

      {/* 02 — Certifications ---------------------------------------------- */}
      {profile.certifications.map((cert, i) => (
        <Panel key={cert.title} id={`cert-${i}`} activeId={activeId}>
          <Kicker>02_Education / Certification</Kicker>
          <Heading>{cert.title}</Heading>
          <p className="mt-1 text-[12px] text-theme-muted">
            {cert.institution} · {cert.period}
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-theme-fg">{cert.detail}</p>
          <InOutRow panelId={`cert-${i}`} />
        </Panel>
      ))}

      {/* 03 — Work experience overview ------------------------------------ */}
      <Panel id="experience" activeId={activeId}>
        <Kicker>03_Work_Experience / Work_Experience.mov</Kicker>
        <Heading>Work Experience</Heading>
        <ul className="mt-4 list-none space-y-3 p-0">
          {profile.experience.map((entry, i) => (
            <li key={`${entry.org}-${entry.title}`}>
              <IndexRow
                onClick={() => onOpenPanel(`experience-${i}`)}
                primary={entry.title}
                secondary={`${entry.org} · ${entry.startDate} – ${entry.endDate}`}
              />
              <p className="mt-1.5 px-1 text-[12px] leading-relaxed text-theme-muted">
                {entry.summary}
              </p>
            </li>
          ))}
        </ul>
        <VideoShelf section="experience" compact className="mt-6" />
        <InOutRow panelId="experience" />
      </Panel>

      {/* 03 — Work experience entries ------------------------------------- */}
      {profile.experience.map((entry, i) => (
        <Panel key={`${entry.org}-${entry.title}`} id={`experience-${i}`} activeId={activeId}>
          <Kicker>03_Work_Experience</Kicker>
          <Heading>{entry.title}</Heading>
          <p className="mt-1 text-[12px] text-theme-muted">
            {entry.org} ·{' '}
            <span className="font-mono text-[11px]">
              {entry.startDate} – {entry.endDate}
            </span>
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-theme-fg">{entry.summary}</p>
          <Bullets items={entry.bullets} />
          <InOutRow panelId={`experience-${i}`} />
        </Panel>
      ))}

      {/* 04 — Core expertise overview ------------------------------------- */}
      <Panel id="expertise" activeId={activeId}>
        <Kicker>04_Core_Expertise / Core_Expertise.wav</Kicker>
        <Heading>Core Expertise</Heading>
        {EXPERTISE_KEYS.map((key) => (
          <div key={key} className="mt-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-theme-muted">
              {EXPERTISE_LABELS[key]}
            </h3>
            <ChipList items={profile.expertise[key]} />
          </div>
        ))}
        <VideoShelf section="expertise" compact className="mt-6" />
        <VideoShelf section="marketing" compact className="mt-5" />
        <InOutRow panelId="expertise" />
      </Panel>

      {/* 04 — Expertise groups -------------------------------------------- */}
      {EXPERTISE_KEYS.map((key) => (
        <Panel key={key} id={`expertise-${key}`} activeId={activeId}>
          <Kicker>04_Core_Expertise</Kicker>
          <Heading>{EXPERTISE_LABELS[key]}</Heading>
          <p className="mt-1 font-mono text-[11px] text-theme-muted">
            {profile.expertise[key].length} clips in group
          </p>
          <ChipList items={profile.expertise[key]} />
          <InOutRow panelId={`expertise-${key}`} />
        </Panel>
      ))}

      {/* 05 — Showcase ----------------------------------------------------- */}
      {profile.showcase.map((reel, i) => (
        <Panel key={reel.title} id={`showcase-${i}`} activeId={activeId}>
          <Kicker>05_Showcase</Kicker>
          <Heading>{reel.title}</Heading>
          <p className="mt-2">
            <Chip accent>{reel.role}</Chip>
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-theme-fg">{reel.description}</p>
          <button
            type="button"
            onClick={() => onCueReel(i)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-sm border border-[#3f8ae0] bg-[#24405e] px-3 py-1.5 text-[11px] font-medium text-[#cfe3fa] transition-colors hover:bg-[#2d4f75]"
          >
            <MonitorPlay size={13} aria-hidden />
            Cue in Program Monitor
          </button>
          <InOutRow panelId={`showcase-${i}`} />
        </Panel>
      ))}

      {/* Timeline milestones ------------------------------------------------ */}
      {profile.milestones.map((milestone) => {
        const panelId = milestonePanelId(milestone);
        return (
          <Panel key={milestone.id} id={panelId} activeId={activeId}>
            <Kicker>
              Timeline / {milestone.track} · {TRACK_LABELS[milestone.track]}
            </Kicker>
            <Heading>{milestone.title}</Heading>
            <p className="mt-2 flex flex-wrap items-center gap-2">
              <Chip accent>{milestone.period}</Chip>
              <Chip>{TRACK_LABELS[milestone.track]}</Chip>
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-theme-fg">{milestone.detail}</p>
            <InOutRow panelId={panelId} />
          </Panel>
        );
      })}
    </div>
  );
}
