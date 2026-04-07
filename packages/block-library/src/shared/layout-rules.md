# Layout Rules

How blocks are laid out. Surface (emphasis, appearance) is in [surface-rules.md](./surface-rules.md). Typography role names and DS mapping are in [typography-roles.md](./typography-roles.md).

**Principle:** Responsibilities are mutually exclusive. Each concern has exactly one owner. No overlap.

---

## 1. The six layout concepts

Every layout on this site is built from exactly these six concepts. Nothing else.

| Concept | Purpose | Component |
|---|---|---|
| **Block** | Unit of content. Owns content slots and structure. | HeroBlock, CarouselBlock, etc. |
| **Band** | Full-width background. Extends to viewport edges (100vw). | BlockSurfaceProvider (fullWidth) |
| **WidthCap** | Constrains how wide content gets. Centres content within a max-width. Main sizes: XS=4col, S=6col, M=8col, Default=10col, Wide=12col. Special variants: `edgeToEdge` (breakout beyond grid), `full` (100% width, no max-width cap). | BlockContainer |
| **Grid** | Divides available space into columns (12/8/4 by breakpoint). | GridBlock |
| **Cell** | Claims a number of columns inside a Grid. `Cell(N)` means "span N columns". Maps to `useGridCell` size names: Cell(4)=XS, Cell(6)=S, Cell(8)=M, Cell(10)=Default, Cell(12)=Wide. | useGridCell |
| **Overlay** | Layers content on top of a base layer (usually media). | Overlay pattern — see section 5 |

**Decision rule — apply in order:**

```
Need a background colour?  → Band
Need to constrain width?   → WidthCap
Need columns?              → Grid + Cell
Need to layer over media?  → Overlay
```

---

## 2. Nesting order

Band, WidthCap, and Grid are all optional — use only what the layout needs.
The rule is about order and ownership, not mandatory use:

- If you use Grid, content must go into Cell — never place content directly in Grid
- If you use Band, content goes through WidthCap and/or Grid as needed
- Never place Cell directly under Band without Grid
- WidthCap can appear inside a Cell for nested width constraints (see section 6)

```
Band              (optional)
  └── WidthCap    (optional)
       └── Grid   (optional)
            └── Cell
                 └── Content (may itself be a WidthCap for nested constraints)
```

Overlay is a parallel pattern — it replaces vertical stacking for a section:

```
Overlay
  ├── Base    (media — defines height)
  └── Float   (content — positioned on top)
       └── WidthCap / Grid / Cell as needed
```

---

## 3. Architecture layers

```
Page
 └── BlockRenderer     [Map only — Sanity data → block components]
      └── BlockShell   [Pattern + vertical spacing]
           └── Block   [Content only — no layout shell, no spacing]
```

| Layer | Does | Never does |
|---|---|---|
| BlockRenderer | Maps Sanity data to block + derives pattern | Touches layout or surface |
| BlockShell | Applies Band/Overlay/Contained + spacingTop/spacingBottom | Touches content |
| Block | Renders content slots | Applies outer spacing or pattern |

**Pattern derivation lives in BlockRenderer — not inside blocks.**

```
pattern =
  contentLayout = mediaOverlay → 'overlay'
  emphasis ≠ ghost + band type → 'band'
  else                         → 'contained'
```

Band types: hero, mediaTextStacked, mediaTextBlock, mediaText5050, carousel,
cardGrid, proofPoints, iconGrid, mediaTextAsymmetric.

---

## 4. Component responsibilities

| Component | Concept | Responsibility |
|---|---|---|
| **BlockShell** | — | Outer wrapper for every block. Applies pattern + vertical spacing. Single place for block-level layout. |
| **BlockSurfaceProvider** | Band | Surface colour + background div. fullWidth=true for Band (100vw). fullWidth=false for Contained with surface. |
| **BlockContainer** | WidthCap | Max-width constraint only. XS=4col, S=6col, M=8col, Default=10col, Wide=12col. Use for headings, standalone content, carousel viewport. |
| **Grid** | Grid | Foundation grid (12/8/4 cols by breakpoint). Uses DS tokens: `var(--ds-grid-columns)`, `var(--ds-grid-gutter)`, `var(--ds-grid-margin)`. On desktop uses fixed `gridMaxWidth` so all Grids align across blocks regardless of parent. Use when content needs column alignment. |
| **useCell** | Cell | Returns gridColumn. Use inside Grid only. |

