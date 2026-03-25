/**
 * Lab block framing — shared typography for optional section title, description, and CTAs.
 * Spacing between framing and main content stays per-block; adjust tokens here for global tweaks.
 */

import type { CSSProperties } from 'react'
import { LAB_TYPOGRAPHY_VARS } from '../typography/block-typography'
import { labHeadlinePresets, labTextPresets } from '../typography/lab-typography-presets'

export type LabBlockCallToAction = {
  _key?: string
  label: string
  link?: string | null
  style?: 'filled' | 'outlined' | null
}

/** DS `Headline` props for section titles (centre-aligned blocks). */
export const labBlockFramingHeadlineProps = {
  ...labHeadlinePresets.block,
}

/** Inline styles added to section `Headline` (font size follows lab carousel / card grid scale). */
export function labBlockFramingTitleStyle(isMobile: boolean): CSSProperties {
  return {
    margin: 0,
    whiteSpace: 'pre-line',
    fontSize: isMobile ? LAB_TYPOGRAPHY_VARS.h3 : LAB_TYPOGRAPHY_VARS.h2,
  }
}

/** DS `Text` props for section description under the title. */
export const labBlockFramingDescriptionTextProps = {
  ...labTextPresets.framingIntro,
}

export const labBlockFramingDescriptionStyle: CSSProperties = {
  margin: 0,
  whiteSpace: 'pre-line',
}

/** Vertical stack between title, description, and CTA row (starting point; blocks may override). */
export const labBlockFramingIntroStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--ds-spacing-m)',
  width: '100%',
}

/** Space between framing stack and main block content (starting point). */
export const labBlockFramingToContentGap = 'var(--ds-spacing-3xl)'
