'use client';

/**
 * Neon tunnel scene for the Scroll3D theme. Lives inside <Canvas> under
 * <ScrollControls>. Memory safety (Section 6): every imperatively created
 * geometry / material / texture is disposed in effect cleanups, and both big
 * fields (rings, shards) are single-draw-call InstancedMeshes; ambience dust
 * is a single THREE.Points.
 */

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Grid, useScroll } from '@react-three/drei';

/* Palette — mirrors html[data-theme='scroll3d'] in app/globals.css. */
const BG = '#070b16';
const CYAN = new THREE.Color('#00e5ff');
const MAGENTA = new THREE.Color('#ff2d95');
const SOFT_WHITE = new THREE.Color('#bfe9ff');

const RING_COUNT = 72;
const RING_SPACING = 1.9;
const START_Z = 6;
/** Camera z travel across the full scroll range. */
export const TRAVEL = 118;
const END_Z = START_Z - TRAVEL;

const SHARD_COUNT = 110;
const PARTICLE_COUNT = 700;

const tmpColor = new THREE.Color();

/** Soft radial glow used by the dust points + end-of-tunnel portal. */
function makeGlowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

/* ------------------------------------------------------------------------ */
/* Rings — one InstancedMesh, cyan with magenta accents                     */
/* ------------------------------------------------------------------------ */

function Rings() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const geometry = useMemo(() => new THREE.TorusGeometry(3.6, 0.05, 8, 72), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    return () => {
      geometry.dispose();
      material.dispose();
      mesh?.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < RING_COUNT; i++) {
      dummy.position.set(0, 0, 3 - i * RING_SPACING);
      dummy.rotation.z = (i * Math.PI) / 9;
      dummy.scale.setScalar(1 + Math.sin(i * 1.7) * 0.06);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const accent = i % 8 === 0;
      tmpColor
        .copy(accent ? MAGENTA : CYAN)
        .multiplyScalar(accent ? 0.9 : 0.5 + ((i * 37) % 10) * 0.035);
      mesh.setColorAt(i, tmpColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.03 + scroll.offset * 1.2;
    }
    // Breathe slowly, flare with scroll speed (delta is drei's damped delta).
    material.opacity =
      0.4 + Math.min(0.4, scroll.delta * 28) + Math.sin(t * 1.4) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, RING_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}

/* ------------------------------------------------------------------------ */
/* Shards — instanced octahedra drifting outside the ring radius            */
/* ------------------------------------------------------------------------ */

function Shards() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.14, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        wireframe: true,
      }),
    [],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    return () => {
      geometry.dispose();
      material.dispose();
      mesh?.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < SHARD_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4.3 + Math.random() * 5.5;
      dummy.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        4 - Math.random() * (TRAVEL + 30),
      );
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      dummy.scale.setScalar(0.5 + Math.random() * 1.3);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      tmpColor
        .copy(i % 3 === 0 ? MAGENTA : CYAN)
        .multiplyScalar(0.35 + Math.random() * 0.45);
      mesh.setColorAt(i, tmpColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z =
        -state.clock.elapsedTime * 0.02 - scroll.offset * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, SHARD_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}

/* ------------------------------------------------------------------------ */
/* Dust — a single Points field with per-vertex two-tone color              */
/* ------------------------------------------------------------------------ */

function Dust() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4.5 + Math.pow(Math.random(), 0.7) * 11;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.8;
      positions[i * 3 + 2] = 8 - Math.random() * (TRAVEL + 40);
      const pick = Math.random();
      tmpColor
        .copy(pick < 0.55 ? CYAN : pick < 0.82 ? SOFT_WHITE : MAGENTA)
        .multiplyScalar(0.35 + Math.random() * 0.5);
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const texture = useMemo(() => makeGlowTexture(), []);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.16,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        toneMapped: false,
      }),
    [texture],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture],
  );

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.006;
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}