**Rule:** BlockContainer is never the block wrapper — it lives inside blocks.
BlockShell is always the outer wrapper — blocks never wrap themselves.

---

## 5. Layout patterns

Three patterns — mutually exclusive. Every block uses exactly one.

### Band
- Surface extends to viewport edges (100vw).
- Content inside is constrained by GridBlock.
- Used when emphasis ≠ ghost for band-type blocks.

### Overlay
- Base layer (media) defines the height and fills the space.
- Float layer sits on top using absolute positioning.
- Media is full-width, capped at 1920px. Rounded corners when capped.
- On mobile: breaks out of overlay into stacked (media above, text below).
- Gradient layer sits between base and float when needed.

### Contained
- Content stays within the grid. No full-width breakout.
- When emphasis ≠ ghost: surface colour applies within contained width only.

---

## 6. Common layout patterns

**Stacked elements, different widths**
```
WidthCap(XS)   → Title
WidthCap(S)    → Body
WidthCap(Wide) → Media
```

**Side by side**
```
Grid
  Cell(6) → Text
  Cell(6) → Media
```

**Band with side by side**
```
Band
  Grid
    Cell(6) → Text
    Cell(6) → Media
```

**Overlay**
```
Overlay
  Base          → Media (full width)
  GradientLayer → optional
  Float
    WidthCap(S) → Title, Body, CTAs
```

**Side by side, mixed widths inside a column**
WidthCap can appear inside a Cell to apply a nested width constraint within a column.
```
Grid
  Cell(6)
    WidthCap(XS) → Title    (further constrained within the column)
    WidthCap(S)  → Body
  Cell(6) → Media
```

---

### WidthCap and Grid — never mix in the same layer

| Layout | Tool | Never |
|---|---|---|
| Stacked content, different widths | WidthCap only | Grid + WidthCap |
| Side-by-side columns | Grid + Cell only | WidthCap at grid level |
| Nested constraint inside a column | WidthCap inside Cell | — |

**Why:** Grid adds `paddingInline: var(--ds-grid-margin)`. WidthCap centres with
`marginInline: auto`. Using both at the same layer double-indents content and breaks
column alignment — WidthCap's max-width is pixel-based and doesn't know about grid columns.

**Anti-pattern — never do this:**
```tsx
// WRONG: WidthCap inside Grid at the grid layer
<Grid>
  <div style={useCell('XL')}>
    <WidthCap contentWidth="L">   ← double margin, no grid alignment
      <Headline />
    </WidthCap>
  </div>
</Grid>
```

**Correct — stacked centred content:**
```tsx
// No Grid needed. WidthCap owns the width constraint.
<section>
  <WidthCap contentWidth="L">
    <ProductName />
    <Headline />
  </WidthCap>
  <WidthCap contentWidth="XS">
    <Subheadline />
  </WidthCap>
  <WidthCap contentWidth="L">
    <Buttons />
  </WidthCap>
</section>
```

**Correct — WidthCap inside Cell (nested constraint, allowed):**
```tsx
// WidthCap is content here, not a layout layer. This is fine.
<Grid>
  <div style={useCell('XL')}>
    <WidthCap contentWidth="S">
      <Caption />
    </WidthCap>
  </div>
</Grid>
```

**Decision test:**
Is there a Grid ancestor with no Cell between it and this WidthCap?
- Yes → wrong. Remove Grid or replace WidthCap with useCell.
- No → WidthCap is inside a Cell. Allowed as nested constraint.

### Grid gap — never override

