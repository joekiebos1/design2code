# CMS schema reference (blocks + cards)

One file: page builder blocks and **card** object types. Source of truth: `src/schemaTypes/blocks/*.ts`, `src/schemaTypes/shared/spacingFields.ts`, and `src/schemaTypes/shared/labCarouselCardContext.ts` (lab card aspect rules).

**Spacing** (`spacingTop` / `spacingBottom`): `none` | `medium` | `large` (Studio: *No padding* / *Medium padding* / *Large padding*).

**Design system (DS)** on blocks:

- **`theme`** — DS theme (default MyJio).
- **`emphasis`** — `ghost` | `minimal` | `subtle` | `bold`.
- **`appearance`** — `primary` | `secondary` | `sparkle` | `neutral`. Legacy documents may still use `surfaceColour`; GROQ often uses `coalesce(appearance, surfaceColour)`.
- **`minimalBackgroundStyle`** — when `emphasis` is `minimal`: `block` | `gradient`.

Card objects do **not** use block-level `appearance` / `emphasis`; they use **per-card** fields (e.g. `backgroundColor` on text-on-colour types).

---

## Production page builder (`pageBuilder`)

### HeroBlock (`hero`)

```text
HeroBlock
├── Shell
│   └── spacingBottom  (no spacingTop — flush with page top)
├── Layout
│   ├── contentLayout — stacked | sideBySide | mediaOverlay | textOnly | category
│   ├── containerLayout — edgeToEdge | contained  (sideBySide only)
│   ├── imageAnchor — center | bottom  (sideBySide only)
│   └── textAlign — left | center  (mediaOverlay only)
├── Content
│   ├── eyebrow, title, body
│   ├── ctaText, ctaLink, cta2Text, cta2Link
│   └── image, imageUrl, video, videoUrl
└── DS
    ├── theme
    ├── emphasis  (hidden: category, mediaOverlay)
    └── appearance  (hidden: category, mediaOverlay)
```

---

### MediaTextBlock — stacked (`mediaTextStacked`)

```text
MediaTextBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   ├── template — TextOnly | Stacked | Overlay
│   ├── mediaSize — edgeToEdge | default  (not TextOnly)
│   └── alignment — left | center
├── Content
│   ├── eyebrow, title, subhead, body
│   ├── descriptionTitle, descriptionBody  (Stacked only)
│   ├── ctaText, ctaLink, cta2Text, cta2Link
│   └── image, imageUrl, video, videoUrl  (not TextOnly)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### MediaText5050Block (`mediaText5050`)

```text
MediaText5050Block
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   ├── imagePosition — left | right
│   └── blockFramingAlignment — left | center
├── Content
│   ├── headline, description, callToActions
│   ├── variant — paragraphs | accordion
│   ├── paragraphColumnLayout — single | multi  (paragraphs only)
│   ├── singleSubtitle, singleBody  (paragraphs · single)
│   ├── items[]  (paragraphs · multi — mediaText5050Item)
│   └── accordionItems[]  (accordion — mediaText5050AccordionItem)
├── Media
│   ├── image, imageUrl, video, videoUrl  (not accordion)
│   └── imageAspectRatio — 5:4 | 1:1 | 4:5
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### CardGridBlock (`cardGrid`)

