import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { surfaceColourField, emphasisField } from '../shared/blockColourFields'
import { GridAreaInput } from '../../components/sanity/GridAreaInput'
import { BackgroundPositionSliderInput } from '../../components/sanity/BackgroundPositionSliderInput'
import {
  labBlockCallToActionsField,
  labBlockSectionDescriptionField,
} from '../shared/labBlockFramingFields'

/**
 * Lab-only editorial block. 12×6 grid composition for text + image.
 * Text and image placed independently, can overlap.
 */
export const editorialBlock = defineType({
  name: 'editorialBlock',
  type: 'object',
  title: 'Editorial',
  description: '12×6 grid composition. Text and image placed independently, can overlap.',
  fieldsets: [
    { name: 'grid', title: 'Grid placement', options: { columns: 2 } },
  ],
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'rows',
      type: 'number',
      title: 'Rows',
      description: 'Grid height. Cell size = width/12 (square). rows=6 → 2:1, rows=4 → 3:1, rows=8 → 4:3, rows=12 → 1:1. Desktop only.',
      initialValue: 6,
      validation: (Rule) => Rule.min(2).max(16),
    }),
    surfaceColourField(),
    emphasisField(),
    // Grid placement (text + image areas side by side)
    defineField({
      name: 'textArea',
      type: 'object',
      title: 'Text area',
      description: 'Drag to select grid area for text placement.',
      fieldset: 'grid',
      components: { input: GridAreaInput },
      options: { columns: 1 },
      fields: [
        defineField({
          name: 'topLeft',
          type: 'object',
          title: 'Top left',
          options: { columns: 2 },
          fields: [
            defineField({ name: 'column', type: 'number', title: 'Col', initialValue: 1, validation: (Rule) => Rule.min(1).max(12).integer() }),
            defineField({ name: 'row', type: 'number', title: 'Row', initialValue: 2, validation: (Rule) => Rule.min(1).max(16).integer() }),
          ],
        }),
        defineField({
          name: 'bottomRight',
          type: 'object',
          title: 'Bottom right',
          options: { columns: 2 },
          fields: [
            defineField({ name: 'column', type: 'number', title: 'Col', initialValue: 6, validation: (Rule) => Rule.min(1).max(12).integer() }),
            defineField({ name: 'row', type: 'number', title: 'Row', initialValue: 4, validation: (Rule) => Rule.min(1).max(16).integer() }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'imageArea',
      type: 'object',
      title: 'Image area',
      description: 'Drag to select grid area for image placement.',
      fieldset: 'grid',
      components: { input: GridAreaInput },
      options: { columns: 1 },
      fields: [
        defineField({
          name: 'topLeft',
          type: 'object',
          title: 'Top left',
          options: { columns: 2 },
          fields: [
            defineField({ name: 'column', type: 'number', title: 'Col', initialValue: 5, validation: (Rule) => Rule.min(1).max(12).integer() }),
            defineField({ name: 'row', type: 'number', title: 'Row', initialValue: 1, validation: (Rule) => Rule.min(1).max(16).integer() }),
          ],
        }),
        defineField({
          name: 'bottomRight',
          type: 'object',
          title: 'Bottom right',
          options: { columns: 2 },
          fields: [
            defineField({ name: 'column', type: 'number', title: 'Col', initialValue: 12, validation: (Rule) => Rule.min(1).max(12).integer() }),
            defineField({ name: 'row', type: 'number', title: 'Row', initialValue: 6, validation: (Rule) => Rule.min(1).max(16).integer() }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'headlineSize',
      type: 'string',
      title: 'Headline size',
      options: {
        list: [
          { value: 'display', title: 'Display' },
          { value: 'headline', title: 'Headline' },
          { value: 'title', title: 'Title' },
        ],
        layout: 'radio',
      },
      initialValue: 'display',
    }),
    defineField({
      name: 'textAlign',
      type: 'string',
      title: 'Text align',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'textVerticalAlign',
      type: 'string',
      title: 'Text vertical align',
      options: {
        list: [
          { value: 'center', title: 'Center' },
          { value: 'bottom', title: 'Bottom' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    }),
    defineField({
      name: 'textInFront',
      type: 'boolean',
      title: 'Text in front',
      description: 'When true, text appears above image.',
      initialValue: true,
    }),
    defineField({
      name: 'headline',
      type: 'text',
      title: 'Headline',
      rows: 2,
    }),
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body',
      rows: 3,
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'CTA label',
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'CTA link',
    }),
    // Background image (full block height, center-aligned, clips sides)
    defineField({
      name: 'backgroundImage',
      type: 'image',
      title: 'Background image',
      description: 'Optional. Spans full block height, crops sides.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'backgroundImagePositionX',
      type: 'number',
      title: 'Background position (horizontal)',
      description: '0 = left, 50 = center, 100 = right.',
      validation: (Rule) => Rule.min(0).max(100),
      initialValue: 0,
      components: { input: BackgroundPositionSliderInput },
      hidden: ({ parent }) => !parent?.backgroundImage && !parent?.backgroundImageUrl,
    }),
    defineField({
      name: 'backgroundImagePositionY',
      type: 'number',
      title: 'Background position (vertical)',
      description: '0 = top, 50 = center, 100 = bottom.',
      validation: (Rule) => Rule.min(0).max(100),
      initialValue: 50,
      components: { input: BackgroundPositionSliderInput },
      hidden: ({ parent }) => !parent?.backgroundImage && !parent?.backgroundImageUrl,
    }),
    defineField({
      name: 'backgroundImageUrl',
      type: 'string',
      title: 'Background image URL',
      description: 'External URL when no background image is uploaded.',
    }),
    // Image
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
      description: 'Ambient video. Muted, autoplay, loop. Poster from image when reduced motion.',
    }),
    defineField({
      name: 'imageFit',
      type: 'string',
      title: 'Image fit',
      description: 'Fill = cover (crop to fill). Fit = contain (show full image).',
      options: {
        list: [
          { value: 'cover', title: 'Fill (cover)' },
          { value: 'contain', title: 'Fit (contain)' },
        ],
        layout: 'radio',
      },
      initialValue: 'contain',
    }),
  ],
  preview: {
    select: { headline: 'headline' },
    prepare: ({ headline }) => ({
      title: headline || 'Editorial',
      subtitle: '12×6 grid composition',
    }),
  },
})
