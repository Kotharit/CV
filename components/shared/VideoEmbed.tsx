'use client';

import Image from 'next/image';
import { Film } from 'lucide-react';
import { isPlaceholderVideo, type VideoSource } from '@/data/profile';

interface VideoEmbedProps {
  video: VideoSource;
  title: string;
  /** Cover/poster path (from profile showcase data). */
  cover?: string;
  className?: string;
}

/**
 * Renders any of the three VideoSource kinds (Section 5):
 *   - youtube / vimeo -> lazy <iframe> embed
 *   - mp4             -> native <video>
 * Seeded PLACEHOLDER ids render an intentional placeholder card (instead of a
 * broken embed) so the site looks finished until real reels are swapped in.
 * The Museum theme's CRT video-texture path lives in the museum theme itself.
 */
export function VideoEmbed({ video, title, cover, className = '' }: VideoEmbedProps) {
  if (isPlaceholderVideo(video)) {
    return (
      <div
        className={`relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black ${className}`}
        role="img"
        aria-label={`${title} — placeholder reel`}
      >
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            unoptimized
            className="object-cover opacity-80"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-2 rounded-lg bg-black/60 px-4 py-3 text-center backdrop-blur-sm">
          <Film size={20} aria-hidden className="text-theme-accent" />
          <p className="text-xs font-medium text-white">
            Placeholder reel — swap the {video.kind} id in{' '}
            <code className="font-mono">data/profile.ts</code>
          </p>
        </div>
      </div>
    );
  }

  switch (video.kind) {
    case 'youtube':
      return (
        <iframe
          className={`aspect-video w-full bg-black ${className}`}
          src={`https://www.youtube-nocookie.com/embed/${video.id}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    case 'vimeo':
      return (
        <iframe
          className={`aspect-video w-full bg-black ${className}`}
          src={`https://player.vimeo.com/video/${video.id}`}
          title={title}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    case 'mp4':
      return (
        <video
          className={`aspect-video w-full bg-black ${className}`}
          src={video.url}
          poster={cover}
          controls
          playsInline
          preload="metadata"
          aria-label={title}
        />
      );
  }
}