Uses **`cardGridItem`** (see [Card object types](#card-object-types)).

```text
CardGridBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── columns — 2 | 3 | 4
├── Content
│   ├── title
│   └── items[]  (cardGridItem)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### CarouselBlock (`carousel`)

Uses **`cardItem`** (see [Card object types](#card-object-types)).

```text
CarouselBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── cardSize — compact | medium | large
├── Content
│   ├── title, description, callToActions
│   └── items[]  (cardItem)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### ProofPointsBlock (`proofPoints`)

```text
ProofPointsBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── variant — icon | stat
├── Content
│   ├── title, description, callToActions
│   └── items[]  (title, description, icon)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### IconGridBlock (`iconGrid`)

```text
IconGridBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── columns — 3 | 4 | 5 | 6  (optional; auto from count if empty)
├── Content
│   ├── section title, description, callToActions
│   └── items[]  (title, body, icon, accentColor, spectrum)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### MediaTextAsymmetricBlock (`mediaTextAsymmetric`)

```text
MediaTextAsymmetricBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Pattern
│   └── variant — textList | paragraphs | faq | links | longForm | image
├── Content  (depends on variant)
│   ├── blockTitle
│   ├── items[]  (textList, faq, links)
│   ├── paragraphRows[]  (paragraphs)
│   ├── longFormParagraphs[]  (longForm)
│   └── image, imageUrl, imageAlt, imageAspectRatio  (image)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

## Lab page builder (`labPageBuilder`)

Lab also includes production types: `hero`, `mediaTextStacked`, `mediaText5050`, `iconGrid`, `proofPoints` (same trees as above). Below: **lab-only** blocks.

### LabMediaText5050Block (`labMediaText5050`)

```text
LabMediaText5050Block
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   ├── imagePosition — left | right
│   └── blockFramingAlignment — left | center
├── Content
│   ├── headline, description, callToActions  (max one section CTA)
│   ├── variant — paragraphs | accordion
│   ├── paragraphColumnLayout — single | multi  (paragraphs only)
│   ├── singleSubtitle, singleBody  (paragraphs · single)
│   ├── items[]  (labMediaText5050ParagraphItem)
│   └── accordionItems[]  (labMediaText5050AccordionItem)
├── Media
│   ├── image, imageUrl, video, videoUrl  (not accordion)
│   └── imageAspectRatio — 5:4 | 1:1 | 4:5
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### LabCardGridBlock (`labCardGrid`)

Uses **`labCardItem`**.

```text
LabCardGridBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── columns — 2 | 3 | 4
├── Content
│   ├── title, description, callToActions
│   └── items[]  (labCardItem)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### LabCarouselBlock (`labCarousel`)

Uses **`labCardItem`**. Aspect ratio options on each card depend on this block’s **`cardSize`** (see [labCardItem](#labcarditem-labcarditem)).

```text
LabCarouselBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── cardSize — compact | medium | large
├── Content
│   ├── title, description, callToActions
│   └── items[]  (labCardItem)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### EditorialBlock (`editorialBlock`)

```text
EditorialBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── rows
├── Grid
│   ├── textArea  (topLeft / bottomRight)
│   └── imageArea  (topLeft / bottomRight)
├── Typography
│   ├── headlineSize — display | headline | title
│   ├── textAlign — left | center
│   ├── textVerticalAlign — center | bottom
│   └── textInFront
├── Content
│   ├── headline, description, callToActions, body
│   └── ctaText, ctaLink
├── Background
│   ├── backgroundImage, backgroundImageUrl
│   └── backgroundImagePositionX, backgroundImagePositionY
├── Image / video
│   ├── image, imageUrl, videoUrl
│   └── imageFit — cover | contain
└── DS
    ├── emphasis
    └── appearance
```

---

### Full bleed vertical carousel (`fullBleedVerticalCarousel`)

Items are **`fullBleedVerticalCarouselItem`** (slide rows, not card grid cards).

```text
FullBleedVerticalCarouselBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Content
│   ├── section title, description, callToActions
│   └── items[]  (1–7 — fullBleedVerticalCarouselItem)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### Rotating media (`rotatingMedia`)

```text
RotatingMediaBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Layout
│   └── variant — small | large | combined
├── Content
│   ├── section title, description, callToActions
│   └── items[]  (rotatingMediaItem)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

### Media zoom out on scroll (`mediaZoomOutOnScroll`)

```text
MediaZoomOutOnScrollBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Content
│   ├── section title, description, callToActions
│   └── image, imageUrl, videoUrl, alt
└── DS
    └── (no theme / emphasis / appearance on block)
```

---

### LabMediaTextAsymmetricBlock (`labMediaTextAsymmetric`)

Patterns: **paragraphs**, **faq**, **links**, **image** only (no `textList` or `longForm`).

```text
LabMediaTextAsymmetricBlock
├── Shell
│   ├── spacingTop
│   └── spacingBottom
├── Pattern
│   └── variant — paragraphs | faq | links | image
├── Content
│   ├── paragraphLayout — single | multi  (paragraphs only)
│   ├── blockTitle
│   ├── singleColumnBody  (paragraphs · single)
│   ├── paragraphRows[]  (paragraphs · multi)
│   ├── items[]  (faq, links)
│   └── image, imageUrl, imageAlt, imageAspectRatio  (image)
└── DS
    ├── theme
    ├── emphasis
    ├── appearance
    └── minimalBackgroundStyle
```

---

## Card object types

Types registered in `src/schemaTypes/index.ts`. **Blocks** above reference these as `items[]` of-types.

### `cardItem` (carousel)

**Used by:** production **`carousel`** (`items[]`).

Studio hides **`cardType`** when the parent carousel has **`cardSize`** `large` (large carousel is media-only). **`aspectRatio`** is hidden for `large` and `medium` carousels (fixed layout per size).

```text
cardItem
├── Layout
│   ├── cardType — media | text-on-colour  (hidden on large carousel)
│   └── aspectRatio — 4:5 | 8:5  (compact only; hidden for medium/large carousel)
├── Colour
│   └── backgroundColor  (ColorPickerInput; text-on-colour only)
├── Content
│   ├── title
│   ├── description
│   ├── image, imageUrl, video, videoUrl  (not text-on-colour)
│   ├── link, ctaText  (media cards only)
```

---

### `cardGridItem` (production card grid)

**Used by:** **`cardGrid`** (`items[]`).

```text
cardGridItem
├── cardType — media-description-below | media-description-inside
├── title, description
├── image, imageUrl
├── videoUrl  (media-description-below only)
└── ctaText, ctaLink  (media-description-below only; ctaLink when ctaText set)
```

---

### `labCardItem` (`labCardItem`)

**Used by:** **`labCardGrid`**, **`labCarousel`** (`items[]`).

**Aspect ratio** valid values depend on the **parent** block and its **`cardSize`** (carousel):

| Parent | Allowed `aspectRatio` |
|--------|------------------------|
| `labCardGrid` | `4:5`, `8:5`, `2:1` |
| `labCarousel` · compact | `4:5`, `8:5` |
| `labCarousel` · medium | `4:5` only |
| `labCarousel` · large | `2:1` only |

See `validateLabCardAspectRatioForPath` in `src/schemaTypes/shared/labCarouselCardContext.ts`.

```text
labCardItem
├── Layout
│   ├── cardType — media-description-below | media-description-inside | text-on-colour
│   ├── aspectRatio — 4:5 | 8:5 | 2:1  (validated per parent; see table above)
│   └── size — large | small  (text-on-colour only)
├── Colour
│   └── backgroundColor  (text-on-colour only; ColorPickerInput)
├── Content (all types)
│   ├── title, description
├── Media  (not text-on-colour)
│   ├── image, imageUrl, video, videoUrl
│   └── ctaText, ctaLink  (when ctaText set)
└── Text on colour — small only
    ├── icon, iconImage
    ├── callToActionButtons[]  (label, link, style)
    └── features[]  (strings)
```

---

### `textOnColourCardItem` (legacy)

**Used by:** legacy content in card grids; **`BlockRenderer`** still maps `textOnColourCardItem` alongside `cardGridItem`. Prefer **`labCardGrid`** + **`labCardItem`** for new text-on-colour work.

```text
textOnColourCardItem
├── size — large | small
├── icon, iconImage  (small only)
├── title, description
├── callToActionButtons[]  (small only — label, link, style)
├── features[]  (small only)
└── backgroundColor — primary | secondary | tertiary
```

---

### `cardBlock` (legacy document shape)

**Registered** in the schema as `cardBlock` (`title`, `textPosition`, `items[]` of `cardItem`). **Not** included in **`pageBuilder`** — production pages use **`cardGrid`** / **`carousel`** blocks instead. Kept for compatibility.

---

### Other item types (not “cards”)

| Type | Used in |
|------|---------|
| `fullBleedVerticalCarouselItem` | `fullBleedVerticalCarousel.items[]` — title, description, image, imageUrl, video, videoUrl |
| `rotatingMediaItem` | `rotatingMedia.items[]` — image, imageUrl, title, label |
