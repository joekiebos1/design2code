import { defineArrayMember, defineType } from 'sanity'

export const labPageBuilderType = defineType({
  name: 'labPageBuilder',
  type: 'array',
  title: 'Lab blocks',
  description:
    'Lab: production Media + Text blocks (50/50, stacked) match main page builder; legacy lab 50/50 type still supported. Also: Card grid (lab), carousels, editorial, zoom, icon grid, proof points, lab asymmetric.',
  of: [
    defineArrayMember({ type: 'hero' }),
    defineArrayMember({ type: 'mediaTextStacked' }),
    defineArrayMember({ type: 'mediaText5050' }),
    defineArrayMember({ type: 'labMediaText5050' }),
    defineArrayMember({ type: 'labCardGrid' }),
    defineArrayMember({ type: 'labCarousel' }),
    defineArrayMember({ type: 'editorialBlock' }),
    defineArrayMember({ type: 'fullBleedVerticalCarousel' }),
    defineArrayMember({ type: 'rotatingMedia' }),
    defineArrayMember({ type: 'mediaZoomOutOnScroll' }),
    defineArrayMember({ type: 'iconGrid' }),
    defineArrayMember({ type: 'proofPoints' }),
    defineArrayMember({ type: 'labMediaTextAsymmetric' }),
  ],
})
