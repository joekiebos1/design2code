import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'

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
    defineField({
      name: 'blockAccent',
      type: 'string',
      title: 'Theming',
      description: 'Primary = brand, Secondary = brand secondary, Neutral = grey.',
      options: {
        list: [
          { value: 'primary', title: 'Primary (brand)' },
          { value: 'secondary', title: 'Secondary' },
          { value: 'neutral', title: 'Neutral (grey)' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'surface',
      type: 'string',
      title: 'Emphasis',
      description: 'Ghost = no background. Minimal = light tint, Subtle = medium tint, Bold = strong tint. Colour comes from Theming.',
      options: {
        list: [
          { value: 'ghost', title: 'Ghost (no background)' },
          { value: 'minimal', title: 'Minimal' },
          { value: 'subtle', title: 'Subtle' },
          { value: 'bold', title: 'Bold' },
        ],
        layout: 'radio',
      },
      initialValue: 'ghost',
    }),
    minimalBackgroundStyleField('surface'),
    // Content
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
    select: { 'firstItemTitle': 'items.0.title', surface: 'surface', items: 'items' },
    prepare: ({ firstItemTitle, surface, items }) => {
      const inferredTitle = (firstItemTitle || '').toString().trim() || 'Full bleed vertical carousel'
      return {
        title: inferredTitle,
        subtitle: `Full bleed vertical carousel · ${surface ?? 'ghost'} · ${items?.length ?? 0} item(s)`,
      }
    },
  },
})
