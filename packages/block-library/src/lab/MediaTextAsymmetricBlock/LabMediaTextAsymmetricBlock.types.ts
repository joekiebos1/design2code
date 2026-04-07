import type {
  MediaTextAsymmetricEmphasis,
  MediaTextAsymmetricFaqItem,
  MediaTextAsymmetricLinkItem,
  MediaTextAsymmetricSize,
  MediaTextAsymmetricAppearance,
} from '../../shared/media-text-asymmetric-shared.types'
/** Lab-only `_type` is `labMediaTextAsymmetric`; `variant` selects pattern. */
export type LabMediaTextAsymmetricVariant = 'paragraphs' | 'faq' | 'links' | 'image'

export type LabMediaTextAsymmetricImageAspectRatio = '5:4' | '1:1' | '4:5'

export type LabMediaTextAsymmetricParagraphLayout = 'single' | 'multi'

export type LabMediaTextAsymmetricParagraphRow = {
  _key?: string
  title?: string | null
  body?: string | null
  linkText?: string | null
  linkUrl?: string | null
}

export type LabMediaTextAsymmetricItem = MediaTextAsymmetricFaqItem | MediaTextAsymmetricLinkItem

export type LabMediaTextAsymmetricBlockProps = {
  blockTitle?: string | null
  variant?: LabMediaTextAsymmetricVariant
  /** Lab paragraphs only. Omitted or `multi` uses section rows; production legacy maps here as multi. */
  paragraphLayout?: LabMediaTextAsymmetricParagraphLayout | null
  singleColumnBody?: string | null
  paragraphRows?: LabMediaTextAsymmetricParagraphRow[] | null
  items?: LabMediaTextAsymmetricItem[] | null
  mainImageSrc?: string | null
  imageAspectRatio?: LabMediaTextAsymmetricImageAspectRatio | null
  imageAlt?: string | null
  size?: MediaTextAsymmetricSize
  emphasis?: MediaTextAsymmetricEmphasis
  minimalBackgroundStyle?: 'block' | 'gradient' | null
  appearance?: MediaTextAsymmetricAppearance
  spacingTop?: 'none' | 'medium' | 'large'
  spacingBottom?: 'none' | 'medium' | 'large'
  openLinksInNewTab?: boolean
}
