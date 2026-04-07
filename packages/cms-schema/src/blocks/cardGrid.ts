import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { appearanceField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import { IconPickerInput } from '../components/sanity/IconPickerInput'
import { ColorPickerInput } from '../components/sanity/ColorPickerInput'

export const cardGridItem = defineType({
  name: 'cardGridItem',
  type: 'object',
  title: 'Card',
  fields: [
    defineField({
      name: 'cardType',
      type: 'string',
      title: 'Card type',
      options: {
        list: [
          { value: 'mediaTextBelow', title: 'Media + text stacked' },
          { value: 'mediaTextOverlay', title: 'Text overlay on media' },
          { value: 'colourFeatured', title: 'Large text on colour' },
          { value: 'colourIconText', title: 'Icon + text on colour' },
          { value: 'colourTextOnly', title: 'Text on colour' },
          { value: 'colourMediaText', title: 'Media + text on colour' },
        ],
        layout: 'radio',
      },
      initialValue: 'mediaTextBelow',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Icon',
      components: { input: IconPickerInput },
      initialValue: 'IcMobile',
      hidden: ({ parent }) => parent?.cardType !== 'colourIconText',
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background colour',
      components: { input: ColorPickerInput },
      initialValue: 'primary',
      hidden: ({ parent }) => !parent?.cardType?.startsWith('colour'),
    }),
    defineField({
      name: 'title',
      type: 'text',
      title: 'Title',
      rows: 2,
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
      hidden: ({ parent }) => {
        const ct = parent?.cardType
        return !!ct?.startsWith('colour') && ct !== 'colourMediaText'
      },
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      hidden: ({ parent }) => {
        const ct = parent?.cardType
        return !!ct?.startsWith('colour') && ct !== 'colourMediaText'
      },
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      hidden: ({ parent }) => parent?.cardType !== 'mediaTextBelow',
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'CTA label',
      description: 'Information mode only. Hidden when block interaction is Navigation.',
      hidden: ({ parent }) => parent?.cardType !== 'mediaTextBelow' && parent?.cardType !== 'colourMediaText',
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'CTA link',
      hidden: ({ parent }) => (parent?.cardType !== 'mediaTextBelow' && parent?.cardType !== 'colourMediaText') || !parent?.ctaText,
    }),
    defineField({
      name: 'link',
      type: 'string',
      title: 'Link URL',
      description: 'Navigation mode only. The entire card links to this URL.',
    }),
  ],
  preview: {
    select: { title: 'title', cardType: 'cardType' },
    prepare: ({ title, cardType }) => {
      const labels: Record<string, string> = {
        'mediaTextBelow': 'Media + text stacked',
        'mediaTextOverlay': 'Text overlay on media',
        'colourFeatured': 'Large text on colour',
        'colourIconText': 'Icon + text on colour',
        'colourTextOnly': 'Text on colour',
        'colourMediaText': 'Media + text on colour',
      }
      return { title: title || 'Card', subtitle: labels[cardType as string] ?? cardType }
    },
  },
})

export const cardGridBlock = defineType({
  name: 'cardGrid',
  type: 'object',
  title: 'Card grid',
  description: 'Grid of 2, 3, or 4 cards.',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'interaction',
      type: 'string',
      title: 'Card interaction',
      description: 'Information: cards display content with optional CTA inside. Navigation: entire card is a link.',
      options: {
        list: [
          { value: 'information', title: 'Information' },
          { value: 'navigation', title: 'Navigation' },
        ],
        layout: 'radio',
      },
      initialValue: 'information',
    }),
    defineField({
      name: 'columns',
      type: 'string',
      title: 'Layout',
      description: 'Number of cards per row on desktop (2, 3, or 4).',
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
      of: [{ type: 'cardGridItem' }],
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
