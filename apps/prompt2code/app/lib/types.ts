/**
 * Page brief types — matches the structured JSON schema from lib/shared/storytelling/product-pages.md
 */

export type PageTemplate = 'product-page' | 'jio-story'

export type PageType = 'campaign' | 'product-launch' | 'editorial' | 'category' | 'other'

export type RelatedPage = {
  title: string
  path: string
  relationship: string
}

export type SectionCTA = {
  label: string | null
  destination: string | null
  rationale: string | null
}

export type SectionCrossLink = {
  label: string
  destination: string
  rationale: string
}

export type ContentSlots = {
  headline: string | null
  subhead: string | null
  body: string | null
  eyebrow?: string | null
  /** CTA object from API, or legacy string */
  cta: SectionCTA | string | null
  /** Secondary CTA (Hero only) */
  cta2?: SectionCTA | null
  mediaType: 'image' | 'video' | 'none' | null
  items: unknown[] | null
}

/** Art Director: lifestyle | product | abstract */
export type ImageIntent = 'lifestyle' | 'product' | 'abstract'

/** Block-level options content managers can set per block. */
export type BlockOptions = {
  contentLayout?: 'stacked' | 'sideBySide' | 'category' | 'mediaOverlay' | 'textOnly' | 'fullscreen' | null
  containerLayout?: 'edgeToEdge' | 'contained' | null
  imageAnchor?: 'center' | 'bottom' | null
  textAlign?: 'left' | 'center' | null
  emphasis?: 'ghost' | 'minimal' | 'subtle' | 'bold' | null
  appearance?: 'primary' | 'secondary' | 'sparkle' | 'neutral' | null
  /** @deprecated Use appearance */
  surfaceColour?: 'primary' | 'secondary' | 'sparkle' | 'neutral' | null
  theme?: string | null
  variant?: string | null
  size?: 'hero' | 'feature' | 'editorial' | null
  template?: 'textOnly' | 'stacked' | 'overlay' | null
  alignment?: 'left' | 'center'
  mediaSize?: 'edgeToEdge' | 'default'
  imagePosition?: 'left' | 'right' | null
  mediaStyle?: 'contained' | 'overflow' | null
  imageAspectRatio?: string | null
  stackImagePosition?: 'top' | 'bottom' | null
  paragraphColumnLayout?: 'single' | 'multi' | null
  cardSize?: 'compact' | 'medium' | 'large' | null
  columns?: 2 | 3 | 4 | null
  descriptionTitle?: string | null
  descriptionBody?: string | null
}

export type Section = {
  order: number
  sectionName: string
  component: string
  rationale: string
  narrativeRole: string
  contentSlots: ContentSlots
  blockOptions?: BlockOptions | null
  crossLinks?: SectionCrossLink[] | null
  flags: string[]
  /** Architect: description of ideal visual for this block. */
  imageBrief?: string | null
  /** Art Director: lifestyle | product | abstract */
  imageIntent?: ImageIntent | null
}

export type PageBriefMeta = {
  pageName: string
  pageType: PageType
  slug: string
  intent: string
  audience: string
  primaryAction: string
  keyMessage: string
  template?: PageTemplate
}

export type PageBriefIA = {
  proposedPath: string
  parentSection: string
  relatedPages: RelatedPage[]
  existingConflicts: string[]
}

export type PageBrief = {
  meta: PageBriefMeta
  ia: PageBriefIA
  sections: Section[]
  launchChecklist: string[]
  status: 'draft' | 'approved'
  createdAt: string
  version: number
}

export type IntentFormData = {
  template: PageTemplate
  /** Product or story title. */
  product: string
  pageType: PageType
  /** What the page should accomplish; who it's for. Or story angle + evidence for Jio Stories. */
  intent: string
  audience: string
  primaryAction: string
  keyMessage: string
  /** URL path (e.g. /products/jiosaavn or /stories/...) */
  pagePath: string
  briefContent?: string
}
