import type {
  MediaTextAsymmetricEmphasis,
  MediaTextAsymmetricFaqItem,
  MediaTextAsymmetricLinkItem,
  MediaTextAsymmetricSize,
  MediaTextAsymmetricAppearance,
} from '../../shared/media-text-asymmetric-shared.types'
/** Lab-only `_type` is `labMediaTextAsymmetric`; `variant` selects pattern. */
export type MediaTextAsymmetricVariant = 'paragraphs' | 'faq' | 'links' | 'image'

export type MediaTextAsymmetricImageAspectRatio = '5:4' | '1:1' | '4:5'

export type MediaTextAsymmetricParagraphLayout = 'single' | 'multi'

export type MediaTextAsymmetricParagraphRow = {
  _key?: string
  title?: string | null
  body?: string | null
  linkText?: string | null
  linkUrl?: string | null
}

export type MediaTextAsymmetricItem = MediaTextAsymmetricFaqItem | MediaTextAsymmetricLinkItem

export type MediaTextAsymmetricBlockProps = {
  blockTitle?: string | null
  variant?: MediaTextAsymmetricVariant
  /** Lab paragraphs only. Omitted or `multi` uses section rows; production legacy maps here as multi. */
  paragraphLayout?: MediaTextAsymmetricParagraphLayout | null
  singleColumnBody?: string | null
  paragraphRows?: MediaTextAsymmetricParagraphRow[] | null
  items?: MediaTextAsymmetricItem[] | null
  mainImageSrc?: string | null
  imageAspectRatio?: MediaTextAsymmetricImageAspectRatio | null
  imageAlt?: string | null
  size?: MediaTextAsymmetricSize
  emphasis?: MediaTextAsymmetricEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: MediaTextAsymmetricAppearance
  spacingTop?: 'none' | 'medium' | 'large'
  spacingBottom?: 'none' | 'medium' | 'large'
  openLinksInNewTab?: boolean
}
