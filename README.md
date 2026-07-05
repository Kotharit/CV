# Taha Kothari — Theme-Shifting Portfolio & CV

An interactive, responsive portfolio + CV for **Taha Kothari** (Head of IT & Head of
Marketing, Hatimi Retreats Pvt. Ltd.) with **five fully working theme modes**, switchable
live from the persistent top nav:

| # | Theme | Metaphor | Tech |
|---|-------|----------|------|
| 1 | `premiere` *(default)* | Video-editor workspace — bins, source/program monitors, multi-track timeline | DOM/CSS + Framer Motion, **server-rendered** (crawlable hero) |
| 2 | `win7` | Retro Aero desktop — draggable/resizable Explorer windows, taskbar, Start menu | DOM/CSS Modules (Aero glass via `backdrop-blur`) |
| 3 | `space` | Constellation starfield — identity centers wired by animated SVG constellations | R3F instanced starfield + DOM/SVG overlay |
| 4 | `scroll3d` | Deep-scroll 3D fly-through — camera flies a neon tunnel past content stations | R3F + drei `ScrollControls` |
| 5 | `museum` | Minimalist linear gallery — framed exhibits, CRT screening room | DOM-first; optional R3F video-texture CRTs. **Doubles as the mobile / no-WebGL fallback** |

> ⚠️ **All CV content is seeded placeholder data.** Everything renders from
> [`data/profile.ts`](data/profile.ts) — the single source of truth. Strings marked
> `PLACEHOLDER` (and all metrics/dates/links/video ids) must be replaced before
> publishing. See [Replacing placeholder content](#replacing-placeholder-content).

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

Typecheck only: `npm run typecheck`.

## Deploy (Vercel)

1. Push this repo to GitHub/GitLab.
2. [vercel.com/new](https://vercel.com/new) → import the repo. Vercel auto-detects Next.js —
   no custom settings needed.
3. Set the env var `NEXT_PUBLIC_SITE_URL` to your production URL (used for canonical
   metadata/OG URLs; falls back to a placeholder domain).
4. Deploy. The OG card is generated at the edge via `next/og` (`app/opengraph-image.tsx`).

## Architecture

```
app/
  layout.tsx            metadata, OG/Twitter tags, JSON-LD ProfilePage, no-flash theme script
  page.tsx              renders the ThemeRoot shell
  opengraph-image.tsx   build-time OG card (next/og)
  globals.css           per-theme CSS-variable palettes + no-flash guard + focus styles
components/
  theme/ThemeProvider   theme state: localStorage persistence, ?theme= URL override,
                        WebGL probe, mobile + prefers-reduced-motion signals
  theme/ThemeRoot       hard conditional mounting + code-split dynamic imports + fade
  theme/GlobalNav       persistent switcher · résumé download · contact (every theme)
  shared/VideoEmbed     renders any VideoSource (youtube/vimeo iframe, mp4 <video>)
data/profile.ts         ⚠️ single source of truth — all seeded placeholder content
lib/themes.ts           theme registry + effective-theme resolution (mobile/WebGL rules)
lib/hooks.ts            media-query hooks + WebGL detection
themes/
  premiere/  win7/  space/  scroll3d/  museum/    (fully isolated — no code bleed)
public/
  taha-kothari-resume.pdf   ⚠️ placeholder PDF — replace
  covers/*.svg              ⚠️ placeholder cover art — replace
  reels/sample.mp4          bundled sample clip for the mp4 video path
```

### Theme engine

- **Persistence & sharing** — the active theme is stored in `localStorage` (`tk-theme`)
  and mirrored into the URL (`?theme=win7`), so links are shareable. On first load the
  URL param wins over storage.
- **No flash of the wrong theme** — an inline script in `<head>` stamps
  `<html data-theme=…>` before first paint; CSS keeps the server-rendered default
  invisible until React mounts the chosen theme (a branded fade, never the wrong UI).
  Crawlers and no-JS visitors still get the full server-rendered Premiere CV.
- **Hard unmounting** — exactly one theme is mounted at a time
  (`{active === 'space' && <SpaceTheme/>}`). WebGL canvases are never hidden with CSS,
  so R3F's context/resource cleanup always runs on switch.
- **Code splitting** — only the Premiere hero ships in the initial bundle. Win7, Space,
  Scroll3D and Museum load via `next/dynamic` + `ssr:false` on demand; Three.js is never
  downloaded until a WebGL theme is selected.
- **WebGL fallback** — capability is probed once at mount; without WebGL the 3D themes
  are hidden from the switcher and route to the Museum gallery instead of a black screen.
- **Mobile (<768px)** — desktop-metaphor themes (Premiere, Win7, Scroll3D) automatically
  render the Museum linear view; phones land on readable CV content immediately. The
  visitor's chosen theme is preserved for their next desktop visit.
- **Reduced motion** — `prefers-reduced-motion` pauses starfield twinkle, disables the
  3D fly-through (a static DOM fallback renders instead), shortens all transitions, and
  stops auto-playing video textures.

### Memory safety (WebGL themes)

- Imperatively created geometries/materials/textures are `.dispose()`d in effect cleanups.
- Starfield/tunnel/grid use `InstancedMesh` — one draw call per field.
- Every global scroll/resize/pointer listener, observer and interval is removed on unmount.
- Museum CRT canvases mount only near the viewport (IntersectionObserver) and fully
  unmount when off-screen; their `VideoTexture` + `<video>` elements are torn down.

## Replacing placeholder content

1. **`data/profile.ts`** — replace every `PLACEHOLDER` string, metric, date and link.
   The top-of-file banner lists what to check. All five themes update automatically.
2. **Résumé** — drop the real PDF at `public/taha-kothari-resume.pdf` (or change
   `identity.resumePdf`).
3. **Reels** — swap the `showcase[].video` sources: real YouTube/Vimeo ids or mp4 URLs.
   All three `VideoSource` kinds are implemented, including the Museum CRT video texture
   for mp4s. Placeholder ids render an intentional "swap me" card, never a broken embed.
4. **Covers** — replace `public/covers/*.svg` with real stills (update `coverImage` paths).
5. **Domain** — set `NEXT_PUBLIC_SITE_URL` and review metadata in `app/layout.tsx`.

## Accessibility & SEO

- Semantic, server-rendered default theme (headings, landmarks, lists — not canvas-trapped).
- Persistent skip link, keyboard-operable switcher/windows/bins, `aria` labels, visible focus.
- `<title>`/description, Open Graph + Twitter cards, generated OG image, `ProfilePage`
  JSON-LD, résumé reachable from every theme.
