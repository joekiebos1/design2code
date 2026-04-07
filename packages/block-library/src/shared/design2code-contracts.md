# Design2Code contracts

Every block (and reusable sub-component like CardItem) must have a **Design2Code contract**. The contract is the single source of truth shared between Figma, CMS, and code.

---

## Convention

Each contract has four sections, always in this order:

### 1. CMS Schema

Block-specific fields. One row per field:

```
field            type/values                                     condition / default
```

- **type/values** — either a data type (`text`, `url`, `asset`, `icon`, `colour`) or an enumeration of allowed values separated by ` · `
- **condition / default** — `default: value`, `optional`, `required`, `only when ...`, or `—` (hidden for this card type / variant)
- Arrays note their item type and min/max: `CardItem[]  min 3`

### 2. CMS Schema shared across blocks

Fields that appear on every block. Identical across contracts — included for completeness so the contract is self-contained.

```
spacingTop       none · medium · large
spacingBottom    none · medium · large
```

### 3. CMS Schema DS specific

Design System colour fields. Same for every block, with conditional visibility rules.

```
emphasis         ghost · minimal · subtle · bold
appearance       primary · secondary · sparkle · neutral         only when emphasis ≠ ghost
```

### 4. Figma workarounds

Properties that exist in Figma components but are **not** CMS fields. Code derives them, or Figma uses fixed slots where code is dynamic.

```
_propertyName    not in CMS · explanation
```

Prefix with `_` to signal these are Figma-only.

---

## Formatting rules

- Use monospace/pre-formatted text (code blocks), not markdown tables.
- Align columns visually with spaces.
- Field names use the exact CMS field name (camelCase).
- Enum values use the exact stored value, separated by ` · `.
- Conditions go in the rightmost column.
- When a field has variant-dependent visibility, use a matrix (see CardItem example below).

---

## CardItem — Design2Code contract

### CMS Schema — cardType variant

There are 6 card types (a single Figma VARIANT property). Each type unlocks a different subset of fields:

```
Card type VARIANT
──────────────────────────────────────────────────────
cardType         mediaTextBelow · mediaTextOverlay · colourFeatured · colourIconText · colourTextOnly · colourMediaText


                         mediaTextBelow  mediaTextOverlay  colourFeatured  colourIconText  colourTextOnly  colourMediaText
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
title            text     required       required          required        required        required        required
description      text     optional       optional          optional        optional        optional        optional
image            asset    optional       required          —               —               —               optional
videoUrl         url      optional       —                 —               —               —               —
ctaText          text     optional       —                 —               —               —               optional        information mode only
ctaLink          url      optional       —                 —               —               —               optional        information mode only
link             url      optional       optional          optional        optional        optional        optional        navigation mode only
backgroundColor  colour   —              —                 required        required        required        required
icon             icon     —              —                 —               required        —               —
iconImage        asset    —              —                 —               optional        —               —

Shared across all card types
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
aspectRatio      4:5 · 8:5 · 2:1                                    default: 4:5 · only editable in compact carousel
```

### Aspect ratio rules (determined by parent block)

```
Carousel compact     4:5 · 8:5 (per card, editable)
Carousel medium      4:5 (locked)
Carousel large       2:1 (locked)
CardGrid 2 cols      4:5 (locked)
CardGrid 3 cols      not used (text-driven cards)
CardGrid 4 cols      not used (text-driven cards)
```

### Figma workarounds

```
_cardSize        not in CMS · derived from parent block
                 grid: 2 cols → large · 3 cols → medium · 4 cols → small
                 carousel: compact → small · medium → medium · large → large
_cardSurface     not in CMS on card · inherited from parent block cardSurface
                 only affects colour card types (colourFeatured · colourIconText · colourTextOnly · colourMediaText)
                 inverted → white background
_cardState       not in CMS · Figma hover/press states for navigation mode
                 information: default (no states)
                 navigation: default · hover (scale 1.02, shadow) · pressed (scale 0.98)
_transition      not in CMS · Figma transition for navigation mode
                 scale + box-shadow · duration: s · easing: transition · level: moderate
```

---

## CardGrid — Design2Code contract

### CMS Schema

