/**
 * Lab block typography — roles in `lib/blocks/typography-roles.md`.
 *
 * **Presets:** `lab-typography-presets.ts` — one spread per node (`...labTextPresets.body`).
 * Named `labText*` / `labHeadline*` delegates keep existing imports working.
 * **`labStyle*`** — token overrides when DS `size` is not enough.
 */

import type { CSSProperties } from 'react'

import {
  labDisplayPreset,
  labHeadlinePresets,
  labLabelPreset,
  labTextPresets,
} from './lab-typography-presets'

export {
  labDisplayPreset,
  labHeadlinePresets,
  labLabelPreset,
  labTextPresets,
} from './lab-typography-presets'

/** Generated `--ds-typography-*` / `--ds-color-text-*` references (see `scripts/generate-ds-tokens-css.mjs`). */
export const LAB_TYPOGRAPHY_VARS = {
  h1: 'var(--ds-typography-h1)',
  h2: 'var(--ds-typography-h2)',
  h3: 'var(--ds-typography-h3)',
  h4: 'var(--ds-typography-h4)',
  h5: 'var(--ds-typography-h5)',
  labelS: 'var(--ds-typography-label-s)',
  labelM: 'var(--ds-typography-label-m)',
  /** May be provided by DS global CSS; used by compact card title scale */
  labelL: 'var(--ds-typography-label-l)',
  bodyXs: 'var(--ds-typography-body-xs)',
  bodyM: 'var(--ds-typography-body-m)',
  headlineXs: 'var(--ds-typography-headline-xs)',
  weightLow: 'var(--ds-typography-weight-low)',
  weightMedium: 'var(--ds-typography-weight-medium)',
  weightHigh: 'var(--ds-typography-weight-high)',
  textHigh: 'var(--ds-color-text-high)',
  textLow: 'var(--ds-color-text-low)',
} as const

const LINE_HEIGHT_BODY = 1.4

/** DS `Display` — no `weight` in published API; size + semantic colour only. */
export const labDisplayRole = { ...labDisplayPreset }

/** DS `Headline` — block / section titles (no `color`; surface / DS ink). */
export const labHeadlineBlockTitle = { ...labHeadlinePresets.block }

export const labHeadlineBlockTitleAlt = { ...labHeadlinePresets.blockAlt }

/** DS `Text` roles (no `color` except `labTextBodyMedium`; surface / DS ink). */
export const labTextBody = { ...labTextPresets.body }

export const labTextSubtitle = { ...labTextPresets.subtitle }

export const labTextSubtitleAlt = { ...labTextPresets.subtitleAlt }

export const labTextBodyLead = { ...labTextPresets.bodyLead }

/** DS `Text` — secondary body (M / low / medium colour); asymmetric single column. */
export const labTextBodyMedium = { ...labTextPresets.bodyMedium }

/** DS `Text` — fine print / meta (smallest reading step used in lab). */
export const labTextCaption = { ...labTextPresets.caption }

/** DS `Label` — eyebrow */
export const labLabelEyebrow = { ...labLabelPreset }

/** Plain `<p>` / `<span>` when DS typography components are not used */
export function labPlainBodyStyle(overrides?: CSSProperties): CSSProperties {
  return {
    fontSize: LAB_TYPOGRAPHY_VARS.labelS,
    lineHeight: LINE_HEIGHT_BODY,
    fontWeight: LAB_TYPOGRAPHY_VARS.weightLow,
    color: LAB_TYPOGRAPHY_VARS.textLow,
    ...overrides,
  }
}

export function labPlainSubtitleStyle(overrides?: CSSProperties): CSSProperties {
  return {
    fontSize: LAB_TYPOGRAPHY_VARS.h5,
    lineHeight: LINE_HEIGHT_BODY,
    fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
    color: LAB_TYPOGRAPHY_VARS.textHigh,
    ...overrides,
  }
}

export function labPlainSubtitleAltStyle(overrides?: CSSProperties): CSSProperties {
  return {
    fontSize: LAB_TYPOGRAPHY_VARS.labelS,
    lineHeight: LINE_HEIGHT_BODY,
    fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
    color: LAB_TYPOGRAPHY_VARS.textHigh,
    ...overrides,
  }
}

