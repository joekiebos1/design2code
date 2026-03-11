export type MediaText5050Variant = 'paragraphs' | 'accordion'

export type MediaText5050ImagePosition = 'left' | 'right'

export type BlockBackgroundMode = 'ghost' | 'none' | 'minimal' | 'subtle' | 'bold'
export type BlockAccent = 'primary' | 'secondary' | 'neutral'

export interface MediaText5050Media {
  type: 'image' | 'video'
  src: string
  alt?: string
  poster?: string
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:4' | '2:1' | 'auto'
}

export interface MediaText5050Item {
  subtitle?: string
  body?: string
}

export interface MediaText5050BlockProps {
  variant: MediaText5050Variant
  imagePosition?: MediaText5050ImagePosition
  blockBackground?: BlockBackgroundMode
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  blockAccent?: BlockAccent
  spacingTop?: 'none' | 'medium' | 'large'
  spacingBottom?: 'none' | 'medium' | 'large'
  /** Block-level heading above all content */
  headline?: string
  /** Unified items array – both variants use subtitle + body */
  items?: MediaText5050Item[]
  media?: MediaText5050Media
  /** JioKarna preview: progressive image stream slot and state */
  imageSlot?: string | null
  imageState?: import('../../hooks/useImageStream').ImageSlotState | null
}