Grid gap is always `var(--ds-grid-gutter)`. It is never overridden via the style prop or any other mechanism.

To create space between content columns, use:

- **Column shift:** Start the second cell later than immediately after the first
- **Cell padding:** `paddingInlineEnd` on text cell, `paddingInlineStart` on media cell
- **Explicit gridColumn placement** for asymmetric layouts

---

## 7. Responsive behaviour

Responsive logic lives in the grid system — never in individual blocks.

| Desktop | Mobile |
|---|---|
| Grid: 12 columns | Grid: 4 columns |
| Cell(6) = half width | Cell(6) = full width (collapses automatically) |
| WidthCap = constrains to max-width | WidthCap = full width (viewport smaller than cap) |
| Band = 100vw | Band = 100vw |
| Overlay = text on media | Overlay → stacked (isStacked from useGridBreakpoint) |

**Mobile is handled by the system — no mobile-specific layout code needed in blocks.**
- Grid Cells collapse to full width when the grid has fewer columns than the span
- WidthCap becomes full width when the viewport is narrower than the cap
- Never add mobile overrides that fight this — they will cause cascade breakage

**Rule:** Use `isStacked` from `useGridBreakpoint()` for stack/side-by-side switching.
Never write ad-hoc `columns < 8` checks inside blocks.

---

## 8. Spacing

- Blocks sit snug — no gap between block boundaries.
- Vertical spacing (spacingTop, spacingBottom) is set by BlockShell from CMS only.
- Blocks never apply their own outer padding.
- Internal spacing uses DS tokens only: `var(--ds-spacing-*)`.

---

## 9. Grid values — single source

All grid values come from DS tokens (in CSS) or `useGridBreakpoint()` (in JS).

| Value | CSS token | JS hook |
|---|---|---|
| Column count | `var(--ds-grid-columns)` | `useGridBreakpoint().columns` |
| Gutter | `var(--ds-grid-gutter)` | `useGridBreakpoint().gutter` |
| Margin | `var(--ds-grid-margin)` | — (use token only) |
| Content max-width | — | `useGridBreakpoint().contentMax*` |
| Spacing | `var(--ds-spacing-*)` | — |

**Which to use:**
```
Setting a CSS property (paddingInline, gap, etc.)  → var(--ds-grid-*)
Value needed in JS for a calculation               → useGridBreakpoint()
```

Prefer `var(--ds-grid-*)` in CSS — it responds to media queries automatically
and stays in sync with the DS without JS involvement.

The Grid component itself uses DS tokens for columns, gutter, and margin.
Never hardcode px values for grid geometry. If a value has no token, stop and flag it.

---

## 10. Sizing and breakpoints (implementation)

### Breakpoint sources

**Viewport → Grid columns**

| Viewport width | Columns | Used for |
|----------------|---------|----------|
| < 768px | 4 | Grid, useCell, WidthCap |
| < 1440px | 8 | Grid, useCell, WidthCap |
| ≥ 1440px | 12 | Grid, useCell, WidthCap |

**Source:** `useGridBreakpoint().columns`

**Rule:** Use `columns` for layout decisions. `columns <= 4` = mobile, `columns <= 8` = tablet, `columns === 12` = desktop.

### useGridBreakpoint()

| Property | Mobile (4 cols) | Tablet (8 cols) | Desktop (12 cols) |
|----------|----------------|-----------------|--------------------|
| `columns` | 4 | 8 | 12 |
| `contentMaxXS` | `100%` | `100%` | px (4 cols) |
| `contentMaxS` | `100%` | `100%` | px (6 cols) |
| `contentMaxM` | `100%` | `100%` | px (8 cols) |
| `contentMaxL` | `100%` | `100%` | px (10 cols) |
| `contentMaxXL` | `100%` | `100%` | px (12 cols) |
| `contentMaxXXL` | = contentMaxXL | = contentMaxXL | px (12 cols, 1920 cap) |
| `isDesktop` | false | false | true (viewport ≥ 1440) |
| `gridMaxWidth` | undefined | undefined | px (capped) |

