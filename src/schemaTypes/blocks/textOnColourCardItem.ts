import { defineField, defineType } from 'sanity'
import { IconPickerInput } from '../../components/sanity/IconPickerInput'

/**
 * Text on colour card – unified card with optional icon, CTAs, features.
 * When size is large: title + description only (no icon, CTAs, or features).
 */
export const textOnColourCardItem = defineType({
  name: 'textOnColourCardItem',
  type: 'object',
  title: 'Text on colour card',
  fields: [
    defineField({
      name: 'size',
      type: 'string',
      title: 'Size',
      description: 'Large: headline + description only. Small: full card with icon, CTAs, and features.',
      options: {
        list: [
          { value: 'large', title: 'Large (headline only)' },
          { value: 'small', title: 'Small (full card)' },
        ],
        layout: 'radio',
      },
      initialValue: 'small',
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
      hidden: ({ parent }) => parent?.size === 'large',
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Features',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      hidden: ({ parent }) => parent?.size === 'large',
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background colour',
      options: {
        list: [
          { value: 'primary', title: 'Primary' },
          { value: 'secondary', title: 'Secondary' },
          { value: 'tertiary', title: 'Tertiary' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
  ],
  preview: {
    select: { title: 'title', size: 'size', backgroundColor: 'backgroundColor' },
    prepare: ({ title, size, backgroundColor }) => ({
      title: title || 'Text on colour',
      subtitle: [size === 'large' ? 'Large' : 'Small', backgroundColor].filter(Boolean).join(' · '),
    }),
  },
})
