# Typography roles

Canonical **text roles** for blocks and cards. Map each role to **`@marcelinodzn/ds-react`** components and props (see installed typings in `node_modules/@marcelinodzn/ds-react/dist/index.d.ts`). Use **generated CSS variables** from `app/ds-tokens.generated.css` only when you render plain elements (`<p>`, `<span>`) instead of DS typography components.

**Related:** [Layout rules](./layout-rules.md) · [Surface rules](./surface-rules.md) — emphasis and `SurfaceProvider` drive default ink; see §4 below.

**Note:** Exact `size` choices (e.g. `L` vs `M` for **subtitle**) are a product decision; tweak later. This document defines the **role names** and the **dimensions** you set per role.

---

## 1. Role → component, size, weight, colour

| Role | Use for | DS component | `size` | `weight` | `color` (default) | Notes |
|------|---------|--------------|--------|----------|-------------------|--------|
| **display** | Hero / strongest moment | `Display` | `L` \| `M` \| `S` | — (fixed in DS) | `high` or `on-bold-high` on bold surface | Installed `DisplayProps` has no `weight`; DS uses fixed display weight. |
| **blockTitle** | Section / block heading | `Headline` | `L` \| `M` \| `S` | `high` | `high` or `on-bold-high` | Primary block titles. |
| **blockTitleAlt** | Quieter block heading | `Headline` | `M` \| `S` | `medium` | `high` or `on-bold-high` | Same family as block title, lighter emphasis. |
| **eyebrow** | Line above title | `Label` | e.g. `S` | — | `medium` or `low` | Use `Label`’s `size` / `colour` only. |
| **subtitle** | Card titles, accordion headers, in-block paragraph titles — **slightly larger than body** | `Text` | `L` or `M` (pick one product-wide) | `medium` | `high` | Step up from **body**; same component scale as body. |
| **subtitleAlt** | Secondary titles; **same type size as body**, stronger weight | `Text` | `S` (match **body**) | `medium` | `high` | Differs from **body** by weight (`medium` vs `low`), not size. |
| **body** | All normal paragraph copy, **including inside cards** | `Text` | `S` | `low` | `low` | Single body role; no separate “card body”. |
| **bodyLead** | Intro / larger paragraph | `Text` | `XL` or `L` | `low` | `low` | Optional larger body step. |
| **bodyStrong** | Emphasis inside running text | `Text` | same as sibling | `medium` or `high` | `high` | Use sparingly. |
| **bodyCompact** | Dense / secondary copy | `Text` | `XS` or `2XS` | `low` | `low` | Optional small step. |
| **caption** | Meta / fine print | `Text` | `2XS` | `low` | `low` | Optional. |

---

## 2. Subtitle, subtitleAlt, and body (summary)

| Name | Intent |
|------|--------|
| **subtitle** | Slightly **larger** than body; **medium** weight. |
| **subtitleAlt** | **Same size** as body (`S`); **medium** weight (body stays **low**). |
| **body** | Default reading text everywhere, including cards. |

---

## 3. DS API constraints (installed package)

These are enforced by **TypeScript** on the components; align presets and docs with them.

- **`Headline`:** `weight` is **`high` \| `medium` only** — not `low`.
- **`Title`:** `weight` is **`high` \| `medium`**; `size` is **`L` \| `M` \| `S`**. Use when you want **Title** tokens instead of **Body** scale for a subtitle (alternative to **subtitle** / **subtitleAlt** on `Text`).
- **`Text`:** `size` is **`2XL` \| `XL` \| `L` \| `M` \| `S` \| `XS` \| `2XS`**; `weight` is **`low` \| `medium` \| `high`**.
- **Semantic `color` / `colour`:** `high`, `medium`, `low`, `high-tinted`, `medium-tinted`, `low-tinted`, `on-bold-high` (see component props in `.d.ts`).

---

## 4. Surface and colour

- Wrap blocks with **`SurfaceProvider`** using **`getSurfaceProviderProps(emphasis)`** from `lib/utils/block-surface.tsx` where applicable.
- Prefer **omitting** `color` / `colour` or using **semantic** values so type inherits **surface context** (bold / coloured / ghost).
- For explicit text on bold backgrounds, use **`on-bold-high`** where the component API allows it.

---

## 5. Plain elements (`<p>`, `<span>`)

If a pattern cannot use DS components, mirror roles with **only** variables emitted by `scripts/generate-ds-tokens-css.mjs`, for example:

- Sizes: `--ds-typography-label-s`, `--ds-typography-label-m`, `--ds-typography-h5`, etc.
- Weights: `--ds-typography-weight-low`, `--ds-typography-weight-medium`, `--ds-typography-weight-high`
- Semantic ink: `--ds-color-text-high`, `--ds-color-text-medium`, `--ds-color-text-low`

Do **not** invent new `--ds-*` names. Overlay / image cards may use app tokens such as `--local-color-text-on-overlay` where documented for that pattern.

---

## 6. Central implementation (lab)

**Lab blocks** use **`lib/typography/block-typography.ts`**: `LAB_TYPOGRAPHY_VARS`, DS role spreads (`labDisplayRole`, `labHeadlineBlockTitle`, `labTextBody`, …), and plain-element helpers (`labPlainBodyStyle`, `labPlainSubtitleStyle`, …). Prefer those exports over repeating `var(--ds-typography-*)` in `app/lab/**`. Production blocks may still use local patterns until migrated.