// --- Optional `style` on DS typography when token size overrides `size` prop (lab global settings) ---

/** Stacked Media + Text — main column body (label-s; matches production `MEDIA_TEXT_SUBTITLE_BODY_STYLE.body`). */
export const labStyleTextStackedMediaBody: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.labelS,
  lineHeight: LINE_HEIGHT_BODY,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightLow,
}

/** Section / block title at h2 token (e.g. proof points band title). */
export const labStyleHeadlineBlockH2: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.h2,
  lineHeight: LINE_HEIGHT_BODY,
}

/** Lab variant rail / block helper title (h3). */
export const labStyleHeadlineVariantRail: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.h3,
  lineHeight: LINE_HEIGHT_BODY,
}

/** `labHeadlineBlockTitleAlt` — prominent single section (50/50 single paragraph title). */
export const labStyleHeadlineAltProminent: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.h4,
  lineHeight: LINE_HEIGHT_BODY,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
}

/** `labHeadlineBlockTitleAlt` — default row / accordion header. */
export const labStyleHeadlineAltDefault: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.h5,
  lineHeight: LINE_HEIGHT_BODY,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
}

/** When `labTextSubtitle` is used but copy should resolve to h5 token (asymmetric rows). */
export const labStyleTextSubtitleTokenH5: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.h5,
  lineHeight: LINE_HEIGHT_BODY,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
}

/** Prominent in-column label (label-m + medium; asymmetric block title). */
export const labStyleTextProminentLabelM: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.labelM,
  lineHeight: LINE_HEIGHT_BODY,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
}

/** Link list row (label-m + medium + interactive ink). */
export const labStyleTextInteractiveLink: CSSProperties = {
  ...labStyleTextProminentLabelM,
  color: 'var(--ds-color-text-interactive)',
}

/** Nav / dense UI links (body-xs + low). */
export const labStyleNavDense: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.bodyXs,
  lineHeight: 1.5,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightLow,
}

/** Lab chrome — back link above block detail title. */
export const labStyleLabBackLink: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.bodyXs,
  lineHeight: 1.5,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightLow,
  color: 'var(--ds-color-text-low)',
}

/** Lab block detail page — page title (h2 + high weight). */
export const labStyleLabPageTitle: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.h2,
  lineHeight: LINE_HEIGHT_BODY,
  fontWeight: LAB_TYPOGRAPHY_VARS.weightHigh,
}

/** Lab block detail page — meta line under title. */
export const labStyleLabPageMeta: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.bodyM,
  lineHeight: LINE_HEIGHT_BODY,
}

/** Feature / checklist rows (body-xs, compact line height). */
export const labStyleTextDenseList: CSSProperties = {
  fontSize: LAB_TYPOGRAPHY_VARS.bodyXs,
  lineHeight: LINE_HEIGHT_BODY,
}

/** Editorial block `Title` headline — high weight only (level set in component). */
export const labStyleEditorialTitleWeight: CSSProperties = {
  fontWeight: LAB_TYPOGRAPHY_VARS.weightHigh,
}

/**
 * Single registry for lab typography — use for imports when you want one object
 * (Storybook, tooling, or gradual migration).
 */
export const LAB_BLOCK_TYPOGRAPHY = {
  tokens: LAB_TYPOGRAPHY_VARS,
  presets: {
    text: labTextPresets,
    headline: labHeadlinePresets,
    display: labDisplayPreset,
    label: labLabelPreset,
  },
  display: labDisplayRole,
  headline: {
    blockTitle: labHeadlineBlockTitle,
    blockTitleAlt: labHeadlineBlockTitleAlt,
  },
  text: {
    body: labTextBody,
    bodyLead: labTextBodyLead,
    bodyMedium: labTextBodyMedium,
    subtitle: labTextSubtitle,
    subtitleAlt: labTextSubtitleAlt,
    caption: labTextCaption,
  },
  label: { eyebrow: labLabelEyebrow },
  style: {
    textStackedMediaBody: labStyleTextStackedMediaBody,
    headlineBlockH2: labStyleHeadlineBlockH2,
    headlineVariantRail: labStyleHeadlineVariantRail,
    headlineAltProminent: labStyleHeadlineAltProminent,
    headlineAltDefault: labStyleHeadlineAltDefault,
    textSubtitleTokenH5: labStyleTextSubtitleTokenH5,
    textProminentLabelM: labStyleTextProminentLabelM,
    textInteractiveLink: labStyleTextInteractiveLink,
    navDense: labStyleNavDense,
    labPageTitle: labStyleLabPageTitle,
    labPageMeta: labStyleLabPageMeta,
    labBackLink: labStyleLabBackLink,
    textDenseList: labStyleTextDenseList,
    editorialTitleWeight: labStyleEditorialTitleWeight,
  },
} as const

