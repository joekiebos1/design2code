import { pageType } from './page'
import { pageBuilderType } from './pageBuilder'
import { heroBlock } from './blocks/hero'
import { mediaTextBlock } from './blocks/mediaTextBlock'
import { cardGridBlock, cardGridItem } from './blocks/cardGrid'
import {
  fullBleedVerticalCarouselBlock,
  fullBleedVerticalCarouselItem,
} from './blocks/fullBleedVerticalCarousel'
import { cardBlock, cardItem } from './blocks/cardBlock'
import { carouselBlock } from './blocks/carousel'
import { proofPointsBlock } from './blocks/proofPoints'
import { rotatingMediaBlock, rotatingMediaItem } from './blocks/rotatingMedia'

export const schemaTypes = [
  pageType,
  pageBuilderType,
  heroBlock,
  mediaTextBlock,
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
]
