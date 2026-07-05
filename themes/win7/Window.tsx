'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  RotateCw,
  Square,
  X,
  type LucideIcon,
} from 'lucide-react';
import { profile } from '@/data/profile';
import type { WindowId } from './useWindowManager';
import styles from './win7.module.css';

const MIN_W = 360;
const MIN_H = 280;
const RESIZE_KEY_STEP = 24;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface Win7WindowProps {
  id: WindowId;
  title: string;
  icon: LucideIcon;
  active: boolean;
  minimized: boolean;
  zIndex: number;
  spawn: { x: number; y: number };
  defaultSize: { w: number; h: number };
  statusText: string;
  desktopRef: RefObject<HTMLDivElement>;
  reducedMotion: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  children: ReactNode;
}

export function Win7Window({
  id,
  title,
  icon,
  active,
  minimized,
  zIndex,
  spawn,
  defaultSize,
  statusText,
  desktopRef,
  reducedMotion,
  onClose,
  onMinimize,
  onFocus,
  children,
}: Win7WindowProps) {
  const Icon = icon;
  const rootRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Spawn geometry, clamped so cascaded windows never open off-desktop.
  // Computed once — afterwards the motion values / size state own it.
  const initial = useMemo(() => {
    const desktop = desktopRef.current;
    const dw = desktop ? desktop.clientWidth : 1024;
    const dh = desktop ? desktop.clientHeight : 640;
    const w = clamp(defaultSize.w, MIN_W, Math.max(MIN_W, dw - 24));
    const h = clamp(defaultSize.h, MIN_H, Math.max(MIN_H, dh - 24));
    return {
      w,
      h,
      x: clamp(spawn.x, 8, Math.max(8, dw - w - 12)),
      y: clamp(spawn.y, 8, Math.max(8, dh - h - 12)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const [size, setSize] = useState({ w: initial.w, h: initial.h });
  const [maximized, setMaximized] = useState(false);
  const restoreRect = useRef<{ x: number; y: number; w: number; h: number } | null>(
    null,
  );

  // Live desktop dimensions. Drag bounds are passed to framer as a PLAIN
  // OBJECT derived from these + the current size: ref-based constraints are
  // measured only once, at feature mount, while the window is still
  // transformed by its spawn offset + enter scale — which skews the cached
  // bounds and lets windows drag their title bar irrecoverably off-desktop.
  // Object constraints are resolved fresh on every drag and never measured.
  const [desktopSize, setDesktopSize] = useState({ w: 1024, h: 640 });
  useEffect(() => {
    const measure = () => {
      const desktop = desktopRef.current;
      if (desktop) {
        setDesktopSize({ w: desktop.clientWidth, h: desktop.clientHeight });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [desktopRef]);

  const dragBounds = {
    left: 0,
    top: 0,
    right: Math.max(0, desktopSize.w - size.w),
    bottom: Math.max(0, desktopSize.h - size.h),
  };

  // Whenever the window or the desktop is resized, pull the window back
  // fully on-desktop (skip while maximized — position is pinned at 0,0).
  useEffect(() => {
    if (maximized) return;
    x.set(clamp(x.get(), 0, Math.max(0, desktopSize.w - size.w)));
    y.set(clamp(y.get(), 0, Math.max(0, desktopSize.h - size.h)));
  }, [desktopSize, size, maximized, x, y]);

  // Focus the dialog on open, and again when restored from the taskbar.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);
  const wasMinimized = useRef(minimized);
  useEffect(() => {
    if (wasMinimized.current && !minimized) {
      rootRef.current?.focus({ preventScroll: true });
    }
    wasMinimized.current = minimized;
  }, [minimized]);

  // Resize (pointer-captured on the grip, so it keeps tracking over iframes).
  const resizeCleanup = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      resizeCleanup.current?.();
    },
    [],
  );

  const onResizePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (maximized) return;
    event.preventDefault();
    onFocus();
    const grip = event.currentTarget;
    grip.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = size.w;
    const startH = size.h;
    const desktop = desktopRef.current;
    const maxW = desktop
      ? Math.max(MIN_W, desktop.clientWidth - x.get() - 6)
      : 1800;
    const maxH = desktop
      ? Math.max(MIN_H, desktop.clientHeight - y.get() - 6)
      : 1400;

    const onMove = (ev: PointerEvent) => {
      setSize({
        w: clamp(startW + (ev.clientX - startX), MIN_W, maxW),
        h: clamp(startH + (ev.clientY - startY), MIN_H, maxH),
      });
    };
    const stop = () => {
      grip.removeEventListener('pointermove', onMove);
      grip.removeEventListener('pointerup', stop);
      grip.removeEventListener('pointercancel', stop);
      resizeCleanup.current = null;
    };
    grip.addEventListener('pointermove', onMove);
    grip.addEventListener('pointerup', stop);
    grip.addEventListener('pointercancel', stop);
    resizeCleanup.current = stop;
  };

  const onResizeKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (maximized) return;
    let dw = 0;
    let dh = 0;
    if (event.key === 'ArrowRight') dw = RESIZE_KEY_STEP;
    else if (event.key === 'ArrowLeft') dw = -RESIZE_KEY_STEP;
    else if (event.key === 'ArrowDown') dh = RESIZE_KEY_STEP;
    else if (event.key === 'ArrowUp') dh = -RESIZE_KEY_STEP;
    else return;
    event.preventDefault();
    const desktop = desktopRef.current;
    const maxW = desktop
      ? Math.max(MIN_W, desktop.clientWidth - x.get() - 6)
      : 1800;
    const maxH = desktop
      ? Math.max(MIN_H, desktop.clientHeight - y.get() - 6)
      : 1400;
    setSize((s) => ({
      w: clamp(s.w + dw, MIN_W, maxW),
      h: clamp(s.h + dh, MIN_H, maxH),
    }));
  };

  const toggleMaximize = () => {
    if (maximized) {
      const rect = restoreRect.current;
      if (rect) {
        // The desktop may have shrunk while maximized — clamp the restored
        // geometry so the window always comes back fully visible.
        const w = clamp(rect.w, MIN_W, Math.max(MIN_W, desktopSize.w - 12));
        const h = clamp(rect.h, MIN_H, Math.max(MIN_H, desktopSize.h - 12));
        x.set(clamp(rect.x, 0, Math.max(0, desktopSize.w - w)));
        y.set(clamp(rect.y, 0, Math.max(0, desktopSize.h - h)));
        setSize({ w, h });
      }
      setMaximized(false);
    } else {
      restoreRect.current = { x: x.get(), y: y.get(), w: size.w, h: size.h };
      x.set(0);
      y.set(0);
      setMaximized(true);
    }
    onFocus();
  };

  const onTitlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (maximized) return;
    // Never start a drag from the caption buttons.
    if ((event.target as HTMLElement).closest('button')) return;
    dragControls.start(event);
  };

  const duration = reducedMotion ? 0.06 : 0.18;

  return (
    <motion.div
      ref={rootRef}
      id={`win7-window-${id}`}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className={[
        styles.window,
        active ? '' : styles.windowInactive,
        maximized ? styles.windowMax : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        x,
        y,
        zIndex,
        width: maximized ? '100%' : size.w,
        height: maximized ? '100%' : size.h,
        transformOrigin: '50% 90%',
      }}
      drag={!maximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragBounds}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={
        minimized
          ? {
              opacity: 0,
              scale: reducedMotion ? 1 : 0.85,
              transitionEnd: { visibility: 'hidden' },
            }
          : { opacity: 1, scale: 1, visibility: 'visible' }
      }
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
      transition={{ duration, ease: 'easeOut' }}
      onPointerDownCapture={(event) => {
        if (!active) onFocus();
        // Clicking non-interactive window content moves DOM focus onto the
        // dialog itself (tabIndex=-1 isn't click-focusable natively), so
        // Esc-to-close works after any click inside the window.
        const target = event.target as HTMLElement;
        if (
          !target.closest('button, a, input, textarea, select, [tabindex], iframe, video')
        ) {
          rootRef.current?.focus({ preventScroll: true });
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className={styles.titleBar}
        onPointerDown={onTitlePointerDown}
        onDoubleClick={(event) => {
          // A fast double-click on a caption button must not also toggle
          // maximize (e.g. double-clicking Minimize would restore maximized).
          if ((event.target as HTMLElement).closest('button')) return;
          toggleMaximize();
        }}
      >
        <Icon size={15} aria-hidden className={styles.titleIcon} />
        <span className={styles.titleText}>{title}</span>
        <div className={styles.captions}>
          <button
            type="button"
            className={styles.captionBtn}
            aria-label={`Minimize ${title}`}
            onClick={onMinimize}
          >
            <Minus size={12} strokeWidth={3} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.captionBtn}
            aria-label={maximized ? `Restore ${title}` : `Maximize ${title}`}
            onClick={toggleMaximize}
          >
            {maximized ? (
              <Copy size={11} aria-hidden />
            ) : (
              <Square size={10} strokeWidth={2.5} aria-hidden />
            )}
          </button>
          <button
            type="button"
            className={`${styles.captionBtn} ${styles.closeBtn}`}
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <X size={13} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>

      <div className={styles.frameInner}>
        <div className={styles.toolbar}>
          <button type="button" className={styles.navBtn} aria-label="Back" disabled>
            <ChevronLeft size={15} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            aria-label="Forward"
            disabled
          >
            <ChevronRight size={15} aria-hidden />
          </button>
          <div className={styles.addressBar}>
            <Icon size={13} aria-hidden className={styles.addressIcon} />
            <span className={styles.crumb}>{profile.identity.name}</span>
            <ChevronRight size={12} aria-hidden className={styles.crumbSep} />
            <span className={`${styles.crumb} ${styles.crumbCurrent}`}>{title}</span>
            <RotateCw size={12} aria-hidden className={styles.addressRefresh} />
          </div>
        </div>

        <div className={styles.body}>{children}</div>

        <div className={styles.statusBar}>
          <Icon size={13} aria-hidden />
          <span>{statusText}</span>
        </div>
      </div>

      {!maximized && (
        <button
          type="button"
          className={styles.resizeHandle}
          aria-label={`Resize ${title} (arrow keys to adjust)`}
          onPointerDown={onResizePointerDown}
          onKeyDown={onResizeKeyDown}
        />
      )}
    </motion.div>
  );
}
