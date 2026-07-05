'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

/** Ids of the five Explorer-style windows this desktop can open. */
export type WindowId = 'about' | 'education' | 'work' | 'video' | 'expertise';

export interface ManagedWindow {
  id: WindowId;
  minimized: boolean;
  /** Monotonic z-order — the highest non-minimized window is "focused". */
  z: number;
  /** Cascaded spawn offset within the desktop (px). */
  spawn: { x: number; y: number };
  /** Monotonic open order — keeps taskbar/DOM order stable. */
  order: number;
}

export interface WindowManager {
  /** Open windows in the order they were opened (stable for the taskbar). */
  windows: ManagedWindow[];
  /** Top-most non-minimized window, or null when everything is minimized/closed. */
  topId: WindowId | null;
  open: (id: WindowId) => void;
  close: (id: WindowId) => void;
  /** Bring to front, restoring from the minimized state if needed. */
  focus: (id: WindowId) => void;
  minimize: (id: WindowId) => void;
  minimizeAll: () => void;
  closeAll: () => void;
}

/**
 * Desktop window-manager state: open/close, z-order, minimize, cascade
 * spawn positions. Geometry (drag position, size, maximize) lives inside
 * each Window component so it survives minimize/restore.
 */
export function useWindowManager(): WindowManager {
  const [windows, setWindows] = useState<ManagedWindow[]>([]);
  const zCounter = useRef(10);
  const spawnCounter = useRef(0);

  const open = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const z = ++zCounter.current;
      if (prev.some((w) => w.id === id)) {
        return prev.map((w) => (w.id === id ? { ...w, minimized: false, z } : w));
      }
      const n = spawnCounter.current++;
      const step = n % 7;
      return [
        ...prev,
        {
          id,
          minimized: false,
          z,
          spawn: { x: 118 + step * 26, y: 16 + step * 24 },
          order: n,
        },
      ];
    });
  }, []);

  const close = useCallback((id: WindowId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focus = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const target = prev.find((w) => w.id === id);
      if (!target) return prev;
      const top = prev.reduce((a, b) => (b.z > a.z ? b : a));
      // Already front-most and visible — skip the pointless re-render.
      if (top.id === id && !target.minimized) return prev;
      const z = ++zCounter.current;
      return prev.map((w) => (w.id === id ? { ...w, minimized: false, z } : w));
    });
  }, []);

  const minimize = useCallback((id: WindowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    );
  }, []);

  const minimizeAll = useCallback(() => {
    setWindows((prev) => prev.map((w) => ({ ...w, minimized: true })));
  }, []);

  const closeAll = useCallback(() => {
    setWindows([]);
  }, []);

  const topId = useMemo<WindowId | null>(() => {
    let best: ManagedWindow | null = null;
    for (const w of windows) {
      if (w.minimized) continue;
      if (!best || w.z > best.z) best = w;
    }
    return best ? best.id : null;
  }, [windows]);

  return { windows, topId, open, close, focus, minimize, minimizeAll, closeAll };
}