/** Overlay / on-image cards — use semantic local tokens where defined */
export const LAB_OVERLAY_TEXT = {
  title: {
    fontSize: LAB_TYPOGRAPHY_VARS.h5,
    fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
    color: 'var(--local-color-text-on-overlay)',
    lineHeight: LINE_HEIGHT_BODY,
  } satisfies CSSProperties,
  description: {
    fontSize: LAB_TYPOGRAPHY_VARS.labelS,
    fontWeight: LAB_TYPOGRAPHY_VARS.weightLow,
    color: 'var(--local-color-text-on-overlay-subtle)',
    lineHeight: LINE_HEIGHT_BODY,
  } satisfies CSSProperties,
} as const

/** Card grid colour-card title/description per card size (plain `<p>`). */
export const labCardGridTypography = {
  large: {
    titleFontSize: LAB_TYPOGRAPHY_VARS.h2,
    titleWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
    descFontSize: LAB_TYPOGRAPHY_VARS.labelM,
  },
  medium: {
    titleFontSize: LAB_TYPOGRAPHY_VARS.h4,
    titleWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
    descFontSize: LAB_TYPOGRAPHY_VARS.labelS,
  },
  small: {
    titleFontSize: LAB_TYPOGRAPHY_VARS.h5,
    titleWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
    descFontSize: LAB_TYPOGRAPHY_VARS.labelS,
  },
} as const

/** Text-on-image card sizes (plain `<p>`). */
export const labTextOnImageCardTypography = {
  large: {
    title: LAB_TYPOGRAPHY_VARS.h4,
    desc: LAB_TYPOGRAPHY_VARS.labelM,
  },
  medium: {
    title: LAB_TYPOGRAPHY_VARS.h5,
    desc: LAB_TYPOGRAPHY_VARS.labelS,
  },
  small: {
    title: LAB_TYPOGRAPHY_VARS.labelM,
    desc: LAB_TYPOGRAPHY_VARS.labelS,
  },
} as const

/** Lab MediaCard grid layout typography */
export const labMediaCardGridTypography = {
  large: { title: LAB_TYPOGRAPHY_VARS.h4, desc: LAB_TYPOGRAPHY_VARS.labelM },
  medium: { title: LAB_TYPOGRAPHY_VARS.h5, desc: LAB_TYPOGRAPHY_VARS.labelS },
  small: { title: LAB_TYPOGRAPHY_VARS.labelL, desc: LAB_TYPOGRAPHY_VARS.labelS },
} as const

/** Hero centred headline CSS sizes (responsive string vars). */
export const labHeroHeadlineSizes = {
  mobile: LAB_TYPOGRAPHY_VARS.h3,
  tablet: LAB_TYPOGRAPHY_VARS.h2,
  desktop: LAB_TYPOGRAPHY_VARS.h1,
} as const

export function labHeroEyebrowStyle(isMobile: boolean): CSSProperties {
  return {
    marginBottom: 'var(--ds-spacing-m)',
    fontSize: isMobile ? LAB_TYPOGRAPHY_VARS.labelS : LAB_TYPOGRAPHY_VARS.headlineXs,
    lineHeight: 1.5,
  }
}

export function labHeroBodyStyle(isMobile: boolean): CSSProperties {
  return {
    fontSize: isMobile ? LAB_TYPOGRAPHY_VARS.labelS : LAB_TYPOGRAPHY_VARS.headlineXs,
    lineHeight: 1.5,
  }
}
