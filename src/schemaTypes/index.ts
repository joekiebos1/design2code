import { pageType } from './page'
import { labBlockPageType } from './labBlockPage'
import { labOverviewType } from './labOverview'
import { pageBuilderType } from './pageBuilder'
import { labPageBuilderType } from './labPageBuilder'
import { heroBlock } from './blocks/hero'
import { mediaTextStackedBlock } from './blocks/mediaTextStacked'
import { cardGridBlock, cardGridItem } from './blocks/cardGrid'
import { textOnColourCardItem } from './blocks/textOnColourCardItem'
import {
  fullBleedVerticalCarouselBlock,
  fullBleedVerticalCarouselItem,
} from './blocks/fullBleedVerticalCarousel'
import { cardBlock, cardItem } from './blocks/cardBlock'
import { carouselBlock } from './blocks/carousel'
import { proofPointsBlock } from './blocks/proofPoints'
import { rotatingMediaBlock, rotatingMediaItem } from './blocks/rotatingMedia'
import { labCardItem } from './blocks/labCardItem'
import { labCarouselBlock } from './blocks/labCarousel'
import { editorialBlock } from './blocks/editorialBlock'
import { labCardGridBlock } from './blocks/labCardGrid'
import { mediaZoomOutOnScrollBlock } from './blocks/mediaZoomOutOnScroll'
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
import {
  labMediaText5050AccordionItem,
  labMediaText5050Block,
  labMediaText5050ParagraphItem,
} from './blocks/labMediaText5050'
import {
  labMediaTextAsymmetricParagraphRow,
  labMediaTextAsymmetricBlock,
} from './blocks/labMediaTextAsymmetricBlock'

/** Block types must be registered before pageBuilder / labPageBuilder (which reference them in of array) */
export const schemaTypes = [
  pageType,
  labPageBuilderType,
  labBlockPageType,
  labOverviewType,
  heroBlock,
  mediaTextStackedBlock,
  cardGridItem,
  cardGridBlock,
  textOnColourCardItem,
  fullBleedVerticalCarouselItem,
  fullBleedVerticalCarouselBlock,
  cardItem,
  cardBlock,
  carouselBlock,
  proofPointsBlock,
  rotatingMediaItem,
  rotatingMediaBlock,
  labCardItem,
  labCarouselBlock,
  editorialBlock,
  labCardGridBlock,
  mediaZoomOutOnScrollBlock,
  iconGridItem,
  iconGridBlock,
  mediaTextAsymmetricParagraph,
  mediaTextAsymmetricParagraphRow,
  mediaTextAsymmetricItem,
  labMediaTextAsymmetricParagraphRow,
  labMediaTextAsymmetricBlock,
  mediaTextAsymmetricBlock,
  mediaText5050Item,
  mediaText5050AccordionItem,
  mediaText5050Block,
  labMediaText5050ParagraphItem,
  labMediaText5050AccordionItem,
  labMediaText5050Block,
  pageBuilderType,
]
