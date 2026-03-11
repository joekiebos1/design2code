import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'

export const cardGridItem = defineType({
  name: 'cardGridItem',
  type: 'object',
  title: 'Card',
  fields: [
    defineField({
      name: 'cardStyle',
      type: 'string',
      title: 'Card style',
      description: 'image-above: image on top, text below. text-on-image: text overlay on image. For text on colour, use Text on colour card type.',
      options: {
        list: [
          { value: 'image-above', title: 'Image above' },
          { value: 'text-on-image', title: 'Text on image' },
        ],
        layout: 'radio',
      },
      initialValue: 'image-above',
    }),
    defineField({
      name: 'title',
      type: 'text',
      title: 'Title',
      rows: 2,
      description: 'Press Enter for a line break.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 2,
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded.',
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'External video URL. When set, video is shown instead of image (image-above only).',
      hidden: ({ parent }) => parent?.cardStyle !== 'image-above',
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'CTA label',
      description: 'Call-to-action button label.',
      hidden: ({ parent }) => parent?.cardStyle !== 'image-above',
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'CTA link',
      description: 'Call-to-action destination URL.',
      hidden: ({ parent }) => parent?.cardStyle !== 'image-above' || !parent?.ctaText,
    }),
  ],
  preview: {
    select: { title: 'title', cardStyle: 'cardStyle' },
    prepare: ({ title, cardStyle }) => ({
      title: title || 'Card',
      subtitle: cardStyle === 'image-above' ? 'Image above' : 'Text on image',
    }),
  },
})

export const cardGridBlock = defineType({
  name: 'cardGrid',
  type: 'object',
  title: 'Card grid',
  description: 'Grid of 2, 3, or 4 cards. Each card can have image above, text on colour, or text on image.',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
    defineField({
      name: 'columns',
      type: 'string',
      title: 'Columns',
      description: 'Number of columns on desktop (2, 3, or 4).',
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
      name: 'title',
      type: 'text',
      title: 'Section title',
      rows: 2,
      description: 'Press Enter for a line break.',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Cards',
      of: [{ type: 'cardGridItem' }, { type: 'textOnColourCardItem' }],
      validation: (Rule) => Rule.required().min(1).max(12),
    }),
  ],
  preview: {
    select: { title: 'title', columns: 'columns', items: 'items' },
    prepare: ({ title, columns, items }) => {
      const inferredTitle = (title || '').toString().trim() || 'Card grid'
      return {
        title: inferredTitle,
        subtitle: `Card grid · ${columns ?? '3'} cols · ${items?.length ?? 0} card(s)`,
      }
    },
  },
})
