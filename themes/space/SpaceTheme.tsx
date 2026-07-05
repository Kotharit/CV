'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { profile } from '@/data/profile';
import { useTheme } from '@/components/theme/ThemeProvider';
import Starfield from './Starfield';
import ConstellationLayer from './ConstellationLayer';
import NodeModal from './NodeModal';
import { SPACE_NODES, type NodeId } from './constellations';
import styles from './space.module.css';

/**
 * Space theme — a deep-space constellation map. Four identity centers
 * (IT, Marketing, Film & Video, Education) float as stars over a twinkling
 * WebGL starfield; hovering/focusing a star draws its constellation, and
 * selecting it opens a glassmorphic detail dialog fed from `profile`.
 */
export default function SpaceTheme() {
  const { reducedMotion, isMobile } = useTheme();
  const [activeId, setActiveId] = useState<NodeId | null>(null);
  const [selectedId, setSelectedId] = useState<NodeId | null>(null);
  const nodeRefs = useRef<Partial<Record<NodeId, HTMLButtonElement | null>>>({});

  const registerNodeRef = useCallback((id: NodeId, el: HTMLButtonElement | null) => {
    nodeRefs.current[id] = el;
  }, []);

  const handleSelect = useCallback((id: NodeId) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    // Return focus to the star that opened the dialog (Section 7).
    if (selectedId) nodeRefs.current[selectedId]?.focus();
    setSelectedId(null);
  }, [selectedId]);

  const litId = selectedId ?? activeId;
  const selectedNode = SPACE_NODES.find((n) => n.id === selectedId) ?? null;

  return (
    <div className={`relative h-full w-full overflow-hidden ${styles.stage}`}>
      {/* Everything behind the dialog is hidden from AT while it is open. */}
      <div className="h-full w-full" aria-hidden={selectedNode ? true : undefined}>
        <Starfield reducedMotion={reducedMotion} />
        <div className={styles.vignette} aria-hidden="true" />

        <ConstellationLayer
          nodes={SPACE_NODES}
          litId={litId}
          selectedId={selectedId}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
          onActivate={setActiveId}
          onSelect={handleSelect}
          registerNodeRef={registerNodeRef}
        />

        {/* Intro glass card — the theme's single h1 + immediate context. */}
        <motion.header
          className={`absolute left-4 right-4 top-4 max-w-md rounded-2xl p-5 sm:left-6 sm:right-auto sm:top-6 sm:p-6 ${styles.introCard}`}
          initial={reducedMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-theme-fg sm:text-3xl">
            {profile.identity.name}
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-theme-accent">
            {profile.identity.titles.join(' · ')}
          </p>
          <p
            className={`${styles.introOptional} mt-3 hidden text-sm leading-relaxed text-theme-muted sm:block`}
          >
            {profile.identity.tagline}
          </p>
          <p
            className={`${styles.introOptional} mt-2 flex items-center gap-1.5 text-xs text-theme-muted`}
          >
            <MapPin size={12} aria-hidden="true" className="text-theme-accent2" />
            {profile.identity.location} · {profile.identity.org}
          </p>
          <div className={`mb-3 mt-4 ${styles.hintRule}`} aria-hidden="true" />
          <p className="flex items-center gap-2 text-xs text-theme-fg/80">
            <Sparkles size={13} aria-hidden="true" className="text-theme-accent" />
            {isMobile ? 'Tap a star to explore' : 'Select a star to explore'}
          </p>
        </motion.header>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <NodeModal
            key={selectedNode.id}
            node={selectedNode}
            reducedMotion={reducedMotion}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
