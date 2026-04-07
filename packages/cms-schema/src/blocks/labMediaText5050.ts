import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { appearanceField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import {
  labBlockCallToActionsField,
  labBlockSectionDescriptionField,
} from '../shared/labBlockFramingFields'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'

/** Paragraphs (multi): text only — block owns shared media. */
export const labMediaText5050ParagraphItem = defineType({
  name: 'labMediaText5050ParagraphItem',
  type: 'object',
  title: 'Section',
  fields: [
    defineField({
      name: 'subtitle',
      type: 'string',
      title: 'Section title',
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
    prepare: ({ subtitle }) => ({ title: subtitle || 'Section' }),
  },
})

/** Accordion: each panel has its own media (shown in the media column for the open panel). */
export const labMediaText5050AccordionItem = defineType({
  name: 'labMediaText5050AccordionItem',
  type: 'object',
  title: 'Accordion panel',
  fields: [
    defineField({
      name: 'subtitle',
      type: 'string',
      title: 'Panel title',
    }),
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body',
      rows: 3,
    }),
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
  ],
  preview: {
    select: { subtitle: 'subtitle' },
    prepare: ({ subtitle }) => ({ title: subtitle || 'Panel' }),
  },
})

export const labMediaText5050Block = defineType({
  name: 'labMediaText5050',
  type: 'object',
  title: 'Media + Text: 50/50 (Lab)',
  description:
    'Lab-only 50/50: one section CTA max; single-paragraph uses flat fields; accordion uses per-panel media (one aspect ratio for all panels; media column follows open panel).',
  groups: [
    { name: 'layout', title: 'Layout', default: true },
    { name: 'content', title: 'Content' },
    { name: 'media', title: 'Media' },
    { name: 'appearance', title: 'Appearance' },
  ],
  fields: [
    defineField({
      ...spacingTopField,
      group: 'appearance',
    }),
    defineField({
      ...spacingBottomField,
      group: 'appearance',
    }),
    defineField({
      name: 'imagePosition',
      type: 'string',
      title: 'Image position',
      group: 'layout',
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
      name: 'headingAlignment',
      type: 'string',
      title: 'Heading alignment',
      group: 'layout',
      description: 'Applies to the block heading, description, and button above the media and text columns.',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Centre' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Variant',
      group: 'content',
      description: 'How the text column is structured.',
      options: {
        list: [
          { value: 'singleParagraph', title: 'Single paragraph – one prominent section' },
          { value: 'multiParagraph', title: 'Multi paragraph – stacked sections' },
          { value: 'accordion', title: 'Accordion – collapsible sections' },
        ],
        layout: 'radio',
      },
      initialValue: 'multiParagraph',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headline',
      type: 'string',
      title: 'Title',
      group: 'content',
      description: 'Optional. Shown above the media + text columns.',
    }),
    defineField({
      ...labBlockSectionDescriptionField,
      title: 'Description',
      group: 'content',
    }),
    defineField({
      ...labBlockCallToActionsField,
      name: 'callToActions',
      title: 'Section CTA',
      description: 'Optional. At most one button below the description.',
      group: 'content',
      validation: (Rule) => Rule.max(1),
    }),
    defineField({
      name: 'singleSubtitle',
      type: 'string',
      title: 'Section title',
      group: 'content',
      description: 'Only for Single paragraph variant.',
      hidden: ({ parent }) => parent?.variant !== 'singleParagraph',
    }),
    defineField({
      name: 'singleBody',
      type: 'text',
      title: 'Body',
      group: 'content',
      rows: 4,
      description: 'Only for Single paragraph variant.',
      hidden: ({ parent }) => parent?.variant !== 'singleParagraph',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Sections',
      group: 'content',
      of: [{ type: 'labMediaText5050ParagraphItem' }],
      description: 'Only for Multi paragraph variant.',
      hidden: ({ parent }) => parent?.variant !== 'multiParagraph',
    }),
    defineField({
      name: 'accordionItems',
      type: 'array',
      title: 'Accordion panels',
      group: 'content',
      of: [{ type: 'labMediaText5050AccordionItem' }],
      description: 'Each panel has title, body, and its own media.',
      hidden: ({ parent }) => parent?.variant !== 'accordion',
    }),
    defineField({
      name: 'theme',
      type: 'string',
      title: 'Theme',
      group: 'appearance',
      description: 'Design system theme. Default: MyJio.',
      options: {
        list: [...DS_THEMES],
        layout: 'dropdown',
      },
      initialValue: DS_THEME_DEFAULT,
    }),
    defineField({
      ...appearanceField(),
      group: 'appearance',
    }),
    defineField({
      ...emphasisField(),
      group: 'appearance',
    }),
    defineField({
      ...minimalBackgroundStyleField('emphasis'),
      group: 'appearance',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      group: 'media',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.variant === 'accordion',
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      group: 'media',
      description: 'External image URL when no image is uploaded.',
      hidden: ({ parent }) => parent?.variant === 'accordion',
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      group: 'media',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.variant === 'accordion',
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      group: 'media',
      hidden: ({ parent }) => parent?.variant === 'accordion',
    }),
    defineField({
      name: 'imageAspectRatio',
      type: 'string',
      title: 'Aspect ratio',
      group: 'media',
      description:
        'Paragraphs: crop for the shared block image/video. Accordion: same crop for every panel’s image/video.',
      options: {
        list: [
          { value: '5:4', title: '5:4' },
          { value: '1:1', title: '1:1' },
          { value: '4:5', title: '4:5' },
        ],
        layout: 'radio',
      },
      initialValue: '4:5',
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
        singleParagraph: 'Single paragraph',
        multiParagraph: 'Multi paragraph',
        accordion: 'Accordion',
      }
      const v = variantLabels[variant || 'multiParagraph'] ?? variant
      const pos = imagePosition ? ` · Image ${imagePosition}` : ''
      return {
        title: headline || '50/50 (Lab)',
        subtitle: `${v}${pos}`,
      }
    },
  },
})
