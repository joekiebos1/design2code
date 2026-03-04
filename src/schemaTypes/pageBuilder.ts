import { defineArrayMember, defineType } from 'sanity'
import { FillWithSampleBlock } from '../components/FillWithSampleBlock'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  title: 'Page sections',
  description:
    'Add new block with dropdown. Use "Fill with sample" to populate placeholder content.',
  of: [
    defineArrayMember({
      type: 'hero',
      components: {
        input: FillWithSampleBlock,
      },
    }),
    defineArrayMember({
      type: 'mediaTextBlock',
      components: {
        input: FillWithSampleBlock,
      },
    }),
    defineArrayMember({
      type: 'cardGrid',
      components: {
        input: FillWithSampleBlock,
      },
    }),
    defineArrayMember({
      type: 'fullBleedVerticalCarousel',
      components: {
        input: FillWithSampleBlock,
      },
    }),
    defineArrayMember({
      type: 'carousel',
      components: {
        input: FillWithSampleBlock,
      },
    }),
    defineArrayMember({
      type: 'proofPoints',
      components: {
        input: FillWithSampleBlock,
      },
    }),
    defineArrayMember({
      type: 'rotatingMedia',
      components: {
        input: FillWithSampleBlock,
      },
    }),
  ],
})
