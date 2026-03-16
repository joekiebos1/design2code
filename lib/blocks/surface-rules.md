# Surface Rules

How blocks use background colour and DS surface context. **Block-level only.** Layout (Band, Overlay, Contained) is in [layout-rules.md](./layout-rules.md).

**Principle:** Responsibilities are **mutually exclusive**. Each concern has exactly one owner. No overlap.

---

## 1. Hierarchy (emphasis follows layout)

**Emphasis is second.** Layout is chosen first; emphasis adds surface colour when the layout allows it.

```
1. Layout   → Band | Overlay | Contained (from layout-rules)
2. Emphasis → ghost (default) or minimal/subtle/bold + surfaceColour
```

**Default is ghost.** All layouts default to ghost (no surface colour). Author opts in to surface by setting emphasis + surfaceColour.

| Layout | Default | With emphasis |
|--------|---------|---------------|
| **Band** | — | Full-width surface (100vw) |
| **Overlay** | ghost | Optional surface (e.g. text on media) |
| **Contained** | ghost | Optional surface within contained width |

---

## 2. Responsibility matrix

| Responsibility | Owner | Notes |
|----------------|-------|-------|
| Resolve surface colour | block-surface | useBlockBackgroundColor; single place |
| Map emphasis → SurfaceProvider | block-surface | getSurfaceProviderProps; single place |
| Apply surface (wrap + background div) | BlockShell **or** Block | Mutually exclusive. BlockShell: Band (fullWidth) or Contained (fullWidth=false); Block when custom layout. Never both. |

---

## 3. React components (Surface-related)

| Component | Source | Purpose |
|-----------|--------|---------|
| **SurfaceProvider** | DS (`@marcelinodzn/ds-react`) | Provides elevation context (level, hasBoldBackground). DS components read this and adapt automatically. |
| **BlockSurfaceProvider** | `lib/utils/block-surface` | Block-level band. Wraps with SurfaceProvider + background div. Uses emphasis + surfaceColour. |
| **getSurfaceProviderProps** | `lib/utils/block-surface` | Maps emphasis → SurfaceProvider props. Use when wrapping manually. |
| **useBlockBackgroundColor** | `lib/utils/block-surface` | Resolves band colour from emphasis + surfaceColour via DS tokens. |

**Total:** One DS component (SurfaceProvider), one app component (BlockSurfaceProvider), one utility (getSurfaceProviderProps), one hook (useBlockBackgroundColor).

---

## 4. DS connection — how it stays dynamic

All surface colour and typography adaptation flows from the DS:

1. **DsProvider** (app root) provides `platform`, `colorMode`, `theme`, `tokenContext`.
2. **useDsContext()** — BlockSurfaceProvider and useBlockBackgroundColor use this. Token resolution stays in sync with DsProvider.
3. **colors.appearance()** (`@marcelinodzn/ds-tokens`) — Resolves Background/Minimal, Background/Subtle, Background/Bold for Primary, Secondary, Sparkle, Neutral. Uses tokenContext.
4. **SurfaceProvider** — DS component. Child components read context and adapt typography, icon colour, etc. automatically.

**Rule:** Never hardcode colours. Always resolve via DS tokens or SurfaceProvider. When platform, colorMode, or theme changes, surfaces adapt.

---

## 5. Block surface schema (CMS)

**Block level:** Author sets emphasis + surfaceColour. **Default emphasis = ghost.**

| Field | Values | Meaning |
|-------|--------|---------|
| **emphasis** | ghost \| minimal \| subtle \| bold | Background strength. **Default: ghost.** Mutually exclusive. |
| **surfaceColour** | primary \| secondary \| sparkle \| neutral | Background colour (when emphasis ≠ ghost) |
| **minimalBackgroundStyle** | block \| gradient | Only when emphasis = minimal. block = solid; gradient = white → minimal |

**Surface placement** (when emphasis ≠ ghost):

| Layout | Width |
|--------|-------|
| **Band** | Full width (100vw) |
| **Contained** | Within grid (contained width) |

---

## 6. Emphasis → SurfaceProvider mapping

**Single source of truth:** `getSurfaceProviderProps(emphasis)` in `lib/utils/block-surface.tsx`.

| emphasis | level | hasBoldBackground | hasColoredBackground |
|----------|-------|-------------------|------------------------|
| ghost | 0 | false | false |
| minimal | 1 | false | true |
| subtle | 1 | false | true |
| bold | 1 | true | false |

