# Architecture & Source Map

Codebase reference for developers and AI coding agents. Read this before
changing anything — it tells you where every behavior lives, which contracts
must hold, and how to verify changes.

**Stack:** Next.js 14 (App Router) · TypeScript (strict) · Tailwind 3 (CSS-variable
theming) · Framer Motion 11 · Three.js via @react-three/fiber 8 + drei 9.

**Commands:** `npm run dev` · `npm run build` · `npm run typecheck`

---

## 1. The one rule

**All CV content lives in [`data/profile.ts`](data/profile.ts).** Every theme
renders from the exported `profile` object and `sectionVideos` map. Never
hardcode names, dates, bullets, links, or video ids inside components. All
seeded content is placeholder — strings marked `PLACEHOLDER` are meant to be
replaced by the site owner, and video/link placeholders render as intentional
"fill me" UI, never broken embeds.

### Content editing cheat-sheet (non-developers edit only this file)

| What | Where in `data/profile.ts` |
|---|---|
| Identity, titles, tagline, contact links | `profile.identity` |
| About paragraphs | `profile.about` |
| Jobs + bullets | `profile.experience` |
| Degrees / certifications | `profile.education`, `profile.certifications` |
| Skill groups | `profile.expertise` (labels in `EXPERTISE_LABELS`) |
| Showcase reels (title/role/cover/video) | `profile.showcase` |
| Timeline clips / career milestones | `profile.milestones` (`start`/`length` are 0..1 fractions of the 2021→mid-2026 timeline) |
| **Per-section video links (paste YouTube URLs, one per line)** | `sectionVideos` — keys: `about · education · experience · expertise · marketing` |
| Résumé PDF path | `profile.identity.resumePdf` → file in `/public` |

`parseVideoLink()` (same file) accepts any YouTube URL form (`watch?v=`,
`youtu.be/`, `shorts/`, `embed/`, `live/`), bare 11-char ids, Vimeo URLs, and
mp4 paths. Unparseable lines render a "couldn't read this link" slot.

---

## 2. Runtime architecture

```
app/layout.tsx        Server. <html data-theme> + inline no-flash script, metadata,
                      OG/Twitter tags, JSON-LD ProfilePage, skip link, <ThemeProvider>.
app/page.tsx          Renders <ThemeRoot/>.
app/opengraph-image.tsx  Edge-generated OG card (next/og).
app/globals.css       Per-theme CSS-variable palettes on html[data-theme='…'],
                      no-flash guard, focus styles, loader keyframes, nav morph.

components/theme/
  ThemeProvider.tsx   Client context. State: theme (chosen), effectiveTheme
                      (after mobile/WebGL rules), hydrated, webglSupported,
                      isMobile, reducedMotion. Persists to localStorage
                      ('tk-theme') + ?theme= URL param. Stamps html[data-theme]
                      with the EFFECTIVE theme after hydration.
  ThemeRoot.tsx       Mounts exactly ONE theme (hard conditional — never CSS-hide
                      a canvas). Premiere statically imported (SSR/crawlable);
                      others next/dynamic ssr:false (Three.js never in the initial
                      bundle). Releases the no-flash guard (data-stage-ready),
                      global 1–5 theme shortcuts, museum-chunk preload on mobile.
  GlobalNav.tsx       Persistent 48px top bar: brand, contact, résumé download,
                      <ThemeSwitcher/>. Themed via --nav-* variables.
  ThemeSwitcher.tsx   Listbox menu (arrow keys, Esc, outside-click), filters
                      WebGL themes when unsupported, kbd shortcut hints.
  ThemeHint.tsx       One-time first-visit discoverability card (localStorage
                      'tk-hint-dismissed'); chips jump straight into themes.

components/shared/
  VideoEmbed.tsx      Renders any VideoSource: youtube/vimeo → lazy <iframe>,
                      mp4 → <video>. PLACEHOLDER ids → intentional card.
  VideoShelf.tsx      "Linked footage" list for a sectionVideos key. Scrollable
                      once it outgrows max-height (compact: 14rem / 24rem).
                      Placeholder + unparseable slots tell the owner exactly
                      which array index to edit.

lib/themes.ts         Theme registry (THEMES), ThemeId, DEFAULT_THEME,
                      resolveEffectiveTheme(theme, {isMobile, webglSupported}):
                      WebGL themes → museum when unsupported; desktop-metaphor
                      themes (premiere/win7/scroll3d) → museum on <768px.
lib/hooks.ts          useMediaQuery, useIsMobile, usePrefersReducedMotion,
                      detectWebGLSupport (probe context is released).
```

