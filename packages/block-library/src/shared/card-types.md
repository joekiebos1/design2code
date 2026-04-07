# Card types — canonical vocabulary

**Status:** implemented. All schemas, renderers, and tooling use the canonical card type values below.

---

## Canonical card types

| Value | Studio label | Visual |
|-------|-------------|--------|
| `mediaTextBelow` | Media + text stacked | Image/video with text below (CTAs optional) |
| `mediaTextOverlay` | Text overlay on media | Text overlaid on image |
| `colourFeatured` | Large text on colour | Featured text on coloured background, no media |
| `colourIconText` | Icon + text on colour | DS icon above text on coloured background |
| `colourTextOnly` | Text on colour | Compact text-only card on coloured background |
| `colourMediaText` | Media + text on colour | 5:4 media + title/description + CTA on minimal background |

### Usage by block

| Block | Allowed card types |
|-------|--------------------|
| **CardGrid** (production) | All six |
| **Carousel** (production) | `mediaTextBelow`, `colourFeatured` |
| **Lab CardGrid** | All six |
| **Lab Carousel** | All six |

### Aspect ratios

| Context | Available ratios |
|---------|-----------------|
| CardGrid | `4:5`, `1:1`, `4:3` |
| Carousel compact | `4:5`, `8:5` |
| Carousel medium | `4:5` (fixed) |
| Carousel large | `2:1` (fixed) |
| Lab (all) | `4:5`, `8:5`, `2:1` |

---

## Schema locations

| Schema type | Path |
|-------------|------|
| `cardGridItem` | `packages/cms-schema/src/blocks/cardGrid.ts` |
| `cardItem` | `packages/cms-schema/src/blocks/cardBlock.ts` |
| `labCardItem` | `packages/cms-schema/src/blocks/labCardItem.ts` |

---

## Changelog

| Date | Change |
|------|--------|
| (created) | Initial proposal for review |
| (updated) | Implemented canonical values, removed all legacy compat |
| (updated) | Renamed: `media-below` → `mediaTextBelow`, `colour-feature` → `colourFeatured`, `colour-icon` → `colourIconText`, `colour-text` → `colourTextOnly` |
| (updated) | Renamed `colourTextIcon` → `colourIconText`. Added `colourMediaText` (media + text on minimal background) |
