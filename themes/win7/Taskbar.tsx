'use client';

import { useEffect, useState, type RefObject } from 'react';
import { Volume2, Wifi } from 'lucide-react';
import { WINDOW_DEFS } from './WindowContent';
import type { ManagedWindow, WindowId } from './useWindowManager';
import styles from './win7.module.css';

interface TaskbarProps {
  windows: readonly ManagedWindow[];
  topId: WindowId | null;
  startOpen: boolean;
  orbRef: RefObject<HTMLButtonElement>;
  onToggleStart: () => void;
  onTaskClick: (id: WindowId) => void;
  onShowDesktop: () => void;
}

export function Taskbar({
  windows,
  topId,
  startOpen,
  orbRef,
  onToggleStart,
  onTaskClick,
  onShowDesktop,
}: TaskbarProps) {
  // Live clock — 30s resolution is plenty for a minutes display.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={styles.taskbar} aria-label="Taskbar">
      <button
        ref={orbRef}
        type="button"
        className={`${styles.orb} ${startOpen ? styles.orbActive : ''}`}
        aria-label="Start"
        aria-haspopup="dialog"
        aria-expanded={startOpen}
        aria-controls="win7-start-menu"
        onClick={onToggleStart}
      >
        <span className={styles.orbGlyph} aria-hidden />
      </button>

      <div className={styles.taskButtons}>
        {windows.map((win) => {
          const def = WINDOW_DEFS[win.id];
          const Icon = def.icon;
          const isActive = topId === win.id && !win.minimized;
          return (
            <button
              key={win.id}
              type="button"
              className={[
                styles.taskBtn,
                isActive ? styles.taskBtnActive : '',
                win.minimized ? styles.taskBtnMin : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={isActive}
              title={win.minimized ? `${def.title} (minimized)` : def.title}
              onClick={() => onTaskClick(win.id)}
            >
              <Icon size={15} aria-hidden />
              <span className={styles.taskLabel}>{def.title}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.tray}>
        <Wifi size={15} aria-hidden />
        <Volume2 size={15} aria-hidden />
        <div className={styles.clock}>
          <div>{time}</div>
          <div>{date}</div>
        </div>
      </div>

      <button
        type="button"
        className={styles.showDesktop}
        aria-label="Show desktop (minimize all windows)"
        title="Show desktop"
        onClick={onShowDesktop}
      />
    </div>
  );
}
