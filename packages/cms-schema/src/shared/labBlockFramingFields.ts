import { defineField } from 'sanity'

/** Optional section copy below the title. Same shape on every lab-capable block (flat fields). */
export const labBlockSectionDescriptionField = defineField({
  name: 'description',
  type: 'text',
  title: 'Section description',
  rows: 3,
  description: 'Optional. Shown below the section title, above the main block content.',
})

const callToActionRowFields = [
  defineField({
    name: 'label',
    type: 'string',
    title: 'Label',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'link',
    type: 'string',
    title: 'Link',
  }),
  defineField({
    name: 'style',
    type: 'string',
    title: 'Button style',
    options: {
      list: [
        { value: 'filled', title: 'Filled' },
        { value: 'outlined', title: 'Outlined' },
      ],
      layout: 'radio',
    },
    initialValue: 'filled',
  }),
]

/** Optional section CTAs below the description. Same shape everywhere (flat array on the block). */
export const labBlockCallToActionsField = defineField({
  name: 'callToActions',
  type: 'array',
  title: 'Section CTAs',
  description: 'Optional buttons below the section description.',
  of: [
    {
      type: 'object',
      fields: callToActionRowFields,
      preview: {
        select: { label: 'label' },
        prepare: ({ label }) => ({ title: label || 'CTA' }),
      },
    },
  ],
})

/** Block-level section title for blocks that currently only have items (e.g. icon grid). */
export const labBlockSectionTitleField = defineField({
  name: 'title',
  type: 'text',
  title: 'Section title',
  rows: 2,
  description: 'Optional heading above the block content. Press Enter for a line break.',
})
