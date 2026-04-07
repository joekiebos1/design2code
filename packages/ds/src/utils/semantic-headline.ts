/**
 * Semantic headline size mapping.
 * Use fixed DS typography tokens (var(--ds-typography-*)) — tokens come from ds-tokens / generated CSS.
 */
export type HeadingLevel = 'h2' | 'h3' | 'h4'

const VALID_LEVELS: HeadingLevel[] = ['h2', 'h3', 'h4']

/** Sanitize heading level – strips invisible Unicode, ensures valid element name for createElement */
export function normalizeHeadingLevel(level: unknown): HeadingLevel {
  const s = typeof level === 'string'
    ? level.replace(/[\u200B-\u200D\uFEFF\u2060\u00AD\u034F\u061C\u115F-\u1160\u17B4-\u17B5\u180E\u3164]/g, '').trim().toLowerCase()
    : ''
  return VALID_LEVELS.includes(s as HeadingLevel) ? (s as HeadingLevel) : 'h2'
}

/** DS Headline size prop - H2 largest, H4 smallest. Valid DS sizes: L | M | S only. */
export const HEADLINE_SIZE_BY_LEVEL: Record<HeadingLevel, 'L' | 'M' | 'S'> = {
  h2: 'L',
  h3: 'M',
  h4: 'S',
}

export function getHeadlineSize(level: HeadingLevel): 'L' | 'M' | 'S' {
  return HEADLINE_SIZE_BY_LEVEL[level]
}

/** Child level (one step down): h2→h3, h3→h4, h4→h4 */
export function getChildLevel(level: HeadingLevel): HeadingLevel {
  return level === 'h2' ? 'h3' : level === 'h3' ? 'h4' : 'h4'
}

/** Fixed DS typography tokens. Use these instead of helper functions. */
export const TYPOGRAPHY = {
  h1: 'var(--ds-typography-h1)',
  h2: 'var(--ds-typography-h2)',
  h3: 'var(--ds-typography-h3)',
  h4: 'var(--ds-typography-h4)',
  h5: 'var(--ds-typography-h5)',
  labelM: 'var(--ds-typography-label-m)',
} as const

/** Subhead typography: standardised across HeroBlock, MediaTextBlock, lab variants */
export const SUBHEAD_STYLE = {
  fontSize: TYPOGRAPHY.h5,
  fontWeight: 'var(--ds-typography-weight-medium)',
} as const

/** Hero body copy typography: reference = side-by-side edge-to-edge. Use for all Hero variants. */
export const HERO_BODY_STYLE = {
  fontSize: 'var(--ds-typography-headline-xs)',
  fontWeight: 'var(--ds-typography-weight-low)',
  lineHeight: 1.5,
} as const

/** Media text block subtitle + body: matches carousel card (Nano Banana section). Use for MediaTextBlock subhead/body and MediaText5050Block subtitles/body. */
export const MEDIA_TEXT_SUBTITLE_BODY_STYLE = {
  subtitle: {
    fontSize: 'var(--ds-typography-h5)',
    fontWeight: 'var(--ds-typography-weight-medium)',
    lineHeight: 1.4,
  } as const,
  body: {
    fontSize: 'var(--ds-typography-label-s)',
    fontWeight: 'var(--ds-typography-weight-low)',
    lineHeight: 1.4,
  } as const,
  gap: 'var(--ds-spacing-m)' as const,
  paddingRight: 'var(--ds-spacing-l)' as const,
} as const
