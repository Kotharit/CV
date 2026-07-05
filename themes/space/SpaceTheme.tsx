'use client';

import { profile } from '@/data/profile';

// STUB — replaced by the full Space theme implementation.
export default function SpaceTheme() {
  return (
    <div className="h-full w-full overflow-y-auto bg-theme-bg p-8 text-theme-fg">
      <h1 className="text-2xl font-bold">{profile.identity.name}</h1>
      <p className="mt-2 text-theme-muted">{profile.identity.tagline}</p>
      <p className="mt-4 text-sm text-theme-muted">Space theme is being built…</p>
    </div>
  );
}
