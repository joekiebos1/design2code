import { defineField, defineType } from 'sanity'
import { spacingBottomField } from '../shared/spacingFields'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'

export const heroBlock = defineType({
  name: 'hero',
  type: 'object',
  title: 'Hero',
  description: 'Hero at top of page. No top padding — always flush with top.',
  fields: [
    spacingBottomField,
    // Layout
    defineField({
      name: 'contentLayout',
      type: 'string',
      title: 'Variant',
      description: 'Stacked: text above image. Side by side: text left, image right. Media overlay: image as background with content on top. Text only: centered text, no media.',
      options: {
        list: [
          { value: 'stacked', title: 'Stacked' },
          { value: 'sideBySide', title: 'Side by side' },
          { value: 'mediaOverlay', title: 'Media overlay' },
          { value: 'textOnly', title: 'Text only' },
          { value: 'category', title: 'Category' },
        ],
        layout: 'radio',
      },
      initialValue: 'stacked',
    }),
    defineField({
      name: 'overlayHeight',
      type: 'string',
      title: 'Overlay height',
      description: 'Band: fixed aspect ratio. Media overlay always uses band.',
      options: {
        list: [{ value: 'band', title: 'Band' }],
        layout: 'radio',
      },
      initialValue: 'band',
      hidden: true, // Always band; fullscreen removed. Kept for backwards compatibility.
    }),
    defineField({
      name: 'containerLayout',
      type: 'string',
      title: 'Container',
      description: 'Only when layout is side by side.',
      options: {
        list: [
          { value: 'edgeToEdge', title: 'Edge to edge' },
          { value: 'contained', title: 'Contained' },
        ],
        layout: 'radio',
      },
      initialValue: 'edgeToEdge',
      hidden: ({ parent }) => parent?.contentLayout !== 'sideBySide',
    }),
    defineField({
      name: 'imageAnchor',
      type: 'string',
      title: 'Image alignment',
      description: 'Top to bottom: image fills from top to bottom of the band. Only when layout is side by side.',
      options: {
        list: [
          { value: 'center', title: 'Center' },
          { value: 'bottom', title: 'Top to bottom' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
      hidden: ({ parent }) => parent?.contentLayout !== 'sideBySide',
    }),
    defineField({
      name: 'textAlign',
      type: 'string',
      title: 'Text alignment',
      description: 'Only when layout is media overlay.',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      hidden: ({ parent }) => parent?.contentLayout !== 'mediaOverlay',
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
      name: 'blockSurface',
      type: 'string',
      title: 'Emphasis',
      description: 'Ghost, Minimal, or Subtle. Category and Media overlay use Bold (option hidden).',
      options: {
        list: [
          { value: 'ghost', title: 'Ghost' },
          { value: 'minimal', title: 'Minimal' },
          { value: 'subtle', title: 'Subtle' },
        ],
        layout: 'radio',
      },
      initialValue: 'minimal',
      hidden: ({ parent }) =>
        parent?.contentLayout === 'category' || parent?.contentLayout === 'mediaOverlay',
    }),
    defineField({
      name: 'blockAccent',
      type: 'string',
      title: 'Theming',
      options: {
        list: [
          { value: 'primary', title: 'Primary' },
          { value: 'secondary', title: 'Secondary' },
          { value: 'neutral', title: 'Neutral' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
      hidden: ({ parent }) =>
        parent?.contentLayout === 'category' || parent?.contentLayout === 'mediaOverlay',
    }),
    // Content
    defineField({
      name: 'productName',
      type: 'string',
      title: 'Product name',
      description: 'e.g. JioProduct - shown above headline with icon',
    }),
    defineField({
      name: 'headline',
      type: 'text',
      title: 'Headline',
      rows: 2,
      description: 'Press Enter for a line break.',
    }),
    defineField({
      name: 'subheadline',
      type: 'text',
      title: 'Description',
      description: 'Body text below headline (in hero section)',
      rows: 3,
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'Primary CTA Text',
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'Primary CTA Link',
    }),
    defineField({
      name: 'cta2Text',
      type: 'string',
      title: 'Secondary CTA Text',
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
      description: 'Upload or use Image URL below. Use image or video, not both.',
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
      description: 'External video URL. When set, video is shown instead of image.',
    }),
  ],
  preview: {
    select: {
      headline: 'headline',
      productName: 'productName',
      contentLayout: 'contentLayout',
      containerLayout: 'containerLayout',
    },
    prepare: ({ headline, productName, contentLayout, containerLayout }) => {
      const layoutLabel =
        contentLayout === 'mediaOverlay'
          ? 'Media overlay (band)'
          : contentLayout === 'sideBySide'
              ? containerLayout === 'contained'
                ? 'Side by side (Contained)'
                : 'Side by side (Edge to edge)'
              : contentLayout === 'textOnly'
                ? 'Text only'
                : contentLayout === 'category'
                  ? 'Category'
                  : 'Stacked'
      const inferredTitle = (headline || productName || '').toString().trim() || 'Hero'
      return { title: inferredTitle, subtitle: `Hero · ${layoutLabel}` }
    },
  },
})
