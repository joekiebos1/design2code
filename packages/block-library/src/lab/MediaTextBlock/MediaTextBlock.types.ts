export type MediaTextBlockSize = 'hero' | 'feature' | 'editorial'

export type MediaTextBlockVariant =
  | 'text-only'
  | 'centered-media-below'
  | 'full-bleed'

export type MediaTextBlockWidth = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'edgeToEdge'
export type MediaTextBlockAlign = 'left' | 'center'
export type MediaTextBlockMediaStyle = 'contained' | 'overflow'
export type MediaTextBlockSpacing = 'none' | 'medium' | 'large'

export type MediaTextBlockAspectRatio = '16:9' | '4:3' | '1:1' | '3:4' | '2:1' | 'auto'
/** Block emphasis: content author chooses this; DS components adapt automatically. */
export type MediaTextBlockEmphasis = 'ghost' | 'none' | 'minimal' | 'subtle' | 'bold'
/** Surface colour: primary, secondary, sparkle, neutral. DS appearance tokens. */
export type MediaTextBlockAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

/** @deprecated Use MediaTextBlockAppearance */
export type MediaTextBlockSurfaceColour = MediaTextBlockAppearance

export interface MediaTextBlockMedia {
  type: 'image' | 'video'
  src: string
  alt?: string
  poster?: string
  aspectRatio?: MediaTextBlockAspectRatio
}

export interface MediaTextBlockCTA {
  label: string
  href: string
  appearance?: 'primary' | 'secondary' | 'ghost'
}

export interface MediaTextStackedBlockProps {
  size?: MediaTextBlockSize
  variant?: MediaTextBlockVariant
  width?: MediaTextBlockWidth
  mediaStyle?: MediaTextBlockMediaStyle
  emphasis?: MediaTextBlockEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: MediaTextBlockAppearance
  spacing?: MediaTextBlockSpacing
  spacingTop?: MediaTextBlockSpacing
  spacingBottom?: MediaTextBlockSpacing
  align?: MediaTextBlockAlign
  eyebrow?: string
  headline: string
  subhead?: string
  body?: string
  /** Image description (below image): title + body, card-style typography. */
  descriptionTitle?: string
  descriptionBody?: string
  cta?: MediaTextBlockCTA
  ctaSecondary?: MediaTextBlockCTA
  media?: MediaTextBlockMedia
  /** JioKarna preview: progressive image stream slot and state. */
  imageSlot?: string | null
  imageState?: import('../../shared/image-slot-state').ImageSlotState | null
}
