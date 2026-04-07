import { pageType } from './page'
import { figmaDesignType } from './figmaDesign'
import { labBlockPageType } from './labBlockPage'
import { labOverviewType } from './labOverview'
import { pageBuilderType } from './pageBuilder'
import { labPageBuilderType } from './labPageBuilder'

// Production block schemas
import { heroBlock } from './blocks/hero'
import { mediaTextStackedBlock } from './blocks/mediaTextStacked'
import { cardGridBlock, cardGridItem } from './blocks/cardGrid'
import {
  fullBleedVerticalCarouselBlock,
  fullBleedVerticalCarouselItem,
} from './blocks/fullBleedVerticalCarousel'
import { cardBlock, cardItem } from './blocks/cardBlock'
import { carouselBlock } from './blocks/carousel'
import { proofPointsBlock } from './blocks/proofPoints'
import { rotatingMediaBlock, rotatingMediaItem } from './blocks/rotatingMedia'
import { iconGridBlock, iconGridItem } from './blocks/iconGrid'
import {
  mediaTextAsymmetricBlock,
  mediaTextAsymmetricItem,
  mediaTextAsymmetricParagraph,
  mediaTextAsymmetricParagraphRow,
} from './blocks/mediaTextAsymmetricBlock'
import {
  mediaText5050AccordionItem,
  mediaText5050Block,
  mediaText5050Item,
} from './blocks/mediaText5050'

// Lab block schemas (full duplicates — lab can diverge independently)
import { labHeroBlock } from './blocks/labHero'
import { labMediaTextStackedBlock } from './blocks/labMediaTextStacked'
import { labCardItem } from './blocks/labCardItem'
import { labCarouselBlock } from './blocks/labCarousel'
import { labEditorialBlock } from './blocks/labEditorialBlock'
import { labCardGridBlock } from './blocks/labCardGrid'
import { labIconGridBlock, labIconGridItem } from './blocks/labIconGrid'
import { labProofPointsBlock } from './blocks/labProofPoints'
import {
  labFullBleedVerticalCarouselBlock,
  labFullBleedVerticalCarouselItem,
} from './blocks/labFullBleedVerticalCarousel'
import {
  labRotatingMediaBlock,
  labRotatingMediaItem,
} from './blocks/labRotatingMedia'
import { labMediaZoomOutOnScrollBlock } from './blocks/labMediaZoomOutOnScroll'
import {
  labMediaText5050AccordionItem,
  labMediaText5050Block,
  labMediaText5050ParagraphItem,
} from './blocks/labMediaText5050'
import {
  labMediaTextAsymmetricItem,
  labMediaTextAsymmetricParagraphRow,
  labMediaTextAsymmetricBlock,
} from './blocks/labMediaTextAsymmetricBlock'

// Legacy lab-only types (no production equivalent, kept for backward compat with existing documents)
import { editorialBlock as legacyEditorialBlock } from './blocks/editorialBlock'
import { mediaZoomOutOnScrollBlock as legacyZoomBlock } from './blocks/mediaZoomOutOnScroll'

/** Block types must be registered before pageBuilder / labPageBuilder (which reference them in of array) */
export const schemaTypes = [
  // Document types
  pageType,
  figmaDesignType,
  labBlockPageType,
  labOverviewType,

  // Production blocks
  heroBlock,
  mediaTextStackedBlock,
  cardGridItem,
  cardGridBlock,
  fullBleedVerticalCarouselItem,
  fullBleedVerticalCarouselBlock,
  cardItem,
  cardBlock,
  carouselBlock,
  proofPointsBlock,
  rotatingMediaItem,
  rotatingMediaBlock,
  iconGridItem,
  iconGridBlock,
  mediaTextAsymmetricParagraph,
  mediaTextAsymmetricParagraphRow,
  mediaTextAsymmetricItem,
  mediaTextAsymmetricBlock,
  mediaText5050Item,
  mediaText5050AccordionItem,
  mediaText5050Block,

  // Lab blocks (all lab-prefixed)
  labHeroBlock,
  labMediaTextStackedBlock,
  labCardItem,
  labCarouselBlock,
  labEditorialBlock,
  labCardGridBlock,
  labIconGridItem,
  labIconGridBlock,
  labProofPointsBlock,
  labFullBleedVerticalCarouselItem,
  labFullBleedVerticalCarouselBlock,
  labRotatingMediaItem,
  labRotatingMediaBlock,
  labMediaZoomOutOnScrollBlock,
  labMediaText5050ParagraphItem,
  labMediaText5050AccordionItem,
  labMediaText5050Block,
  labMediaTextAsymmetricItem,
  labMediaTextAsymmetricParagraphRow,
  labMediaTextAsymmetricBlock,

  // Legacy lab-only types (backward compat — not in labPageBuilder for new documents)
  legacyEditorialBlock,
  legacyZoomBlock,

  // Page builders (must come after block types)
  pageBuilderType,
  labPageBuilderType,
]