**Important:** `contentMax*` are `100%` when `!isDesktop` (viewport < 1440). On desktop they are pixel values (capped at ~1346px). `contentMaxXXL` uses 1920px cap for blocks that opt in.

### useGridCell(contentWidth)

| contentWidth | Mobile (4) | Tablet (8) | Desktop (12) |
|--------------|------------|------------|--------------|
| XS | 4 | 4 | 4 |
| S | 4 | 6 | 6 |
| M | 4 | 6 | 8 |
| L | 4 | 6 | 10 |
| XL | 4 | 8 | 12 |
| XXL | 4 | 8 | 12 |

### WidthCap(contentWidth)

| contentWidth | Maps to |
|--------------|---------|
| XS | contentMaxXS |
| S | contentMaxS |
| M | contentMaxM |
| L | contentMaxL |
| XL | contentMaxXL |
| XXL | contentMaxXXL — 12 cols, 1920px cap. Opt-in for wider layout. |
| edgeToEdge | Full viewport, capped 1920px |
| full | 100%, no max-width |

### Responsive helpers

| From hook | Purpose |
|-----------|---------|
| `isMobile` | `columns <= 4` |
| `isTablet` | `4 < columns <= 8` |
| `isDesktop` | `columns >= 12` |
| `breakpoint` | `'mobile' \| 'tablet' \| 'desktop'` |
| `isStacked` | `columns < 8` — stack layout (Hero, MediaText5050, List) |

| Pure functions | Purpose |
|----------------|---------|
| `getBreakpointName(columns)` | Returns breakpoint name |
| `getResponsiveCarouselCols(columns, cardSize)` | Visible carousel cards per breakpoint |
| `getAspectRatioForBreakpoint(baseRatio, columns)` | Landscape → portrait on mobile |

**Rule:** Never use ad-hoc `columns <= 4` in blocks. Use `isMobile`, `isTablet`, `isStacked` from `useGridBreakpoint()`.

### Edge-to-edge (lib/edge-to-edge.ts)

| Export | Purpose |
|--------|---------|
| `EDGE_TO_EDGE_BREAKOUT` | Full viewport width (`100vw`, negative margins) |
| `useEdgeToEdgeMediaStyles()` | Inner container: `max-width: min(100vw, 1920px)`, rounded when capped |
| `EDGE_TO_EDGE_MAX_PX` | 1920 |

### Decision flow — what to use when

```
Need to size content?
├── Inside Grid?
│   └── use useCell(contentWidth) for gridColumn
├── Standalone container (headings, carousel viewport)?
│   └── use WidthCap(contentWidth) or contentMax* from useGridBreakpoint
├── Full viewport (media, backgrounds)?
│   └── use EDGE_TO_EDGE_BREAKOUT + useEdgeToEdgeMediaStyles
└── Carousel / card count / aspect ratio?
    └── use getResponsiveCarouselCols, getAspectRatioForBreakpoint from use-grid-breakpoint
```

---

## 11. Carousel

Cards always live in a **Default-width** area (10/6/4 cols). Wide is only used when buttons are on the side.

### Breakpoints

- **Mobile**: columns ≤ 4
- **Tablet**: columns 8 (768px–1439px)
- **Desktop**: columns 12 (1440px+)

### Layout by breakpoint

**Desktop**

| Size | Cards visible | Card area width | Buttons | Outer container |
|------|---------------|-----------------|---------|-----------------|
| Large | 3 (center full, left/right clipped) | Default (10 cols) | Side | Wide (10 + buttons) |
| Medium | 2 | Default (10 cols) | Bottom | Default |
| Compact | 3 | Default (10 cols) | Bottom | Default |

**Tablet**

| Size | Cards visible | Card area width | Buttons | Outer container |
|------|---------------|-----------------|---------|-----------------|
| Large | 1 | Default (6 cols), fluid | Bottom | Default |
| Medium | 2 | Default (6 cols), fixed 550px | Bottom | Default |
| Compact | 2 | Default (6 cols), fixed 360px | Bottom | Default |

