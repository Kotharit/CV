'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { profile } from '@/data/profile';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useWindowManager, type WindowId } from './useWindowManager';
import { WINDOW_DEFS, WINDOW_ORDER } from './WindowContent';
import { Win7Window } from './Window';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import styles from './win7.module.css';

/** CSS/SVG scenic wallpaper — sky gradient, sun glow, rolling hills. */
function Wallpaper() {
  return (
    <div className={styles.wallpaper} aria-hidden>
      <div className={styles.sunGlow} />
      <div className={styles.streakA} />
      <div className={styles.streakB} />
      <svg
        className={styles.hills}
        viewBox="0 0 1440 480"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="w7-hill-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a3d276" />
            <stop offset="1" stopColor="#5da33f" />
          </linearGradient>
          <linearGradient id="w7-hill-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cbf4e" />
            <stop offset="1" stopColor="#3c7d2a" />
          </linearGradient>
          <linearGradient id="w7-hill-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#55a136" />
            <stop offset="1" stopColor="#27611e" />
          </linearGradient>
        </defs>
        <path
          d="M0 250 Q 340 110 720 210 T 1440 180 V 480 H 0 Z"
          fill="url(#w7-hill-far)"
          opacity="0.9"
        />
        <path
          d="M0 320 Q 300 200 640 290 T 1440 280 V 480 H 0 Z"
          fill="url(#w7-hill-mid)"
        />
        <path
          d="M0 410 Q 420 290 860 390 T 1440 370 V 480 H 0 Z"
          fill="url(#w7-hill-near)"
        />
      </svg>
    </div>
  );
}

export default function Win7Theme() {
  const { reducedMotion } = useTheme();
  const { windows, topId, open, close, focus, minimize, minimizeAll, closeAll } =
    useWindowManager();
  const [startOpen, setStartOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);

  const closeStart = useCallback(() => setStartOpen(false), []);
  const toggleStart = useCallback(() => setStartOpen((o) => !o), []);
  const shutDown = useCallback(() => {
    closeAll();
    setStartOpen(false);
  }, [closeAll]);

  const onTaskClick = useCallback(
    (id: WindowId) => {
      const win = windows.find((w) => w.id === id);
      if (!win) return;
      if (!win.minimized && topId === id) {
        minimize(id);
      } else {
        focus(id);
      }
    },
    [windows, topId, focus, minimize],
  );

  // Closing a window unmounts the focused element — hand keyboard focus to
  // the window that becomes top-most (or back to the desktop) so Esc and
  // Tab keep working instead of falling to <body>.
  const closeWindow = useCallback(
    (id: WindowId) => {
      const remaining = windows.filter((w) => w.id !== id && !w.minimized);
      const nextTop = remaining.reduce<(typeof windows)[number] | null>(
        (a, b) => (!a || b.z > a.z ? b : a),
        null,
      );
      close(id);
      requestAnimationFrame(() => {
        const next = nextTop
          ? document.getElementById(`win7-window-${nextTop.id}`)
          : desktopRef.current?.querySelector<HTMLElement>('button, a');
        next?.focus({ preventScroll: true });
      });
    },
    [windows, close],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={desktopRef} className={styles.desktop}>
        <Wallpaper />

        <div className={styles.iconGrid}>
          {WINDOW_ORDER.map((id) => {
            const def = WINDOW_DEFS[id];
            return (
              <DesktopIcon
                key={id}
                label={def.title}
                icon={def.icon}
                glyph="folder"
                onOpen={() => open(id)}
              />
            );
          })}
          <DesktopIcon
            label="Résumé.pdf"
            icon={FileText}
            glyph="pdf"
            href={profile.identity.resumePdf}
          />
        </div>

        <AnimatePresence>
          {windows.map((win) => {
            const def = WINDOW_DEFS[win.id];
            const Content = def.Content;
            return (
              <Win7Window
                key={win.id}
                id={win.id}
                title={def.title}
                icon={def.icon}
                active={topId === win.id}
                minimized={win.minimized}
                zIndex={win.z}
                spawn={win.spawn}
                defaultSize={def.size}
                statusText={def.statusText}
                desktopRef={desktopRef}
                reducedMotion={reducedMotion}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimize(win.id)}
                onFocus={() => focus(win.id)}
              >
                <Content />
              </Win7Window>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {startOpen && (
            <StartMenu
              orbRef={orbRef}
              reducedMotion={reducedMotion}
              onClose={closeStart}
              onShutDown={shutDown}
            />
          )}
        </AnimatePresence>

        {/* Desktop "build watermark" — the theme's single <h1>. */}
        <div className={styles.watermark}>
          <h1 className={styles.watermarkName}>{profile.identity.name}</h1>
          <p className={styles.watermarkTag}>{profile.identity.tagline}</p>
        </div>
      </div>

      <Taskbar
        windows={windows}
        topId={topId}
        startOpen={startOpen}
        orbRef={orbRef}
        onToggleStart={toggleStart}
        onTaskClick={onTaskClick}
        onShowDesktop={minimizeAll}
      />
    </div>
  );
}
