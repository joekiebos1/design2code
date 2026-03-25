export type MediaText5050Variant = 'paragraphs' | 'accordion'

/** Paragraphs variant only: single = larger type for one section; multi = smaller stacked sections. */
export type MediaText5050ParagraphColumnLayout = 'single' | 'multi'

export type MediaText5050ImagePosition = 'left' | 'right'

/** Block title, description, and CTAs above the media + text row */
export type MediaText5050BlockFramingAlignment = 'left' | 'center'

export type MediaText5050Emphasis = 'ghost' | 'none' | 'minimal' | 'subtle' | 'bold'
export type MediaText5050SurfaceColour = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export interface MediaText5050Media {
  type: 'image' | 'video'
  src: string
  alt?: string
  poster?: string
  aspectRatio?: '5:4' | '1:1' | '4:5'
}

export interface MediaText5050Item {
  subtitle?: string
  body?: string
}

/** Accordion panel: text plus optional per-panel media (shared aspect ratio on block). */
export type MediaText5050AccordionRow = MediaText5050Item & {
  media?: MediaText5050Media
}

export type MediaText5050CallToAction = {
  _key?: string
  label: string
  link?: string | null
  style?: 'filled' | 'outlined' | null
}

export interface MediaText5050BlockProps {
  variant: MediaText5050Variant
  /** When variant is paragraphs; omitted or legacy docs infer from item count. */
  paragraphColumnLayout?: MediaText5050ParagraphColumnLayout
  imagePosition?: MediaText5050ImagePosition
  /** Title, description, and CTA row above the split; default left for legacy. */
  blockFramingAlignment?: MediaText5050BlockFramingAlignment
  emphasis?: MediaText5050Emphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  surfaceColour?: MediaText5050SurfaceColour
  spacingTop?: 'none' | 'medium' | 'large'
  spacingBottom?: 'none' | 'medium' | 'large'
  /** Block-level heading above all content */
  headline?: string
  /** Optional section copy below headline */
  description?: string | null
  /** Optional section buttons below description */
  callToActions?: MediaText5050CallToAction[] | null
  /** Paragraphs · multi */
  items?: MediaText5050Item[]
  /** Paragraphs · single (flat CMS fields) */
  singleSubtitle?: string
  singleBody?: string
  /** Accordion: per-panel media in media column */
  accordionItems?: MediaText5050AccordionRow[]
  media?: MediaText5050Media
  /** JioKarna preview: progressive image stream slot and state */
  imageSlot?: string | null
  imageState?: import('../../hooks/useImageStream').ImageSlotState | null
}
