/**
 * Shared Card library for blocks.
 * Use these cards instead of DS Card for CardGridBlock and CarouselBlock.
 *
 * - MediaCard: media + text, no background. Layout: compact or large. Used in grid and carousel.
 * - MediaCardContained: media + text with background container (light blue, padded). Optional style.
 * - TextOnColourCard: title, description, surface bold/subtle
 * - TextOnImageCard: image with gradient overlay, title, description
 */

export { MediaCard } from './MediaCard'
export { MediaCardContained } from './MediaCardContained'
export { TextOnColourCard } from './TextOnColourCard'
export { TextOnColourCardGrid } from './TextOnColourCardGrid'
export { TextOnImageCard } from './TextOnImageCard'

export type { MediaCardProps, MediaCardLayout } from './MediaCard'
export type { MediaCardContainedProps } from './MediaCardContained'
export type { TextOnColourCardProps, TextOnColourCardSize } from './TextOnColourCard'
export type { TextOnColourCardGridProps, TextOnColourCardGridBackground } from './TextOnColourCardGrid'
export type { TextOnImageCardProps } from './TextOnImageCard'

export type {
  CardMediaAspectRatio,
  CardSurface,
  MediaCardConfig,
  MediaCardContainedConfig,
  TextOnImageCardConfig,
} from './Card.types'
