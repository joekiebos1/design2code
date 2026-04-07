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

export const fullBleedVerticalCarouselItem = defineType({
  name: 'fullBleedVerticalCarouselItem',
  type: 'object',
  title: 'Carousel item',
  fields: [
    defineField({
      name: 'title',
      type: 'text',
      title: 'Title',
      rows: 2,
      description: 'Press Enter for a line break.',
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 3,
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      description: 'Upload or use Image URL / Video URL below',
      options: { hotspot: true },
      hidden: ({ parent }) => Boolean(parent?.video?.asset || parent?.videoUrl),
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded.',
      hidden: ({ parent }) => Boolean(parent?.video?.asset || parent?.videoUrl),
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      description: 'Upload or use Video URL below',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => Boolean(parent?.image?.asset || parent?.imageUrl),
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'External video URL (e.g. storage.googleapis.com). Used when no video is uploaded.',
      hidden: ({ parent }) => Boolean(parent?.image?.asset || parent?.imageUrl),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({
      title: title || 'Carousel item',
    }),
  },
})

export const fullBleedVerticalCarouselBlock = defineType({
  name: 'fullBleedVerticalCarousel',
  type: 'object',
  title: 'Full bleed vertical carousel',
  fields: [
    spacingTopField,
    spacingBottomField,
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
    appearanceField(),
    emphasisField(),
    minimalBackgroundStyleField('emphasis'),
    // Content
    labBlockSectionTitleField,
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      description: '1–5 images or videos with title and description',
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(7)
          .error('Add 1 to 7 items'),
      of: [{ type: 'fullBleedVerticalCarouselItem' }],
    }),
  ],
  preview: {
    select: { 'firstItemTitle': 'items.0.title', emphasis: 'emphasis', items: 'items' },
    prepare: ({ firstItemTitle, emphasis, items }) => {
      const inferredTitle = (firstItemTitle || '').toString().trim() || 'Full bleed vertical carousel'
      return {
        title: inferredTitle,
        subtitle: `Full bleed vertical carousel · ${emphasis ?? ''} · ${items?.length ?? 0} item(s)`,
      }
    },
  },
})
