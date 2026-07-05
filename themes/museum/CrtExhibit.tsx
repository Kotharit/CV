'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useTheme } from '@/components/theme/ThemeProvider';
import { VideoEmbed } from '@/components/shared/VideoEmbed';
import type { ShowcaseItem } from '@/data/profile';
import { MuseumLabel } from './Exhibit';
import styles from './museum.module.css';

/* ------------------------------------------------------------------------- *
 * CRT screen mesh — a gently bulged plane textured with a muted looping
 * <video>. The video element, VideoTexture and geometry are all created
 * imperatively and disposed in effect cleanups (Section 6).
 * ------------------------------------------------------------------------- */

const SCREEN_W = 1.8;
const SCREEN_H = 1.0125; // 16:9

function CrtScreenMesh({
  url,
  playing,
  onError,
}: {
  url: string;
  playing: boolean;
  onError: () => void;
}) {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Slightly convex tube: z bulges toward the camera, flat at the corners.
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H, 32, 18);
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const nx = pos.getX(i) / (SCREEN_W / 2);
      const ny = pos.getY(i) / (SCREEN_H / 2);
      pos.setZ(i, 0.055 * (1 - 0.5 * nx * nx - 0.5 * ny * ny));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;

    const handleLoaded = () => setTexture(tex);
    const handleError = () => onErrorRef.current();
    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('error', handleError);
    videoRef.current = video;

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('error', handleError);
      video.pause();
      video.removeAttribute('src');
      video.load();
      tex.dispose();
      videoRef.current = null;
      setTexture(null);
    };
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      void video.play().catch(() => {
        /* autoplay rejection — the paused first frame still shows */
      });
    } else {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* no metadata yet — nothing to rewind */
      }
    }
  }, [playing, texture]);

  if (!texture) return null; // the bezel's cover image shows through

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------------- *
 * CrtExhibit — DOM bezel + museum label around either the WebGL tube
 * (mp4 + WebGL + motion allowed + desktop) or the shared <VideoEmbed>.
 * ------------------------------------------------------------------------- */

export function CrtExhibit({ item, index }: { item: ShowcaseItem; index: number }) {
  const { webglSupported, reducedMotion, isMobile } = useTheme();
  const rootRef = useRef<HTMLElement | null>(null);
  const [near, setNear] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const mp4Url = item.video.kind === 'mp4' ? item.video.url : null;
  const useCrt =
    webglSupported && !reducedMotion && !isMobile && mp4Url !== null && !videoFailed;
  const playing = useCrt && near && (hovered || focused || pinned);

  const handleVideoError = useCallback(() => setVideoFailed(true), []);

  // Mount the Canvas only while the exhibit is near the viewport, so at most
  // a couple of GL contexts ever live at once. Disconnected on cleanup.
  useEffect(() => {
    if (!useCrt) return;
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setNear(entry.isIntersecting));
      },
      { rootMargin: '160px 320px 160px 320px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [useCrt]);

  // Hover plays on mouse/pen only; on touch a tap toggles instead.
  const handlePointerEnter = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'touch') setHovered(true);
  };
  const handlePointerLeave = () => setHovered(false);
  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    let visible = true;
    try {
      visible = e.currentTarget.matches(':focus-visible');
    } catch {
      /* older engines — treat any focus as intent to play */
    }
    setFocused(visible);
  };
  const handleBlur = () => setFocused(false);

  return (
    <figure ref={rootRef} className="w-full max-w-[420px]">
      <div className={styles.crtShell}>
        {useCrt && mp4Url ? (
          <button
            type="button"
            className={`${styles.crtScreen} ${styles.scanlines} ${styles.crtGlass} aspect-video`}
            aria-pressed={pinned}
            aria-label={`${playing ? 'Pause' : 'Play'} reel — ${item.title}`}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={() => setPinned((p) => !p)}
          >
            <Image
              src={item.coverImage}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-60"
              sizes="420px"
            />
            {near && (
              <Canvas
                dpr={[1, 2]}
                frameloop="always"
                camera={{ position: [0, 0, 1.05], fov: 50 }}
                gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <CrtScreenMesh url={mp4Url} playing={playing} onError={handleVideoError} />
              </Canvas>
            )}
          </button>
        ) : (
          <div className={`${styles.crtScreen} ${styles.scanlines} ${styles.crtGlass}`}>
            <VideoEmbed video={item.video} title={item.title} cover={item.coverImage} />
          </div>
        )}
        <div className="mt-2.5 flex items-center justify-between px-1 pb-1">
          <span className="text-[8px] uppercase tracking-[0.35em] text-white/30">
            Museum AV · Unit {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className={`${styles.led} ${playing ? styles.ledOn : ''}`}
            aria-hidden
            title={playing ? 'Playing' : 'Standby'}
          />
        </div>
      </div>
      <figcaption className="mt-5">
        <MuseumLabel
          no={`Exhibit 05.${index + 1}`}
          title={item.title}
          medium={`${item.role} — single-channel video`}
        >
          <p className="mt-2 text-[13px] leading-relaxed text-theme-muted">
            {item.description}
          </p>
        </MuseumLabel>
      </figcaption>
    </figure>
  );
}
