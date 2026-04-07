# Figma Team Library — component properties → Sanity

Each **DotCom BETA** block component should expose **VARIANT** (or TEXT) properties whose **names match Sanity field names** (camelCase, same as in code). The import script matches property labels case-insensitively and ignores spaces (e.g. `contentLayout`, `Content layout`, `content layout` all map to the `contentLayout` field).

**Values** can be either the **stored Sanity value** (e.g. `sideBySide`) or the **Studio label** (e.g. `Side by side`).

Below: **Property name** = what to use in Figma. **Values** = allowed options.

---

## `hero`

| Property name | Values (value · Studio label) |
|---------------|-------------------------------|
| `contentLayout` | `stacked` · Stacked · `sideBySide` · Side by side · `mediaOverlay` · Media overlay · `textOnly` · Text only · `category` · Category |
| `containerLayout` | `edgeToEdge` · Edge to edge · `contained` · Contained (side by side only) |
| `imageAnchor` | `center` · Center · `bottom` · Top to bottom (side by side only) |
| `textAlign` | `left` · Left · `center` · Center (media overlay only) |
| `theme` | `MyJio` · `JioHome` · `JioMart` · `JioFinance` · `JioGauSamridhhi` · `JioKrishi` |
| `emphasis` | `ghost` · Ghost · `minimal` · Minimal · `subtle` · Subtle · `bold` · Bold |
| `appearance` | `primary` · Primary · `secondary` · Secondary · `sparkle` · Sparkle · `neutral` · Neutral |

---

## `mediaTextStacked`

| Property name | Values |
|---------------|--------|
| `template` | `TextOnly` · Text only · `Stacked` · Stacked – … · `Overlay` · Overlay – … |
| `mediaSize` | `edgeToEdge` · Edge to edge · `default` · Contained |
| `alignment` | `left` · Left · `center` · Center |
| `theme` | (same as hero) |
| `emphasis` | (same as hero) |
| `appearance` | (same as hero) |
| `minimalBackgroundStyle` | `block` · Block (solid) · `gradient` · Gradient (white to minimal) |

---

## `mediaText5050`

| Property name | Values |
|---------------|--------|
| `imagePosition` | `left` · Image left · `right` · Image right |
| `blockFramingAlignment` | `left` · Left · `center` · Centre |
| `variant` | `paragraphs` · Paragraphs – stacked sections · `accordion` · Accordion – collapsible sections |
| `paragraphColumnLayout` | `single` · Single section · `multi` · Multiple sections |
| `imageAspectRatio` | `5:4` · `1:1` · `4:5` |
| `theme` | (same as hero) |
| `emphasis` | (same as hero) |
| `appearance` | (same as hero) |
| `minimalBackgroundStyle` | (same as mediaTextStacked) |

---

## `mediaTextAsymmetric`

| Property name | Values |
|---------------|--------|
| `variant` | `textList` · `paragraphs` · `faq` · `links` · `longForm` · `image` (see Studio for full labels) |
| `theme` | (same as hero) |
| `emphasis` | (same as hero) |
| `appearance` | (same as hero) |
| `minimalBackgroundStyle` | (same as mediaTextStacked) |

---

## `cardGrid`

| Property name | Values |
|---------------|--------|
| `columns` | `2` · 2 · `3` · 3 · `4` · 4 |
| `theme` | (same as hero) |
| `emphasis` | (same as hero) |
| `appearance` | (same as hero) |
| `minimalBackgroundStyle` | (same as mediaTextStacked) |

---

## `carousel`

| Property name | Values |
|---------------|--------|
| `cardSize` | `compact` · Compact · `medium` · Medium · `large` · Large |
| `theme` | (same as hero) |
| `emphasis` | (same as hero) |
| `appearance` | (same as hero) |
| `minimalBackgroundStyle` | (same as mediaTextStacked) |

**TEXT layers (import):** Section copy lives **outside** card frames. Put each **card** in its own frame/instance; name layers inside cards to match Sanity **`cardItem`** fields: `title`, `description`, `body`, `ctaText`, `cta`, `button`, `link`, `url`, `href`, or paste a URL as text. Optional **section** rows can be named `section title`, `section description`; framing buttons `cta` / `button` (with optional URL text nearby). A frame named **Track**, **Slides**, **Cards**, or similar wraps slides; **Header** / **section header** frames are skipped as chrome when naming matches.

---

## `proofPoints`

| Property name | Values |
|---------------|--------|
| `variant` | `icon` · Icon (default) · `stat` · Statistics |
| `theme` | (same as hero) |
| `emphasis` | (same as hero) |
| `appearance` | (same as hero) |
| `minimalBackgroundStyle` | (same as mediaTextStacked) |

---

## `iconGrid`

| Property name | Values |
|---------------|--------|
| `columns` | `3` · 3 columns · `4` · `5` · `6` (numeric variants) |
| `theme` | (same as hero) |
| `emphasis` | (same as hero) |
| `appearance` | (same as hero) |
| `minimalBackgroundStyle` | (same as mediaTextStacked) |

---

**Source of truth in code:** `lib/figma/figma-block-field-manifest.ts` (`FIGMA_BLOCK_ENUM_MANIFEST`). Update that file when Sanity block options change, then refresh this doc.
