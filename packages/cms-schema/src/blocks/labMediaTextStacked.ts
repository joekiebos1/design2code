import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { appearanceField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'

export const labMediaTextStackedBlock = defineType({
  name: 'labMediaTextStacked',
  type: 'object',
  title: 'Media + Text: Stacked',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'template',
      type: 'string',
      title: 'Variant',
      description: 'Text only: no media. Stacked: text above/below image. Overlay: text on top of image. For 50/50 layouts use Media + Text: 50/50 block.',
      options: {
        list: [
          { value: 'textOnly', title: 'Text only' },
          { value: 'stacked', title: 'Stacked – Text above/below image' },
          { value: 'overlay', title: 'Overlay – Text on top of image' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'stacked',
    }),
    defineField({
      name: 'mediaSize',
      type: 'string',
      title: 'Media size',
      description: 'Edge to edge: full viewport. Contained: media within Default grid.',
      options: {
        list: [
          { value: 'edgeToEdge', title: 'Edge to edge' },
          { value: 'default', title: 'Contained' },
        ],
        layout: 'radio',
      },
      initialValue: 'edgeToEdge',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { template?: string }
          if (parent?.template === 'textOnly') return true
          return value ? true : 'Required when Stacked or Overlay'
        }),
      hidden: ({ parent }) => parent?.template === 'textOnly',
    }),
    defineField({
      name: 'alignment',
      type: 'string',
      title: 'Text alignment',
      description: 'Left = aligned to Default grid width. Center = viewport center.',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      validation: (Rule) => Rule.required().error('Alignment is required'),
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
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow',
      description: 'Small label above the headline (e.g. "MOBILE GAMES").',
    }),
    defineField({
      name: 'title',
      type: 'text',
      title: 'Title',
      rows: 2,
      description: 'Press Enter for a line break.',
    }),
    defineField({
      name: 'subhead',
      type: 'text',
      title: 'Subhead',
      description: 'Secondary headline below the main title. Press Enter for a line break.',
      rows: 2,
    }),
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body',
      rows: 4,
    }),
    defineField({
      name: 'descriptionTitle',
      type: 'string',
      title: 'Image description title',
      description: 'Optional. Shown below the image (Stacked only). Uses same styling as Large Carousel card (h5).',
      hidden: ({ parent }) => parent?.template !== 'stacked',
    }),
    defineField({
      name: 'descriptionBody',
      type: 'text',
      title: 'Image description',
      description: 'Optional. Body copy below the image (Stacked only). Uses label-s typography.',
      rows: 3,
      hidden: ({ parent }) => parent?.template !== 'stacked',
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'CTA Text',
      description: 'e.g. "Visit JioFinance"',
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'CTA Link',
    }),
    defineField({
      name: 'cta2Text',
      type: 'string',
      title: 'Secondary CTA Text',
      description: 'e.g. "See it in action"',
    }),
    defineField({
      name: 'cta2Link',
      type: 'string',
      title: 'Secondary CTA Link',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      description: 'Upload or use Image URL below',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.template === 'textOnly',
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded. Also used as poster for video.',
      hidden: ({ parent }) => parent?.template === 'textOnly',
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      description: 'Optional video. When set, video is shown instead of image. Autoplay with mute/play controls.',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.template === 'textOnly',
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'External video URL. Used when no video is uploaded.',
      hidden: ({ parent }) => parent?.template === 'textOnly',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      template: 'template',
    },
    prepare: ({ title, eyebrow, template }) => {
      const layoutLabels: Record<string, string> = {
        textOnly: 'Text only',
        stacked: 'Stacked',
        overlay: 'Overlay',
      }
      const layout = layoutLabels[template || 'stacked'] ?? template
      const inferredTitle = (title || eyebrow || '').toString().trim() || 'Media + Text: Stacked'
      return {
        title: inferredTitle,
        subtitle: `Media + Text: Stacked · ${layout}`,
      }
    },
  },
})
