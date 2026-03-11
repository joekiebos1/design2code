import { pageType } from './page'
import { labBlockPageType } from './labBlockPage'
import { labOverviewType } from './labOverview'
import { pageBuilderType } from './pageBuilder'
import { labPageBuilderType } from './labPageBuilder'
import { heroBlock } from './blocks/hero'
import { mediaTextBlock } from './blocks/mediaTextBlock'
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
import { labGridBlockCardBlock, labGridBlockCardItem } from './blocks/labGridBlockCard'
import { mediaZoomOutOnScrollBlock } from './blocks/mediaZoomOutOnScroll'
import { iconGridBlock, iconGridItem } from './blocks/iconGrid'
import { listBlock, listItem } from './blocks/listBlock'
import {
  mediaText5050Block,
  mediaText5050Item,
} from './blocks/mediaText5050'

/** Block types must be registered before pageBuilder / labPageBuilder (which reference them in of array) */
export const schemaTypes = [
  pageType,
  labPageBuilderType,
  labBlockPageType,
  labOverviewType,
  heroBlock,
  mediaTextBlock,
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
  labGridBlockCardItem,
  labGridBlockCardBlock,
  mediaZoomOutOnScrollBlock,
  iconGridItem,
  iconGridBlock,
  listItem,
  listBlock,
  mediaText5050Item,
  mediaText5050Block,
  pageBuilderType,
]
