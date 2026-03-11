export type MediaTextBlockSize = 'hero' | 'feature' | 'editorial'

export type MediaTextBlockVariant =
  | 'text-only'
  | 'centered-media-below'
  | 'full-bleed'

export type MediaTextBlockWidth = 'XS' | 'S' | 'M' | 'Default' | 'Wide' | 'edgeToEdge'
export type MediaTextBlockAlign = 'left' | 'center'
export type MediaTextBlockMediaStyle = 'contained' | 'overflow'
export type MediaTextBlockSpacing = 'none' | 'medium' | 'large'

export type MediaTextBlockAspectRatio = '16:9' | '4:3' | '1:1' | '3:4' | '2:1' | 'auto'
/** Block emphasis: content author chooses this; DS components adapt automatically. */
export type BlockBackgroundMode = 'ghost' | 'none' | 'minimal' | 'subtle' | 'bold'
/** Block accent/colour theme: primary, secondary, neutral. DS appearance tokens. */
export type BlockAccent = 'primary' | 'secondary' | 'neutral'

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

export type MediaTextBlockStackImagePosition = 'top' | 'bottom'

export interface MediaTextBlockProps {
  size?: MediaTextBlockSize
  variant?: MediaTextBlockVariant
  /** For Stacked: image on top or bottom. When top, title renders as subtitle (smaller, lighter). */
  stackImagePosition?: MediaTextBlockStackImagePosition
  width?: MediaTextBlockWidth
  mediaStyle?: MediaTextBlockMediaStyle
  blockBackground?: BlockBackgroundMode
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  blockAccent?: BlockAccent
  spacing?: MediaTextBlockSpacing
  spacingTop?: MediaTextBlockSpacing
  spacingBottom?: MediaTextBlockSpacing
  align?: MediaTextBlockAlign
  eyebrow?: string
  headline: string
  subhead?: string
  body?: string
  bulletList?: string[]
  cta?: MediaTextBlockCTA
  ctaSecondary?: MediaTextBlockCTA
  media?: MediaTextBlockMedia
  /** JioKarna preview: progressive image stream slot and state. */
  imageSlot?: string | null
  imageState?: import('../../hooks/useImageStream').ImageSlotState | null
}
