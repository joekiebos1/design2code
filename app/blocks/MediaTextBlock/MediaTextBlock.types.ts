export type MediaTextBlockSize = 'hero' | 'feature' | 'editorial'

export type MediaTextBlockVariant =
  | 'media-right'
  | 'media-left'
  | 'text-only'
  | 'centered-media-below'
  | 'full-bleed'

export type MediaTextBlockWidth = 'XS' | 'S' | 'M' | 'Default' | 'Wide' | 'edgeToEdge'
export type MediaTextBlockAlign = 'left' | 'center'
export type MediaTextBlockMediaStyle = 'contained' | 'overflow'
export type MediaTextBlockSpacing = 'small' | 'medium' | 'large'

export type MediaTextBlockAspectRatio = '16:9' | '4:3' | '1:1' | '3:4' | 'auto'
/** Block emphasis: content author chooses this; DS components adapt automatically. */
export type BlockBackgroundMode = 'ghost' | 'none' | 'minimal' | 'subtle' | 'bold'

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

export interface MediaTextBlockProps {
  size?: MediaTextBlockSize
  variant?: MediaTextBlockVariant
  width?: MediaTextBlockWidth
  mediaStyle?: MediaTextBlockMediaStyle
  blockBackground?: BlockBackgroundMode
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
}
