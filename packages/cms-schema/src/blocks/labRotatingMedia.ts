import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { appearanceField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import {
  labBlockCallToActionsField,
  labBlockSectionDescriptionField,
  labBlockSectionTitleField,
} from '../shared/labBlockFramingFields'

export const labRotatingMediaItem = defineType({
  name: 'labRotatingMediaItem',
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
      type: 'text',
      title: 'Title',
      rows: 2,
      description: 'Press Enter for a line break.',
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

export const labRotatingMediaBlock = defineType({
  name: 'labRotatingMedia',
  type: 'object',
  title: 'Rotating media',
  description:
    'Auto-rotating media carousel. Small: 2×4 grid. Large: single full-width card. Combined: one large + small cards.',
  fields: [
    spacingTopField,
    spacingBottomField,
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
    appearanceField(),
    emphasisField(),
    minimalBackgroundStyleField('emphasis'),
    labBlockSectionTitleField,
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Media items',
      of: [{ type: 'labRotatingMediaItem' }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Add at least one media item'),
    }),
  ],
  preview: {
    select: { 'firstItemTitle': 'items.0.title', 'firstItemLabel': 'items.0.label', variant: 'variant', items: 'items' },
    prepare: ({ firstItemTitle, firstItemLabel, variant, items }) => {
      const inferredTitle = (firstItemTitle || firstItemLabel || '').toString().trim() || 'Rotating media'
      return {
        title: inferredTitle,
        subtitle: `Rotating media · ${variant ?? 'small'} · ${items?.length ?? 0} item(s)`,
      }
    },
  },
})