**Mobile**

| Size | Cards visible | Card area width | Buttons | Outer container |
|------|---------------|-----------------|---------|-----------------|
| Large | 1 | 280px fixed | Bottom | Default |
| Medium | 1 | 280px fixed | Bottom | Default |
| Compact | 1 | 280px fixed | Bottom | Default |

### Pagination

- One card per tap, all breakpoints
- **Compact & Medium:** Scroll cap — stop when the last card's right edge aligns with the Default grid right edge (no empty space to the right). When navigating backward from the end, step back by the same amount used for the last forward step.
- **Large:** Min 3 cards (enforced in Sanity). 3 cards in viewport: center full, left/right clipped. Page-based scroll. Forward at end: append first card, then reset on transition end. Back at start: prepend last card; forward past prepend: collapse. Nav buttons never disabled.

### Key rule

**Cards are never Wide.** Wide is only the total row when [left button] + [Default card area] + [right button].

---

## 12. Documented exceptions

Layout for layout/positioning/grid/padding; Surface for surface logic/styling/colouring. Remove outer geometry (width, max-width, margin, align-self, grid-column) from blocks — those belong in the parent layout.

Blocks listed below are **documented exceptions** to this rule.

### MediaZoomOutOnScroll
- **`width`, `maxWidth`, `marginLeft`, `marginRight`** – Dynamic breakout based on scroll progress (100vw when zoomed, Default width when scrolled). Intrinsic to the block's scroll-driven behavior.

### MediaText5050Block (production & lab)
- **`gridColumn` in text/media columns** – Internal 50/50 grid layout within the block's Grid. Not block outer geometry.

### CarouselBlock
- **`cardAreaStyle`: `width`, `maxWidth`, `marginInline: 'auto'`** – Constrains and centers the carousel track. Internal layout.

### TopNavBlock
- **`width: '100%'`, `margin: '0 auto'`** – Nav bar layout. Review whether these should come from a parent layout wrapper.

---

## 13. Typography

Driven by block role via semantic-headline utilities — never chosen independently.

| Role | Component | Use |
|---|---|---|
| hero | Display | Headline only, largest |
| feature | Headline | Headline + body |
| editorial | Title | Compact, all slots |

---

## 14. Content slots

Standard order: eyebrow → title → subhead → body → descriptionTitle → descriptionBody → CTAs.
Slots are optional. Order is consistent when present.

---

## 15. Media

- Aspect ratios from `getAspectRatioForBreakpoint` — never hardcoded.
- Use `next/image` for images.
- Ambient video: muted, autoplay, loop, no controls. Always a poster image.
- Respect `prefers-reduced-motion` — show poster instead of video if reduced motion preferred.

---

## 16. When uncertain — always stop and flag

If you are unsure which concept applies, stop and ask. Do not guess silently.

Common ambiguous cases:
- "Should I pass a custom gap to Grid?" → No. Never. Use column shift, cell padding, or explicit gridColumn placement instead.
- "Should this be a WidthCap or a Cell?" → Is it inside a Grid? Cell. Standalone? WidthCap.
- "Should the Band live in BlockShell or the Block?" → Always BlockShell unless custom layout (see [surface-rules](./surface-rules.md)).
- "Where does this breakpoint logic live?" → useGridBreakpoint only. Never local.
- "Does this block need a Grid or a WidthCap?" → Side by side? Grid. Stacked different widths? WidthCap.
- "Is this WidthCap at the grid layer or nested inside a Cell?" → Is there a Grid ancestor with no Cell between it and this WidthCap? Yes → wrong, remove Grid or replace WidthCap with useCell. No → WidthCap is inside a Cell, allowed as nested constraint.
- "Should I use var(--ds-grid-margin) or the hook?" → Setting CSS? Use the token. Need the value in JS for a calculation? Use `useGridBreakpoint().gutter` (margin not exposed; use token).