/* ------------------------------------------------------------------------ */
/* End-of-tunnel portal glow                                                */
/* ------------------------------------------------------------------------ */

function EndPortal() {
  const spriteRef = useRef<THREE.Sprite>(null);
  const gateRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  const texture = useMemo(() => makeGlowTexture(), []);
  const glowMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        color: MAGENTA,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [texture],
  );
  const gateGeometry = useMemo(() => new THREE.TorusGeometry(3, 0.09, 10, 80), []);
  const gateMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: MAGENTA,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      texture.dispose();
      glowMaterial.dispose();
      gateGeometry.dispose();
      gateMaterial.dispose();
    },
    [texture, glowMaterial, gateGeometry, gateMaterial],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const near = scroll.offset * scroll.offset; // ramps up on approach
    glowMaterial.opacity = 0.12 + near * 0.75;
    gateMaterial.opacity = 0.25 + near * 0.6;
    if (spriteRef.current) {
      const s = 9 * (1 + Math.sin(t * 1.5) * 0.05);
      spriteRef.current.scale.set(s, s, 1);
    }
    if (gateRef.current) {
      gateRef.current.rotation.z = t * 0.12;
    }
  });

  return (
    <group position={[0, 0, END_Z - 16]}>
      <sprite ref={spriteRef} material={glowMaterial} />
      <mesh ref={gateRef} geometry={gateGeometry} material={gateMaterial} />
    </group>
  );
}

/* ------------------------------------------------------------------------ */
/* Camera rig + scroll bridge to the DOM HUD                                */
/* ------------------------------------------------------------------------ */

interface CameraRigProps {
  /** Called once per frame with the damped scroll offset [0..1]. */
  onFrame: (offset: number) => void;
  /** Hands drei's scroller + sticky content elements to the theme shell. */
  registerScroll: (el: HTMLDivElement, fixed: HTMLDivElement) => void;
}

function CameraRig({ onFrame, registerScroll }: CameraRigProps) {
  const scroll = useScroll();
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    registerScroll(scroll.el, scroll.fixed);
  }, [scroll, registerScroll]);

  useFrame((state) => {
    const off = scroll.offset;
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    const z = START_Z - off * TRAVEL;
    const sx = Math.sin(off * Math.PI * 5 + t * 0.22) * 0.5;
    const sy = Math.cos(off * Math.PI * 3.5) * 0.35 + Math.sin(t * 0.7) * 0.04;
    cam.position.set(sx, sy, z);
    lookTarget.set(sx * 0.35, sy * 0.35, z - 9);
    cam.lookAt(lookTarget);
    onFrame(off);
  });

  return null;
}

/* ------------------------------------------------------------------------ */
/* Scene root                                                               */
/* ------------------------------------------------------------------------ */

export interface TunnelSceneProps extends CameraRigProps {}

export function TunnelScene({ onFrame, registerScroll }: TunnelSceneProps) {
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 12, 62]} />
      <CameraRig onFrame={onFrame} registerScroll={registerScroll} />
      <Rings />
      <Shards />
      <Dust />
      <EndPortal />
      {/* Lane floor + ceiling: drei Grid (declarative, auto-disposed by R3F). */}
      <Grid
        position={[0, -3.9, 0]}
        infiniteGrid
        followCamera
        cellSize={1.1}
        cellThickness={0.6}
        cellColor="#123057"
        sectionSize={5.5}
        sectionThickness={1.2}
        sectionColor="#00e5ff"
        fadeDistance={58}
        fadeStrength={1.6}
        side={THREE.DoubleSide}
      />
      <Grid
        position={[0, 3.9, 0]}
        infiniteGrid
        followCamera
        cellSize={1.3}
        cellThickness={0.5}
        cellColor="#2a1030"
        sectionSize={6.5}
        sectionThickness={1}
        sectionColor="#ff2d95"
        fadeDistance={48}
        fadeStrength={1.8}
        side={THREE.DoubleSide}
      />
    </>
  );
}
