'use client'

/**
 * Lab entry for Hero — delegates to production `HeroBlock` after promotion.
 * Edit `app/blocks/HeroBlock.tsx` for behaviour; extend here only for lab-only experiments.
 */

export {
  HeroBlock as LabHeroBlock,
  type HeroBlockProps as LabHeroBlockProps,
  type HeroContentLayout as LabHeroContentLayout,
  type HeroContainerLayout as LabHeroContainerLayout,
  type HeroImageAnchor as LabHeroImageAnchor,
  type HeroTextAlign as LabHeroTextAlign,
  type HeroEmphasis as LabHeroEmphasis,
  type HeroSurfaceColour as LabHeroSurfaceColour,
} from '../../../blocks/HeroBlock'
