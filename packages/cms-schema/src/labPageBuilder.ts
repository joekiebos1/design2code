import { defineArrayMember, defineType } from 'sanity'

export const labPageBuilderType = defineType({
  name: 'labPageBuilder',
  type: 'array',
  title: 'Lab blocks',
  description:
    'Lab page builder — all blocks use lab-prefixed schema types, independent from production.',
  of: [
    defineArrayMember({ type: 'labHero' }),
    defineArrayMember({ type: 'labMediaTextStacked' }),
    defineArrayMember({ type: 'labMediaText5050' }),
    defineArrayMember({ type: 'labCardGrid' }),
    defineArrayMember({ type: 'labCarousel' }),
    defineArrayMember({ type: 'labEditorialBlock' }),
    defineArrayMember({ type: 'labFullBleedVerticalCarousel' }),
    defineArrayMember({ type: 'labRotatingMedia' }),
    defineArrayMember({ type: 'labMediaZoomOutOnScroll' }),
    defineArrayMember({ type: 'labIconGrid' }),
    defineArrayMember({ type: 'labProofPoints' }),
    defineArrayMember({ type: 'labMediaTextAsymmetric' }),
  ],
})