```
CMS Schema
──────────────────────────────────────────────────────
interaction      information · navigation                        default: information
columns          2 · 3 · 4                                       default: 3
cardSurface      minimal · subtle · moderate · bold · inverted   colour cards only · cannot match block emphasis · smart default from emphasis
title            text                                             optional
description      text                                             optional
callToActions    CTA[]                                            optional
items            CardItem[]                                       min 1 · max 12
headingAlignment left · center                                    default: left
```

### Column behaviour

```
2 cols           media-forward cards · aspect ratio locked to 4:5
3 cols           text-driven cards · any card type except 8:5 / 2:1 media
4 cols           text-driven cards · any card type except 8:5 / 2:1 media
```

### cardSurface smart defaults (when not set)

```
Block emphasis       Default cardSurface
──────────────────────────────────────────
ghost                minimal
minimal              moderate
subtle               moderate
bold                 inverted
```

### CMS Schema shared across blocks

```
spacingTop       none · medium · large
spacingBottom    none · medium · large
```

### CMS Schema DS specific

```
theme            MyJio · Jio · …                                 default: Jio.com
emphasis         ghost · minimal · subtle · bold                  default: ghost
appearance       primary · secondary · sparkle · neutral          only when emphasis ≠ ghost
minimalBgStyle   block · gradient                                 only when emphasis = minimal
```

### Figma workarounds

```
_cardSize        not in CMS · derived from columns
                 2 cols → large · 3 cols → medium · 4 cols → small
```

### Interaction behaviour

```
information (default)
  Card wrapper: <div>
  ctaText / ctaLink visible on cards that support them
  link field hidden
  No hover/press states on the card itself

navigation
  Card wrapper: <a href={link}>
  ctaText / ctaLink suppressed (entire card is the link)
  link field visible
  Hover: TBD
  Press: TBD
  Transition: TBD
```

---

## Carousel — Design2Code contract

### CMS Schema

```
CMS Schema
──────────────────────────────────────────────────────
interaction      information · navigation                        default: information
cardSize         compact · medium · large                        default: compact
cardSurface      minimal · subtle · moderate · bold · inverted   colour cards only · cannot match block emphasis · smart default from emphasis
title            text                                             optional
description      text                                             optional
callToActions    CTA[]                                            optional
items            CardItem[]                                       min 3
headingAlignment left · center                                    default: left
```

### Card size behaviour

```
compact          aspect ratio per card (4:5 · 8:5)
medium           aspect ratio locked to 4:5
large            aspect ratio locked to 2:1
```

### cardSurface smart defaults (when not set)

```
Block emphasis       Default cardSurface
──────────────────────────────────────────
ghost                minimal
minimal              moderate
subtle               moderate
bold                 inverted
```

### CMS Schema shared across blocks

```
spacingTop       none · medium · large
spacingBottom    none · medium · large
```

### CMS Schema DS specific

```
theme            MyJio · Jio · …                                 default: Jio.com
emphasis         ghost · minimal · subtle · bold                  default: ghost
appearance       primary · secondary · sparkle · neutral          only when emphasis ≠ ghost
minimalBgStyle   block · gradient                                 only when emphasis = minimal
```

### Figma workarounds

```
_cardSize        not in CMS · derived from carousel cardSize
                 compact → small · medium → medium · large → large
```

### Interaction behaviour

```
information (default)
  Card wrapper: <div>
  ctaText / link visible per card type
  No hover/press states on the card itself

navigation
  Card wrapper: <a href={link}>
  ctaText suppressed (entire card is the link)
  link field visible
  Hover: TBD
  Press: TBD
  Transition: TBD
```

---

## Template (copy for new blocks)

```
# BlockName — Design2Code contract


CMS Schema
──────────────────────────────────────────────────────
fieldName        type/values                                     condition / default


CMS Schema shared across blocks
──────────────────────────────────────────────────────
spacingTop       none · medium · large
spacingBottom    none · medium · large


CMS Schema DS specific
──────────────────────────────────────────────────────
emphasis         ghost · minimal · subtle · bold
appearance       primary · secondary · sparkle · neutral         only when emphasis ≠ ghost


Figma workarounds
──────────────────────────────────────────────────────
_propertyName    not in CMS · explanation
```
