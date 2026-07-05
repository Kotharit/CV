'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Deep-space backdrop: ~1800 twinkling stars in a single InstancedMesh draw
 * call, with a dampened parallax drift toward the pointer. Purely decorative
 * (aria-hidden); under reduced motion it renders one static frame on a
 * demand frameloop and never animates.
 */

const STAR_COUNT = 1800;

/** Spread of the star box in world units (camera sits at z = 6, fov 55). */
const SPREAD_X = 16;
const SPREAD_Y = 9;
const DEPTH_NEAR = 1;
const DEPTH_FAR = -14;

/** Subtle blue/violet-tinted star palette (design tokens, not content). */
const STAR_COLORS = ['#ffffff', '#dbe4ff', '#8ab4ff', '#c792ea', '#9ad7ff'] as const;
const STAR_COLOR_WEIGHTS = [0.38, 0.3, 0.16, 0.08, 0.08] as const;

interface StarData {
  positions: Float32Array; // xyz per star
  baseScales: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
  colors: THREE.Color[];
}

function buildStars(): StarData {
  const positions = new Float32Array(STAR_COUNT * 3);
  const baseScales = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const speeds = new Float32Array(STAR_COUNT);
  const colors: THREE.Color[] = [];

  const pickColor = () => {
    let r = Math.random();
    for (let i = 0; i < STAR_COLORS.length; i++) {
      r -= STAR_COLOR_WEIGHTS[i];
      if (r <= 0) return new THREE.Color(STAR_COLORS[i]);
    }
    return new THREE.Color(STAR_COLORS[0]);
  };

  for (let i = 0; i < STAR_COUNT; i++) {
    // Slightly center-weighted scatter with real depth.
    positions[i * 3] = (Math.random() * 2 - 1) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * SPREAD_Y;
    positions[i * 3 + 2] = DEPTH_FAR + Math.random() * (DEPTH_NEAR - DEPTH_FAR);
    // Deeper stars render smaller; a few foreground stars pop.
    const depthT = (positions[i * 3 + 2] - DEPTH_FAR) / (DEPTH_NEAR - DEPTH_FAR);
    baseScales[i] = 0.012 + Math.random() * 0.028 + depthT * 0.014;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.5 + Math.random() * 1.6;
    colors.push(pickColor());
  }

  return { positions, baseScales, phases, speeds, colors };
}

function StarInstances({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const invalidate = useThree((s) => s.invalidate);

  const stars = useMemo(buildStars, []);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 6, 4);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    return { geometry: geo, material: mat };
  }, []);

  // Memory safety: imperative GL resources are released on unmount. The mesh
  // is captured at mount time because React nulls refs before passive cleanup.
  useEffect(() => {
    const mesh = meshRef.current;
    return () => {
      geometry.dispose();
      material.dispose();
      mesh?.dispose();
    };
  }, [geometry, material]);

  // Seed instance matrices + per-instance colors once (this IS the static
  // frame under reduced motion — invalidate() flushes it on demand loops).
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < STAR_COUNT; i++) {
      dummy.position.set(
        stars.positions[i * 3],
        stars.positions[i * 3 + 1],
        stars.positions[i * 3 + 2],
      );
      dummy.scale.setScalar(stars.baseScales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, stars.colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    invalidate();
  }, [stars, invalidate]);

  // Parallax target follows the pointer (disabled under reduced motion).
  useEffect(() => {
    if (reducedMotion) return;
    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [reducedMotion]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (reducedMotion) return;
    const mesh = meshRef.current;
    const group = groupRef.current;
    const t = state.clock.elapsedTime;

    if (mesh) {
      for (let i = 0; i < STAR_COUNT; i++) {
        const twinkle = 0.72 + 0.28 * Math.sin(t * stars.speeds[i] + stars.phases[i]);
        dummy.position.set(
          stars.positions[i * 3],
          stars.positions[i * 3 + 1],
          stars.positions[i * 3 + 2],
        );
        dummy.scale.setScalar(stars.baseScales[i] * twinkle);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    if (group) {
      // Dampened lerp toward the pointer + an almost imperceptible roll.
      group.position.x += (pointer.current.x * 0.55 - group.position.x) * 0.03;
      group.position.y += (-pointer.current.y * 0.35 - group.position.y) * 0.03;
      group.rotation.z = Math.sin(t * 0.02) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, STAR_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}

export default function Starfield({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        camera={{ position: [0, 0, 6], fov: 55, near: 0.1, far: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <StarInstances reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
