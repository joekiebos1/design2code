/**
 * Block Library
 *
 * Central registry of page blocks. All blocks use DS tokens for styling.
 * Add new blocks here and in the Sanity schema.
 */

export { HeroBlock } from './HeroBlock'
export { MediaTextBlock } from './MediaTextBlock'
export { MediaText5050Block } from './MediaText5050Block/MediaText5050Block'
export { CardGridBlock } from './CardGridBlock/CardGridBlock'
export type { MediaTextBlockProps } from './MediaTextBlock'
export type { MediaText5050BlockProps } from './MediaText5050Block/MediaText5050Block.types'
export { CarouselBlock } from './CarouselBlock'
export { ProofPointsBlock } from './ProofPointsBlock'
export { IconGridBlock } from './IconGridBlock/IconGridBlock'
export { ListBlock } from './ListBlock/ListBlock'
export { BlockContainer } from './BlockContainer'

export const BLOCK_REGISTRY = {
  hero: 'HeroBlock',
  mediaTextBlock: 'MediaTextBlock',
  mediaText5050: 'MediaText5050Block',
  cardGrid: 'CardGridBlock',
  carousel: 'CarouselBlock',
  proofPoints: 'ProofPointsBlock',
  iconGrid: 'IconGridBlock',
  listBlock: 'ListBlock',
} as const

export type BlockType = keyof typeof BLOCK_REGISTRY
