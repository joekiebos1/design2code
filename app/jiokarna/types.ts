/**
 * Page brief types — matches the structured JSON schema from cursorrules.md
 */

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
  /** CTA object from API, or legacy string */
  cta: SectionCTA | string | null
  mediaType: 'image' | 'video' | 'none' | null
  items: unknown[] | null
}

/** Block-level options content managers can set per block. */
export type BlockOptions = {
  blockSurface?: 'ghost' | 'minimal' | 'subtle' | 'bold' | null
  blockAccent?: 'primary' | 'secondary' | 'neutral' | null
  variant?: string | null
  size?: 'hero' | 'feature' | 'editorial' | null
  template?: 'SideBySide' | 'HeroOverlay' | 'Stacked' | 'TextOnly' | null
  imagePosition?: 'left' | 'right' | null
  mediaStyle?: 'contained' | 'overflow' | null
  imageAspectRatio?: string | null
  cardSize?: 'compact' | 'medium' | 'large' | null
  columns?: 2 | 3 | 4 | null
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
}

export type PageBriefMeta = {
  pageName: string
  pageType: PageType
  slug: string
  intent: string
  audience: string
  primaryAction: string
  keyMessage: string
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
  pageName: string
  pageType: PageType
  intent: string
  briefContent?: string
}
