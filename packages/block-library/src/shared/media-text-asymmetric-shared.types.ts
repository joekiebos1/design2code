/**
 * Shared TypeScript shapes for Media + Text Asymmetric FAQ / links / text-list items
 * and surface props. Used by Lab and Production block components.
 *
 * Lab leads behaviour and schema experiments; production catches up on promotion.
 * Keep these aligned with Sanity `mediaTextAsymmetricItem` and block colour fields.
 * Do not import `app/blocks/**` from Lab — import from this file instead.
 */

export type MediaTextAsymmetricEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'
export type MediaTextAsymmetricAppearance = 'primary' | 'secondary' | 'sparkle' | 'neutral'

/** @deprecated Use MediaTextAsymmetricAppearance */
export type MediaTextAsymmetricSurfaceColour = MediaTextAsymmetricAppearance
export type MediaTextAsymmetricSize = 'hero' | 'feature' | 'editorial'

export type MediaTextAsymmetricTextItem = {
  title?: string | null
  body?: string | null
  linkText?: string | null
  linkUrl?: string | null
}

export type MediaTextAsymmetricFaqItem = {
  title?: string | null
  body?: string | null
}

export type MediaTextAsymmetricLinkItem = {
  subtitle?: string | null
  linkUrl?: string | null
}

export type MediaTextAsymmetricItem =
  | MediaTextAsymmetricTextItem
  | MediaTextAsymmetricFaqItem
  | MediaTextAsymmetricLinkItem
