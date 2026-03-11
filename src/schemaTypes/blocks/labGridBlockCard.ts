import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { IconPickerInput } from '../../components/IconPickerInput'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'

/** Lab: GridBlock Card – Section with centred heading and grid of coloured cards */
export const labGridBlockCardItem = defineType({
  name: 'labGridBlockCardItem',
  type: 'object',
  title: 'Card',
  fields: [
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background colour',
      description: 'Card background: primary (dark purple), secondary (dark blue), tertiary (teal).',
      options: {
        list: [
          { value: 'primary', title: 'Primary (dark purple)' },
          { value: 'secondary', title: 'Secondary (dark blue)' },
          { value: 'tertiary', title: 'Tertiary (teal)' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Icon',
      description: 'DS icon name. Optional.',
      components: {
        input: IconPickerInput,
      },
    }),
    defineField({
      name: 'iconImage',
      type: 'image',
      title: 'Icon image',
      description: 'Custom image as icon. Used when icon (DS) is not set.',
      options: { hotspot: false },
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 3,
    }),
    defineField({
      name: 'callToActionButtons',
      type: 'array',
      title: 'Call to action buttons',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() }),
            defineField({ name: 'link', type: 'string', title: 'Link' }),
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
          ],
          preview: {
            select: { label: 'label' },
            prepare: ({ label }) => ({ title: label || 'CTA button' }),
          },
        },
      ],
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Features',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
  ],
  preview: {
    select: { title: 'title', backgroundColor: 'backgroundColor' },
    prepare: ({ title, backgroundColor }) => ({
      title: title || 'Card',
      subtitle: backgroundColor ? `Background: ${backgroundColor}` : undefined,
    }),
  },
})

export const labGridBlockCardBlock = defineType({
  name: 'labGridBlockCard',
  type: 'object',
  title: 'Grid block card',
  description: 'Section with centred heading above a grid of coloured cards. Business solutions, product offerings, etc.',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
    defineField({
      name: 'columns',
      type: 'string',
      title: 'Columns',
      description: 'Number of columns on large screens (2, 3, or 4).',
      options: {
        list: [
          { value: '2', title: '2' },
          { value: '3', title: '3' },
          { value: '4', title: '4' },
        ],
        layout: 'radio',
      },
      initialValue: '3',
    }),
    // Colour
    defineField({
      name: 'theme',
      type: 'string',
      title: 'Theme',
      description: 'Design system theme. Default: MyJio.',
      options: {
        list: [...DS_THEMES],
        layout: 'dropdown',
      },
      initialValue: DS_THEME_DEFAULT,
    }),
    defineField({
      name: 'blockSurface',
      type: 'string',
      title: 'Emphasis',
      description: 'Ghost = no background. Minimal = light tint, Subtle = medium tint, Bold = strong tint.',
      options: {
        list: [
          { value: 'ghost', title: 'Ghost' },
          { value: 'minimal', title: 'Minimal' },
          { value: 'subtle', title: 'Subtle' },
          { value: 'bold', title: 'Bold' },
        ],
        layout: 'radio',
      },
      initialValue: 'ghost',
    }),
    defineField({
      name: 'blockAccent',
      type: 'string',
      title: 'Theming',
      options: {
        list: [
          { value: 'primary', title: 'Primary' },
          { value: 'secondary', title: 'Secondary' },
          { value: 'neutral', title: 'Neutral' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    // Content
    defineField({
      name: 'sectionTitle',
      type: 'string',
      title: 'Section title',
      description: 'Centred heading above the grid.',
    }),
    defineField({
      name: 'cards',
      type: 'array',
      title: 'Cards',
      of: [{ type: 'labGridBlockCardItem' }],
      validation: (Rule) => Rule.required().min(1).max(12),
    }),
  ],
  preview: {
    select: { sectionTitle: 'sectionTitle', columns: 'columns', cards: 'cards' },
    prepare: ({ sectionTitle, columns, cards }) => {
      const inferredTitle = (sectionTitle || '').toString().trim() || 'Grid block card'
      return {
        title: inferredTitle,
        subtitle: `Grid block card · ${columns ?? '3'} cols · ${cards?.length ?? 0} card(s)`,
      }
    },
  },
})
