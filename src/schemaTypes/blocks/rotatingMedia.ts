import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'

export const rotatingMediaItem = defineType({
  name: 'rotatingMediaItem',
  type: 'object',
  title: 'Media item',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      options: { hotspot: true },
      hidden: ({ parent }) => Boolean(parent?.imageUrl),
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded.',
      hidden: ({ parent }) => Boolean(parent?.image?.asset),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'label',
      type: 'string',
      title: 'Label',
    }),
  ],
  preview: {
    select: { title: 'title', label: 'label' },
    prepare: ({ title, label }) => ({
      title: title || label || 'Media item',
    }),
  },
})

export const rotatingMediaBlock = defineType({
  name: 'rotatingMedia',
  type: 'object',
  title: 'Rotating media',
  description:
    'Auto-rotating media carousel. Small: 2×4 grid. Large: single full-width card. Combined: one large + small cards.',
  fields: [
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Variant',
      options: {
        list: [
          { value: 'small', title: 'Small cards only (2×4 grid)' },
          { value: 'large', title: 'Large cards only (full width)' },
          { value: 'combined', title: 'Combined (large + small)' },
        ],
        layout: 'radio',
      },
      initialValue: 'small',
    }),
    defineField({
      name: 'surface',
      type: 'string',
      title: 'Background',
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
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Media items',
      of: [{ type: 'rotatingMediaItem' }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Add at least one media item'),
    }),
  ],
  preview: {
    select: { variant: 'variant', items: 'items' },
    prepare: ({ variant, items }) => ({
      title: 'Rotating media',
      subtitle: `${variant ?? 'small'} · ${items?.length ?? 0} item(s)`,
    }),
  },
})
