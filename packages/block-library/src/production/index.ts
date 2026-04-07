/**
 * Block Library
 *
 * Central registry of page blocks. All blocks use DS tokens for styling.
 * Add new blocks here and in the Sanity schema.
 */

export { HeroBlock } from './HeroBlock'
export { MediaTextBlock } from './MediaTextBlock/MediaTextBlock'
export type { MediaTextBlockProps } from './MediaTextBlock/MediaTextBlock.types'
export { MediaText5050Block } from './MediaText5050Block/MediaText5050Block'
export type { MediaText5050BlockProps } from './MediaText5050Block/MediaText5050Block.types'
export { CardGridBlock } from './CardGridBlock/CardGridBlock'
export type {
  BlockInteraction,
  CardGridBlockItem,
  CardGridItem,
} from './CardGridBlock/CardGridBlock.types'
export { CarouselBlock } from './CarouselBlock'
export { ProofPointsBlock } from './ProofPointsBlock'
export { IconGridBlock } from './IconGridBlock/IconGridBlock'
export { MediaTextAsymmetricBlock } from './MediaTextAsymmetricBlock/MediaTextAsymmetricBlock'
export type { MediaTextAsymmetricBlockProps } from './MediaTextAsymmetricBlock/MediaTextAsymmetricBlock.types'
export { WidthCap } from './WidthCap'
export type { ContentWidth } from './WidthCap'
export { SPACING_VAR } from './WidthCap'
export { BlockShell } from './BlockShell'
export type { BlockPattern, BlockSpacing } from './BlockShell'

export const BLOCK_REGISTRY = {
  hero: 'HeroBlock',
  mediaTextStacked: 'MediaTextBlock',
  mediaTextBlock: 'MediaTextBlock',
  mediaText5050: 'MediaText5050Block',
  cardGrid: 'CardGridBlock',
  carousel: 'CarouselBlock',
  proofPoints: 'ProofPointsBlock',
  iconGrid: 'IconGridBlock',
  mediaTextAsymmetric: 'MediaTextAsymmetricBlock',
} as const

export type BlockType = keyof typeof BLOCK_REGISTRY
