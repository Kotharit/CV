// Panel header strip shared by every workspace panel: title tab plus the
// decorative ≡ / ✕ affordances every NLE panel carries. Server-safe (no hooks).

import type { ReactNode } from 'react';

interface PanelChromeProps {
  title: string;
  /** Optional extra content pinned to the right, before the fake affordances. */
  right?: ReactNode;
}

export default function PanelChrome({ title, right }: PanelChromeProps) {
  return (
    <header className="flex h-7 flex-none select-none items-center gap-2 border-b border-[#3a3a3a] bg-[#2c2c2c] px-2">
      <span className="relative truncate pb-px text-[11px] font-semibold tracking-wide text-theme-fg">
        {title}
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-[3px] h-[2px] bg-[#3f8ae0]"
        />
      </span>
      {right ? <span className="ml-auto flex items-center gap-2">{right}</span> : null}
      <span
        aria-hidden
        className={`flex items-center gap-2 text-[11px] leading-none text-[#7a7a7a] ${right ? '' : 'ml-auto'}`}
      >
        <span>≡</span>
        <span>✕</span>
      </span>
    </header>
  );
}