### Theme switching lifecycle

1. Inline `<head>` script (layout.tsx): `?theme=` param → localStorage → default;
   stamps `html[data-theme]` **before first paint**.
2. SSR + first client render always show Premiere (crawlers get the full CV);
   CSS (`globals.css` no-flash guard) hides it when a different theme is stored.
3. `ThemeProvider` mount effect adopts the stamped theme; `ThemeRoot` swaps and
   then sets `data-stage-ready`, releasing the guard (branded fade, no flash).
4. `setTheme()` updates state + localStorage + URL (`history.replaceState`);
   an effect re-stamps `html[data-theme]` with the *effective* theme so the CSS
   palette always matches what is actually mounted.

---

## 3. Themes (each fully isolated in `themes/<id>/` — no cross-imports)

### premiere/ — video-editor workspace (DEFAULT, server-rendered)
MUST NOT import three/@react-three (it ships in the initial bundle and SSRs).
- `PremiereTheme.tsx` root: selection state (activeId), reel cue index,
  playhead coherence (asset select → playhead 0; clip click → clip start).
- `ProjectPanel.tsx` bins/asset rows (aria-pressed buttons; Info column
  collapses <1100px). `assets.ts` derives all bins/fake metadata
  deterministically from profile (hash-seeded — SSR/client agree) and builds
  `PROGRAM_REELS` = showcase + every sectionVideos entry.
- `SourceMonitor.tsx` scroll depth → timeline playhead (rAF-throttled,
  imperative; 200ms suppression window absorbs clamp-generated scroll events
  on content swap). `SourcePanels.tsx`: ~25 panels ALL stay mounted, toggled
  via `hidden` (SEO); CSS `panelIn` animation restarts on reveal; panels are
  focus targets (tabIndex=-1) for index-row navigation.
- `ProgramMonitor.tsx` cycles `PROGRAM_REELS` (prev/next + arrow keys).
- `Timeline.tsx` 4 tracks (V3/V2/V1/A1) from `profile.milestones`; playhead is
  a real slider (pointer + arrow keys); `setPlayhead` exposed via ref handle.

### win7/ — Aero desktop (client-only)
- `useWindowManager.ts` open/close/focus/minimize + z-order + cascade spawns.
- `Window.tsx` drag via framer `dragControls` with **plain-object dragBounds**
  (never ref constraints — those are measured once mid-spawn-transform and go
  stale after resize/maximize); windows re-clamp on desktop/window resize;
  restore rect clamped; caption dblclick guarded; Esc closes (focus is handed
  to the next-top window by `Win7Theme.closeWindow`).
- `Taskbar.tsx` (30s clock interval), `StartMenu.tsx` (résumé download link,
  search filter — Esc with text clears instead of closing), `WindowContent.tsx`
  section content + VideoShelf per window, `win7.module.css` all Aero chrome
  (blur lives on .titleBar only — perf).

### space/ — constellation map (client-only, WebGL, allowed on mobile)
- `Starfield.tsx` ~1800-star InstancedMesh, twinkle in useFrame, parallax
  pointer drift; reduced motion → frameloop="demand" static frame; full
  dispose on unmount.
- `constellations.ts` node model (positions in viewport-%, per-node modal
  sections + optional `videos` shelf key). `ConstellationLayer.tsx` DOM nodes
  + SVG wiring (percent-space viewBox, hover/focus/selection draw).
- `NodeModal.tsx` glass dialog: focus trap, Esc/backdrop/✕ close, focus
  returns to the star. Intro card collapses on ≤760px-tall viewports
  (`.introOptional`) so it never covers the IT star.

### scroll3d/ — tunnel fly-through (client-only, WebGL, desktop-only)
- `Scroll3DTheme.tsx` Canvas + drei ScrollControls(pages = STATIONS.length);
  keyboard flight (arrows/PageUp/Down/Home/End); `jumpTo` via scrollTop;
  window resize dispatches a synthetic scroll event (drei only recomputes
  offset inside its scroll handler). Reduced motion → NO canvas; the same
  station components render as a plain scrollable page.
