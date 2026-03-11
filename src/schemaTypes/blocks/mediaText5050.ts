import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'

export const mediaText5050Item = defineType({
  name: 'mediaText5050Item',
  type: 'object',
  title: 'Item',
  fields: [
    defineField({
      name: 'subtitle',
      type: 'string',
      title: 'Subtitle',
      description: 'Section header (paragraphs) or accordion header (accordion)',
    }),
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body',
      rows: 3,
    }),
  ],
  preview: {
    select: { subtitle: 'subtitle' },
    prepare: ({ subtitle }) => ({ title: subtitle || 'Item' }),
  },
})

export const mediaText5050Block = defineType({
  name: 'mediaText5050',
  type: 'object',
  title: 'Media + Text 50/50',
  description:
    'Split layout: 50% media, 50% text. Two variants: paragraphs (stacked sections) or accordion (collapsible sections).',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'headline',
      type: 'string',
      title: 'Headline',
      description: 'Optional block-level heading above all content.',
    }),
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Variant',
      description: 'Content structure for the text side.',
      options: {
        list: [
          { value: 'paragraphs', title: 'Paragraphs – Stacked sections (1 item = larger font, 2+ = smaller)' },
          { value: 'accordion', title: 'Accordion – Collapsible sections' },
        ],
        layout: 'radio',
      },
      initialValue: 'paragraphs',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imagePosition',
      type: 'string',
      title: 'Image position',
      options: {
        list: [
          { value: 'left', title: 'Image left' },
          { value: 'right', title: 'Image right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'theme',
      type: 'string',
      title: 'Theme',
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
      name: 'blockBackground',
      type: 'string',
      title: 'Emphasis',
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
    minimalBackgroundStyleField('blockBackground'),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      of: [{ type: 'mediaText5050Item' }],
      description: 'Each item has subtitle + body. Paragraphs: stacked sections. Accordion: collapsible sections.',
    }),
    // Media
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL when no image is uploaded.',
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
    }),
    defineField({
      name: 'imageAspectRatio',
      type: 'string',
      title: 'Aspect ratio',
      options: {
        list: [
          { value: '4:3', title: '4:3' },
          { value: '3:4', title: '3:4' },
          { value: '1:1', title: '1:1' },
          { value: '16:9', title: '16:9' },
        ],
        layout: 'radio',
      },
      initialValue: '4:3',
    }),
  ],
  preview: {
    select: {
      headline: 'headline',
      variant: 'variant',
      imagePosition: 'imagePosition',
    },
    prepare: ({ headline, variant, imagePosition }) => {
      const variantLabels: Record<string, string> = {
        paragraphs: 'Paragraphs',
        accordion: 'Accordion',
      }
      const v = variantLabels[variant || 'paragraphs'] ?? variant
      const pos = imagePosition ? ` · Image ${imagePosition}` : ''
      return {
        title: headline || 'Media + Text 50/50',
        subtitle: `${v}${pos}`,
      }
    },
  },
})
