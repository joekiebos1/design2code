/**
 * Shared Card library types.
 * Used by CardGridBlock and CarouselBlock.
 *
 * Block-derived values go in config. Item data (title, image, etc.) stays as props.
 * The Block sets config; the Card stays presentational.
 */

export type CardMediaAspectRatio = '4/5' | '4/3' | '8/5' | '2/1'

export type CardSurface = 'subtle' | 'bold'

/** Block-derived config for MediaCard. Block sets these values. */
export type MediaCardConfig = {
  layout: 'compact' | 'large' | 'large-4x5'
  /** For compact 4:5 and large-4x5: computed height from carousel viewport (cqw-based). Set by CarouselBlock. */
  imageHeight4_5?: string
}

/** Block-derived config for MediaCardContained. Block sets these values. */
export type MediaCardContainedConfig = {
  aspectRatio?: CardMediaAspectRatio
}

/** Block-derived config for TextOnImageCard. Block sets these values. */
export type TextOnImageCardConfig = {
  aspectRatio?: CardMediaAspectRatio
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
