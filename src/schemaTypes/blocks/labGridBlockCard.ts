import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { IconPickerInput } from '../../components/sanity/IconPickerInput'
import { ColorPickerInput } from '../../components/sanity/ColorPickerInput'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { surfaceColourField, emphasisField } from '../shared/blockColourFields'

/** Lab: Text inside cards – large (headline + description) or small (icon, CTAs, features). Both with background colour. */
export const labGridBlockCardItem = defineType({
  name: 'labGridBlockCardItem',
  type: 'object',
  title: 'Card',
  fields: [
    defineField({
      name: 'size',
      type: 'string',
      title: 'Size',
      description: 'Large: headline + description only. Small: full card with icon, CTAs, and features.',
      options: {
        list: [
          { value: 'large', title: 'Large (headline + description)' },
          { value: 'small', title: 'Small (icon, CTAs, features)' },
        ],
        layout: 'radio',
      },
      initialValue: 'small',
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background colour',
      description: 'Theme colours (Primary, Secondary, Sparkle × Minimal, Subtle, Bold) or full DS spectrum.',
      components: { input: ColorPickerInput },
      initialValue: 'primary-bold',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Icon',
      description: 'DS icon name. Only when size is small.',
      components: { input: IconPickerInput },
      hidden: ({ parent }) => parent?.size === 'large',
    }),
    defineField({
      name: 'iconImage',
      type: 'image',
      title: 'Icon image',
      description: 'Custom image as icon. Only when size is small.',
      options: { hotspot: false },
      hidden: ({ parent }) => parent?.size === 'large',
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
      hidden: ({ parent }) => parent?.size === 'large',
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
      options: { layout: 'tags' },
      hidden: ({ parent }) => parent?.size === 'large',
    }),
  ],
  preview: {
    select: { title: 'title', size: 'size', backgroundColor: 'backgroundColor' },
    prepare: ({ title, size, backgroundColor }) => ({
      title: title || 'Card',
      subtitle: [size === 'large' ? 'Large' : 'Small', backgroundColor].filter(Boolean).join(' · '),
    }),
  },
})

export const labGridBlockCardBlock = defineType({
  name: 'labGridBlockCard',
  type: 'object',
  title: 'Text inside cards',
  description: 'Grid of coloured cards with text only. Large: headline + description. Small: icon, CTAs, features. Both with background colour.',
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
    surfaceColourField(),
    emphasisField(),
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
