'use client';

import { profile } from '@/data/profile';

// STUB — replaced by the full Museum theme implementation.
export default function MuseumTheme() {
  return (
    <div className="h-full w-full overflow-y-auto bg-theme-bg p-8 text-theme-fg">
      <h1 className="text-2xl font-bold">{profile.identity.name}</h1>
      <p className="mt-2 text-theme-muted">{profile.identity.tagline}</p>
      <p className="mt-4 text-sm text-theme-muted">Museum theme is being built…</p>
    </div>
  );
}
