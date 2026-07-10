# CLAUDE.md

Five-theme portfolio/CV for Taha Kothari — Next.js 14 App Router + TypeScript
(strict) + Tailwind (CSS-variable theming) + Framer Motion + R3F.

**Read [`ARCHITECTURE.md`](ARCHITECTURE.md) first** — it maps every file,
the theme-engine lifecycle, and the invariants changes must preserve.

## Commands

```bash
npm run dev          # dev server on :3000
npm run build        # production build (must stay green)
npm run typecheck    # tsc --noEmit
```

## Non-negotiables

- **All CV content comes from `data/profile.ts`** (`profile` + `sectionVideos`).
  Never hardcode content in components. Placeholder strings are intentional.
- **Themes are isolated** in `themes/<id>/` — no imports between theme folders.
  Shared logic goes in `components/` or `lib/`.
- **Premiere is server-rendered**: nothing it imports may touch
  three/@react-three or browser globals at render time.
- **WebGL hygiene**: dispose imperative three resources in effect cleanups,
  unmount canvases (never CSS-hide), instanced meshes for big fields,
  clean up every listener/interval/rAF/observer.
- Honor `useTheme().reducedMotion`, keyboard operability, and the
  `theme-*`/`--nav-*` theming utilities in anything shared.

## Verify before finishing

`npm run typecheck && npm run build`, then load `/?theme=premiere|win7|space|scroll3d|museum`
(plus a ~390px viewport and reduced-motion for WebGL themes) and check the
console is clean.
