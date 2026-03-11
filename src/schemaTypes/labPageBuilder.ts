import { defineArrayMember, defineType } from 'sanity'

export const labPageBuilderType = defineType({
  name: 'labPageBuilder',
  type: 'array',
  title: 'Lab blocks',
  description:
    'Add blocks for the Lab page. Production blocks: Hero, Media text, Card grid, Carousel, Proof points, Icon grid. Lab blocks: Grid block card, Full bleed vertical carousel, Rotating media, Media zoom out on scroll.',
  of: [
    defineArrayMember({ type: 'hero' }),
    defineArrayMember({ type: 'mediaTextBlock' }),
    defineArrayMember({ type: 'mediaText5050' }),
    defineArrayMember({ type: 'cardGrid' }),
    defineArrayMember({ type: 'labGridBlockCard' }),
    defineArrayMember({ type: 'carousel' }),
    defineArrayMember({ type: 'fullBleedVerticalCarousel' }),
    defineArrayMember({ type: 'rotatingMedia' }),
    defineArrayMember({ type: 'mediaZoomOutOnScroll' }),
    defineArrayMember({ type: 'iconGrid' }),
    defineArrayMember({ type: 'proofPoints' }),
    defineArrayMember({ type: 'list' }),
  ],
})
