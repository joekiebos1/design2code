import { defineArrayMember, defineType } from 'sanity'
import { BlockWithAIAssist } from '../components/BlockWithAIAssist'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  title: 'Page sections',
  description:
    'Add new block with dropdown. Use "Fill with sample" or "Configure with Claude" to populate and refine content.',
  of: [
    defineArrayMember({
      type: 'hero',
      components: {
        input: BlockWithAIAssist,
      },
    }),
    defineArrayMember({
      type: 'mediaTextBlock',
      components: {
        input: BlockWithAIAssist,
      },
    }),
    defineArrayMember({
      type: 'mediaText5050',
      components: {
        input: BlockWithAIAssist,
      },
    }),
    defineArrayMember({
      type: 'cardGrid',
      components: {
        input: BlockWithAIAssist,
      },
    }),
    defineArrayMember({
      type: 'carousel',
      components: {
        input: BlockWithAIAssist,
      },
    }),
    defineArrayMember({
      type: 'proofPoints',
      components: {
        input: BlockWithAIAssist,
      },
    }),
    defineArrayMember({
      type: 'iconGrid',
      components: {
        input: BlockWithAIAssist,
      },
    }),
    defineArrayMember({
      type: 'list',
      components: {
        input: BlockWithAIAssist,
      },
    }),
  ],
})
