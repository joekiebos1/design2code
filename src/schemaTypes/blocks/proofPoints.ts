import { defineField, defineType } from 'sanity'
import { IconPickerInput } from '../../components/IconPickerInput'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'

export const proofPointsBlock = defineType({
  name: 'proofPoints',
  type: 'object',
  title: 'Proof Points',
  description: 'Text + icon strip for top reasons to believe. Often used at the top of a page.',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section Title',
      description: 'Optional heading above the proof points',
    }),
    defineField({
      name: 'titleLevel',
      type: 'string',
      title: 'Heading level',
      description: 'Semantic level for accessibility and size.',
      options: {
        list: [
          { value: 'h2', title: 'H2' },
          { value: 'h3', title: 'H3' },
          { value: 'h4', title: 'H4' },
        ],
        layout: 'radio',
      },
      initialValue: 'h2',
      hidden: ({ parent }) => !parent?.title,
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Proof Points',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Title', validation: (Rule) => Rule.required() },
            { name: 'description', type: 'text', title: 'Description', rows: 2 },
            {
              name: 'icon',
              type: 'string',
              title: 'Icon',
              components: {
                input: IconPickerInput,
              },
            },
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: title || 'Proof point' }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({
      title: title || 'Proof Points',
      subtitle: 'Proof points block',
    }),
  },
})
