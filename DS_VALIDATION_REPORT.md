# MediaTextBlock DS Validation Report

Validation against `@marcelinodzn/ds-react` v1.0.6 (from `node_modules`).

---

## 1. Text Component

### Props (from `dist/index.d.ts`)

| Prop | Type | Description |
|------|------|-------------|
| `size` | `TextSize` | Body typography size |
| `weight` | `'low' \| 'medium' \| 'high'` | Font weight |
| `as` | `TextElement` | Semantic HTML element |
| **`color`** | **`TextColor`** | **Text color token** |
| `align` | `TextAlign` | Alignment |
| `truncate` | `boolean \| number` | Truncation |
| `children`, `className`, `style`, etc. | — | Standard |

### TextColor values

```
'high' | 'medium' | 'low' | 'high-tinted' | 'medium-tinted' | 'low-tinted' | 'on-bold-high'
```

### Surface-aware behavior

**Yes.** Text uses `useHasBoldBackground()` internally. When `hasBoldBackground` is true and `color` does not start with `"on-bold"`, it overrides to `"on-bold-high"`:

```js
const effectiveColor = hasBoldBackground && !color.startsWith("on-bold") ? "on-bold-high" : color;
```

### MediaTextBlock usage

- Uses `color="medium"` for body and bullets — valid.
- On bold backgrounds, Text auto-adapts to `on-bold-high` via SurfaceProvider context.

---

## 2. Label Component

### Props (from `dist/index.d.ts`)

| Prop | Type | Description |
|------|------|-------------|
| `size` | `LabelSize` | Label typography size |
| `weight` | `'low' \| 'medium' \| 'high'` | Font weight |
| **`attention`** | **`LabelAttention`** | Emphasis (preferred over color) |
| `tinted` | `boolean` | Tinted colors |
| `onMedia` | `boolean` | On media/images |
| `as` | `LabelElement` | Semantic HTML element |
| **`color`** | **`LabelColor`** | Deprecated, use `attention` |
| `align` | `LabelAlign` | Alignment |
| `children`, `className`, `style`, etc. | — | Standard |

### LabelAttention values

```
'high' | 'medium' | 'low' | 'on-bold-medium' | 'on-bold-high'
```

### LabelColor values

```
'high' | 'medium' | 'low' | 'high-tinted' | 'medium-tinted' | 'low-tinted' | 'on-bold-high'
```

### Surface-aware behavior

**Yes.** Label uses `useHasBoldBackground()` internally and overrides color when on bold background.

### MediaTextBlock usage — invalid

Current code:

```tsx
<Label
  size="S"
  {...(hasBoldBackground ? { color: 'on-bold-high' as const } : { appearance: 'secondary' })}
>
  {eyebrow}
</Label>
```

**Issue:** Label has no `appearance` prop. `appearance: 'secondary'` is invalid.

**Fix:** Use `attention="medium"` or `color="medium"` for secondary/de-emphasized eyebrow on non-bold backgrounds. For bold backgrounds, `color="on-bold-high"` is correct.

---

## 3. Button Component

### Props (from `dist/Button-BYZDmT8U.d.ts`)

| Prop | Type | Description |
|------|------|-------------|
| `size` | `ButtonSize` | XS \| S \| M \| L \| XL |
| `attention` | `ButtonAttention` | low \| medium \| high |
| **`appearance`** | **`ButtonAppearance`** | Color theme |
| `contained` | `boolean` | Has background fill (default true) |
| `condensed` | `boolean` | Compact spacing |
| `single` | `boolean` | Icon-only |
| `fullWidth` | `boolean` | Expand to container |
| `loading` | `boolean` | Loading state |
| `start`, `content`, `end` | `ReactNode` | Slots |
| `children` | `ReactNode` | Deprecated, use `content` |

### ButtonAppearance values

```
'auto' | 'primary' | 'secondary' | 'sparkle' | 'neutral' | 'informative' | 'positive' | 'warning' | 'negative'
```

**There is no `'ghost'` appearance.**

### Surface-aware behavior

**Partial.** Button:

- Uses `useSurfaceLevel()` for surface level.
- Does **not** use `useHasBoldBackground()` for the parent SurfaceProvider.
- Uses its own `hasBoldBackground = contained && attention === "high"` (its own fill).
- Wraps its content in a SurfaceProvider with that internal `hasBoldBackground`.

So Button adapts when it has a bold fill (e.g. primary contained), but does **not** adapt when it is outline/ghost on a parent bold background.

### MediaTextBlock usage — invalid

Current code:

```tsx
<Button appearance="ghost" size="S" onPress={() => handleCtaPress(ctaSecondary.href)}>
  {ctaSecondary.label}
</Button>
```

**Issue:** `appearance="ghost"` is not a valid `ButtonAppearance`.

**Fix:** Use `appearance="secondary"` with `contained={false}` for an outline/secondary CTA style.

---

## 4. SurfaceProvider

### Props (from `dist/index.d.ts`)

| Prop | Type | Description |
|------|------|-------------|
| `level` | `SurfaceLevel` | 0, 1, or 2 |
| **`hasBoldBackground`** | **`boolean`** | Bold/colored background requiring [On Bold] text |
| `hasColoredBackground` | `boolean` | Colored background, High Tinted text |
| `hasLowAttention` | `boolean` | Low attention styling |
| `appearance` | `string` | For icon/text color inheritance |
| `children`, `className`, `style`, `as` | — | Standard |

### Does `hasBoldBackground` affect children?

**Yes.** Components that consume surface context use `useHasBoldBackground()`:

- **Text** — overrides color to `on-bold-high` when on bold background.
- **Label** — same behavior.
- **Display** — same.
- **Headline** — same.
- **Title** — same.
- **Icon** — uses `effectiveAttention = "on-bold"` when on bold background.

**Button** does not use parent `hasBoldBackground`; it only uses its own internal state.

---

## 5. Package Structure

```
node_modules/@marcelinodzn/ds-react/
├── package.json
├── README.md
└── dist/
    ├── index.d.ts          # Main types (Text, Label, SurfaceProvider, etc.)
    ├── index.d.mts
    ├── index.js / index.mjs
    ├── Button-BYZDmT8U.d.ts # Button types
    ├── Button-BYZDmT8U.d.mts
    ├── Button-BYZDmT8U.js
    └── components/
        ├── Button/index.d.ts
        └── icons/index.d.ts
```

---

## Summary: MediaTextBlock Fixes

| Component | Current | Issue | Fix |
|-----------|---------|-------|-----|
| **Label** (eyebrow) | `appearance: 'secondary'` when not bold | Label has no `appearance` prop | Use `attention="medium"` or `color="medium"` |
| **Button** (secondary CTA) | `appearance="ghost"` | `'ghost'` not in ButtonAppearance | Use `appearance="secondary"` and `contained={false}` |
| **Text** | `color="medium"` | — | Correct; auto-adapts on bold |
| **SurfaceProvider** | `hasBoldBackground` from blockBackground | — | Correct |
