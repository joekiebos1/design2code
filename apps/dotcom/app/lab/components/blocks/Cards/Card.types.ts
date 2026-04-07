/**
 * Shared Card library types.
 * Used by CardGridBlock and CarouselBlock.
 *
 * Block-derived values go in config. Item data (title, image, etc.) stays as props.
 * The Block sets config; the Card stays presentational.
 */

export type CardMediaAspectRatio = '4/5' | '4/3' | '8/5' | '2/1'

export type CardSurface = 'subtle' | 'bold'

/** Card size from grid columns. Drives typography when in grid context. */
export type CardGridCardSize = 'large' | 'medium' | 'small'

/** Block-derived config for MediaCard. Block sets these values. */
export type MediaCardConfig = {
  layout: 'compact' | 'medium' | 'large'
  /** Card size from grid columns (1, 2, 3–4 cols). Smaller cards get smaller text. */
  cardSize?: CardGridCardSize
  /** For compact 4:5 and medium: computed height from carousel viewport (cqw-based). Set by CarouselBlock. */
  imageHeight4_5?: string
  /** For compact 8:5: same height as 4:5 so cards align. Set by CarouselBlock. */
  imageHeight8_5?: string
}

/** Block-derived config for MediaCardContained. Block sets these values. */
export type MediaCardContainedConfig = {
  aspectRatio?: CardMediaAspectRatio
}

/** Block-derived config for TextOnImageCard. Block sets these values. */
export type TextOnImageCardConfig = {
  aspectRatio?: CardMediaAspectRatio
  /** Card size from grid columns. Smaller cards get smaller text. */
  cardSize?: CardGridCardSize
}

/** Base props for cards with media */
export type CardMediaProps = {
  image?: string | null
  video?: string | null
  prefersReducedMotion: boolean
  aspectRatio?: CardMediaAspectRatio
}

/** Base props for cards with text */
export type CardTextProps = {
  title?: string | null
  description?: string | null
}

/** CTA handler - receives href, caller decides router.push vs window.location */
export type CardCtaHandler = (href: string) => void
