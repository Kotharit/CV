'use client';

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import {
  SATELLITE_SCALE_MOBILE,
  nodePoint,
  type NodeId,
  type SpaceNode,
} from './constellations';
import styles from './space.module.css';

interface ConstellationLayerProps {
  nodes: readonly SpaceNode[];
  /** Node whose wiring is currently drawn (hover / focus / selection). */
  litId: NodeId | null;
  selectedId: NodeId | null;
  isMobile: boolean;
  reducedMotion: boolean;
  onActivate: (id: NodeId | null) => void;
  onSelect: (id: NodeId) => void;
  registerNodeRef: (id: NodeId, el: HTMLButtonElement | null) => void;
}

/**
 * DOM + SVG overlay above the starfield: four identity-center star buttons,
 * their decorative satellites, and an aria-hidden SVG that draws the
 * constellation edges when a node is hovered, focused, or selected.
 */
export default function ConstellationLayer({
  nodes,
  litId,
  selectedId,
  isMobile,
  reducedMotion,
  onActivate,
  onSelect,
  registerNodeRef,
}: ConstellationLayerProps) {
  const satScale = isMobile ? SATELLITE_SCALE_MOBILE : 1;

  const edgeTransition = (delay: number) =>
    reducedMotion
      ? { duration: 0 }
      : { duration: 0.4, delay, ease: 'easeOut' as const };

  return (
    <div className="absolute inset-0">
      {/* Constellation wiring — decorative, never intercepts the pointer. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      >
        {nodes.map((node) => {
          const p = nodePoint(node, isMobile);
          const lit = litId === node.id;
          return (
            <g key={node.id}>
              {/* Ultra-faint idle hints so the sky reads as constellations. */}
              {node.satellites.map((s, i) => (
                <line
                  key={`hint-${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={p.x + s.dx * satScale}
                  y2={p.y + s.dy * satScale}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  style={{ stroke: 'rgb(var(--fg-rgb) / 0.06)' }}
                />
              ))}
              {/* Bright edges drawn on hover / focus / selection. */}
              {node.satellites.map((s, i) => (
                <motion.line
                  key={`edge-${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={p.x + s.dx * satScale}
                  y2={p.y + s.dy * satScale}
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ stroke: `rgb(var(${node.colorVar}) / 0.75)` }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                  transition={edgeTransition(lit ? i * 0.06 : 0)}
                />
              ))}
              {/* Faint dashed threads to related identity centers.
                  (Opacity-only: pathLength animation would override the
                  dash pattern framer-motion drives via stroke-dasharray.) */}
              {node.related.map((relatedId) => {
                const other = nodes.find((n) => n.id === relatedId);
                if (!other) return null;
                const q = nodePoint(other, isMobile);
                return (
                  <motion.line
                    key={`rel-${relatedId}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    strokeWidth={1}
                    strokeDasharray="2 4"
                    vectorEffect="non-scaling-stroke"
                    style={{ stroke: `rgb(var(${node.colorVar}) / 0.35)` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: lit ? 1 : 0 }}
                    transition={edgeTransition(lit ? 0.2 : 0)}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Decorative satellite dots. */}
      <div className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none' }}>
        {nodes.map((node) => {
          const p = nodePoint(node, isMobile);
          const lit = litId === node.id;
          return node.satellites.map((s, i) => (
            <span
              key={`${node.id}-sat-${i}`}
              className={`${styles.satellite} ${lit ? styles.satelliteLit : ''}`}
              style={
                {
                  left: `${p.x + s.dx * satScale}%`,
                  top: `${p.y + s.dy * satScale}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  '--node-rgb': `var(${node.colorVar})`,
                } as CSSProperties
              }
            />
          ));
        })}
      </div>

      {/* Identity-center star buttons. */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {nodes.map((node) => {
          const p = nodePoint(node, isMobile);
          const lit = litId === node.id;
          return (
            <button
              key={node.id}
              type="button"
              ref={(el) => registerNodeRef(node.id, el)}
              className={[
                styles.node,
                lit ? styles.nodeLit : '',
                reducedMotion ? styles.still : '',
              ].join(' ')}
              style={
                {
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  '--node-rgb': `var(${node.colorVar})`,
                } as CSSProperties
              }
              aria-haspopup="dialog"
              aria-expanded={selectedId === node.id}
              aria-label={`${node.label} — ${node.sublabel}. Open details.`}
              onMouseEnter={() => onActivate(node.id)}
              onMouseLeave={() => onActivate(null)}
              onFocus={() => onActivate(node.id)}
              onBlur={() => onActivate(null)}
              onClick={() => onSelect(node.id)}
            >
              <span className={styles.coreWrap} aria-hidden="true">
                <span className={styles.halo} />
                <span className={`${styles.halo} ${styles.haloLate}`} />
                <span className={styles.core} />
              </span>
              <span aria-hidden="true">
                <span className={styles.nodeLabel}>{node.label}</span>
                <span className={styles.nodeSublabel}>{node.sublabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
