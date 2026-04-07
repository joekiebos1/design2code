export type MediaText5050Variant = 'paragraphs' | 'accordion' | 'singleParagraph' | 'multiParagraph'

/** @deprecated Merged into variant (singleParagraph / multiParagraph). Kept for production backward compat. */
export type MediaText5050ParagraphColumnLayout = 'single' | 'multi'

export type MediaText5050ImagePosition = 'left' | 'right'

export type MediaText5050HeadingAlignment = 'left' | 'center'

/** @deprecated Use MediaText5050HeadingAlignment */
export type MediaText5050BlockFramingAlignment = MediaText5050HeadingAlignment

export type MediaText5050Emphasis = 'ghost' | 'none' | 'minimal' | 'subtle' | 'bold'
export type MediaText5050Appearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

/** @deprecated Use MediaText5050Appearance */
export type MediaText5050SurfaceColour = MediaText5050Appearance

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
  /** Heading, description, and CTA row above the split. */
  headingAlignment?: MediaText5050HeadingAlignment
  /** @deprecated Use headingAlignment */
  blockFramingAlignment?: MediaText5050HeadingAlignment
  emphasis?: MediaText5050Emphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: MediaText5050Appearance
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
  imageState?: import('../../shared/image-slot-state').ImageSlotState | null
}