**Rule:** Never hardcode `SurfaceProvider` props. Always use `getSurfaceProviderProps(emphasis)` or `BlockSurfaceProvider`.

---

## 7. When block has surface colour

**Condition:** emphasis ≠ ghost **and** surfaceColour set.

**Placement:** Band (full width) or Contained (within grid). Same colour resolution; different width. See layout-rules for pattern derivation.

**Behaviour:**
- Background colour resolved via `useBlockBackgroundColor(emphasis, surfaceColour)` or `resolveBlockBackgroundColor`
- Uses DS tokens (`colors.appearance`) — stays in sync with DsProvider (platform, colorMode, theme)
- When emphasis = minimal and minimalBackgroundStyle = gradient: `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
- Otherwise: solid colour

---

## 8. Who applies surface colour

| Owner | When | What it does |
|-------|------|--------------|
| **BlockShell (BandShell)** | pattern = band | Wraps block with `BlockSurfaceProvider` (fullWidth). Full-width surface. |
| **BlockShell (ContainedShell)** | pattern = contained, emphasis ≠ ghost | Wraps block with `BlockSurfaceProvider` (fullWidth=false). Contained-width surface. |
| **Block** | Custom layout (MediaText full-bleed overlay, MediaText5050, Hero category) | Uses `useBlockBackgroundColor` + `getSurfaceProviderProps` + own background div. Block handles surface because layout is non-standard. |

**Rule:** A block uses **exactly one** of these. Never both (no double surface).

---

## 9. When to use which (Block level)

| Use | When |
|-----|------|
| **BlockSurfaceProvider** | Band (fullWidth) or Contained with surface (fullWidth=false). Combines SurfaceProvider + background div. Use via BlockShell. |
| **SurfaceProvider** | Block needs surface context but handles its own background (e.g. MediaTextBlock, Hero category). Use `getSurfaceProviderProps(emphasis)`. |
| **getSurfaceProviderProps** | Derive level/hasBoldBackground from emphasis. Use when wrapping with SurfaceProvider manually. |
| **useBlockBackgroundColor** | Need raw colour outside BlockSurfaceProvider (e.g. custom background div). |

---

## 10. Special cases (Block)

| Case | Handling |
|------|----------|
| **Hero category** | Block owns band (half-height custom layout). pattern = contained. Block uses SurfaceProvider + own background div. |
| **Hero mediaOverlay** | pattern = overlay. Block uses SurfaceProvider (bold) for text on media. No BlockSurfaceProvider. |
| **MediaText full-bleed** | pattern = overlay. Block uses blockBgWrapper + SurfaceProvider when emphasis. Block owns band for overlay variant. |
| **MediaText5050** | pattern = band when emphasis. BlockShell provides band. Block uses SurfaceProvider for content; does not add own band. *(Verify: MediaText5050 may duplicate band — needs audit.)* |
| **Edge-to-edge, no emphasis** | emphasis = ghost. No band. SurfaceProvider level 0. |

---

## 11. BlockSurfaceProvider props

| Prop | Purpose |
|------|---------|
| emphasis | Drives SurfaceProvider + background |
| surfaceColour | Drives background colour |
| minimalBackgroundStyle | block \| gradient when emphasis = minimal |
| fullWidth | Band spans 100vw; content capped at 1920px |
| flushTop, flushBottom | Omit padding for flush content (e.g. sideBySide edgeToEdge). Use sparingly. |

**Rule:** fullWidth, flushTop, flushBottom are **layout** concerns. They live on BlockSurfaceProvider because the band and its padding are coupled. Do not add more layout props here — keep surface and layout boundaries clear.

---

## 12. Summary

| Concern | Owner | Tool |
|---------|-------|------|
| Surface colour (Band or Contained) | BlockShell or Block (custom) | BlockSurfaceProvider or useBlockBackgroundColor + SurfaceProvider |
| Emphasis → SurfaceProvider | block-surface | getSurfaceProviderProps |
| Background colour (DS tokens) | block-surface | useBlockBackgroundColor, resolveBlockBackgroundColor |

**Block:** emphasis + surfaceColour = surface. Band = full width. Contained = within grid.

---

## 13. Block contract (surface props)

Blocks that support band receive: **emphasis**, **surfaceColour**, **minimalBackgroundStyle** (optional).

**Band or Contained-with-surface (via BlockShell):** Block does not use these for surface — BlockShell does. Block uses emphasis only for `surface` prop on surface-aware child components.

**Custom-layout blocks:** Block uses all three to create its own surface when emphasis ≠ ghost.