- `Tunnel.tsx` instanced rings/shards + Points dust + portal (all disposed).
- `Stations.tsx` 7 stations fed from profile (+ VideoShelf on experience/
  marketing/education); `ProgressRail.tsx` dot rail (aria-current).

### museum/ — linear gallery (client-only, DOM-first; the mobile + no-WebGL fallback)
- `MuseumTheme.tsx` desktop: horizontal snap-mandatory track — wheel input is
  converted into DISCRETE one-room steps (free scrollLeft += delta is defeated
  by mandatory snap; deltas accumulate across deltaMode). Mobile: same rooms
  stacked vertically. Both containers carry `data-gallery-root` (used as the
  IntersectionObserver root by CRTs).
- `Rooms.tsx` 7 rooms (entrance/career/properties/study/screening/expertise/
  exit) + VideoShelf placements. `Exhibit.tsx` Rise/labels/headings.
- `CrtExhibit.tsx` the ONLY WebGL here, strictly optional: mp4 sources render
  a VideoTexture on a bulged plane inside a small Canvas, mounted only near
  the viewport (IO on the gallery root) and torn down off-screen; click is a
  true play/pause toggle (override beats hover; resets when scrolled away);
  fallback for youtube/vimeo/no-WebGL/reduced-motion/mobile → VideoEmbed.

---

## 4. Contracts & invariants (verify these when changing code)

1. **SSR safety (premiere + shared code it imports):** no window/document at
   render time, no Math.random/Date.now-derived render output (deterministic
   hash-seeding only), no framer `initial` styles baked into SSR HTML that
   hide content (gate on `hydrated`), exactly one `<h1>` per theme.
2. **Memory (WebGL themes):** every imperatively created geometry/material/
   texture is `.dispose()`d in an effect cleanup; big fields are single-draw
   (InstancedMesh/Points); `dpr={[1,2]}`; canvases are unmounted, never
   CSS-hidden.
3. **Listeners:** every addEventListener/interval/rAF/observer is torn down in
   the matching cleanup. Audit: `grep -c addEventListener vs removeEventListener`.
4. **Reduced motion:** every continuous animation checks
   `useTheme().reducedMotion` (or the CSS media query).
5. **A11y:** interactive = real `<button>/<a>`; hover-only affordances have
   focus/tap equivalents; global `:focus-visible` outline must survive.
6. **Theming:** components use Tailwind `theme-*` utilities / `--nav-*` vars —
   never hardcode palette colors in shared components (theme-internal chrome
   may use its own literals).
7. **PROGRAM_REELS ordering:** showcase entries come first — bin assets and
   "Cue in Program Monitor" buttons cue by showcase index.

## 5. How to…

- **Add a video anywhere:** paste the link into `sectionVideos.<key>` in
  `data/profile.ts`. Done — all themes + the Program Monitor pick it up.
- **Add a CV section:** extend `profile`, then surface it per theme
  (Premiere: `assets.ts` bin + `SourcePanels` panel; Win7: `WindowContent` +
  `WINDOW_DEFS`; Museum: a room in `Rooms.tsx`; Space: a node or modal section
  in `constellations.ts`; Scroll3D: a station in `Stations.tsx`).
- **Add a theme:** create `themes/<id>/<Name>Theme.tsx` (default export),
  register in `lib/themes.ts` THEMES + THEME_IDS, add a dynamic import +
  mount line in `ThemeRoot.tsx`, add a palette block in `globals.css`, an
  icon in `ThemeSwitcher.tsx`/`ThemeHint.tsx`.
- **Verify a change:** `npm run typecheck && npm run build`, then exercise the
  affected theme in a browser (all five themes at `/?theme=<id>`; mobile
  ≈390px; reduced-motion emulation for WebGL themes).

## 6. Known placeholder surfaces (intentional, swap before publishing)

`data/profile.ts` PLACEHOLDER strings/metrics/links · `sectionVideos` seeded
lines · `/public/taha-kothari-resume.pdf` · `/public/covers/*.svg` ·
`/public/reels/sample.mp4` · `NEXT_PUBLIC_SITE_URL` env (metadata domain).
