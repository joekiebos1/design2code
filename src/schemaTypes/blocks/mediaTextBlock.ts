import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'

export const mediaTextBlock = defineType({
  name: 'mediaTextBlock',
  type: 'object',
  title: 'Media + Text',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow',
      description: 'Small label above the headline (e.g. "MOBILE GAMES").',
    }),
    defineField({
      name: 'subhead',
      type: 'text',
      title: 'Subhead',
      description: 'Secondary headline below the main title. Press Enter for a line break.',
      rows: 2,
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'titleLevel',
      type: 'string',
      title: 'Heading level',
      description: 'Semantic level for accessibility and size. AI can assign based on document structure.',
      options: {
        list: [
          { value: 'h2', title: 'H2' },
          { value: 'h3', title: 'H3' },
          { value: 'h4', title: 'H4' },
        ],
        layout: 'radio',
      },
      initialValue: 'h2',
      hidden: ({ parent }) => !parent?.title,
    }),
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body',
      rows: 4,
    }),
    defineField({
      name: 'bulletList',
      type: 'array',
      title: 'Bullet list',
      description: 'Max 6 bullets. Shown in centered-media-below and feature layouts.',
      validation: (Rule) => Rule.max(6),
      of: [{ type: 'string' }],
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
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded. Also used as poster for video.',
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      description: 'Optional video. When set, video is shown instead of image. Autoplay with mute/play controls.',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'External video URL. Used when no video is uploaded.',
    }),
    defineField({
      name: 'size',
      type: 'string',
      title: 'Size',
      description: 'Narrative weight: hero (largest), feature (standard), editorial (compact).',
      options: {
        list: [
          { value: 'hero', title: 'Hero' },
          { value: 'feature', title: 'Feature' },
          { value: 'editorial', title: 'Editorial' },
        ],
        layout: 'radio',
      },
      initialValue: 'feature',
    }),
    defineField({
      name: 'contentWidth',
      type: 'string',
      title: 'Content width',
      description: 'XS (4 cols), S (6), M (8), Default (10), Wide (12). Edge to edge = full viewport width. For Stacked/HeroOverlay, Default = contained.',
      options: {
        list: [
          { value: 'XS', title: 'XS (4 cols)' },
          { value: 'S', title: 'S (6 cols)' },
          { value: 'M', title: 'M (8 cols)' },
          { value: 'Default', title: 'Default (10 cols)' },
          { value: 'Wide', title: 'Wide (12 cols)' },
          { value: 'edgeToEdge', title: 'Edge to edge (full width)' },
        ],
        layout: 'radio',
      },
      initialValue: 'Default',
      hidden: ({ parent }) => parent?.template === 'TextOnly',
    }),
    defineField({
      name: 'template',
      type: 'string',
      title: 'Layout',
      description: '50/50: text and image side by side (choose image left or right). HeroOverlay: full bleed image with overlay. Stacked: large image with text above or below. TextOnly: no media.',
      options: {
        list: [
          { value: 'SideBySide', title: '50/50 – Image left or right' },
          { value: 'HeroOverlay', title: 'HeroOverlay – Full bleed image with text overlay' },
          { value: 'Stacked', title: 'Stacked – Large image with text (above or below)' },
          { value: 'TextOnly', title: 'TextOnly – No media, text only' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'SideBySide',
    }),
    defineField({
      name: 'align',
      type: 'string',
      title: 'Text alignment',
      description: 'Left or center aligned. Applies to all text in this block.',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      hidden: ({ parent }) => parent?.template === 'HeroOverlay' || parent?.template === 'Stacked',
    }),
    defineField({
      name: 'imagePosition',
      type: 'string',
      title: 'Image position',
      description: 'For 50/50 layout: image on the left or right.',
      options: {
        list: [
          { value: 'left', title: 'Image left' },
          { value: 'right', title: 'Image right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
      hidden: ({ parent }) => ['HeroOverlay', 'Stacked', 'TextOnly'].includes(parent?.template ?? ''),
    }),
    defineField({
      name: 'overlayAlignment',
      type: 'string',
      title: 'Text alignment',
      description: 'For full bleed hero only',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      hidden: ({ parent }) => parent?.template !== 'HeroOverlay',
    }),
    defineField({
      name: 'stackImagePosition',
      type: 'string',
      title: 'Image position',
      description: 'For Stacked layout: image on top or bottom',
      options: {
        list: [
          { value: 'top', title: 'Image on top' },
          { value: 'bottom', title: 'Image on bottom' },
        ],
        layout: 'radio',
      },
      initialValue: 'top',
      hidden: ({ parent }) => parent?.template !== 'Stacked',
    }),
    defineField({
      name: 'stackAlignment',
      type: 'string',
      title: 'Text alignment',
      description: 'Left or center aligned. Use one alignment per block.',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      hidden: ({ parent }) => parent?.template !== 'Stacked',
    }),
    defineField({
      name: 'blockBackground',
      type: 'string',
      title: 'Block background',
      description: 'Full-width background. Uses DS surface tokens. Ghost = none, Minimal = neutral grey, Subtle = primary tint, Bold = brand colour.',
      options: {
        list: [
          { value: 'ghost', title: 'Ghost (no background)' },
          { value: 'minimal', title: 'Minimal (neutral gray)' },
          { value: 'subtle', title: 'Subtle (primary tint)' },
          { value: 'bold', title: 'Bold (brand colour)' },
        ],
        layout: 'radio',
      },
      initialValue: 'ghost',
    }),
    defineField({
      name: 'mediaStyle',
      type: 'string',
      title: 'Media style',
      description: 'Contained: image inside block with padding and border radius. Overflow: bottom-aligned image, top-aligned with text, bleeds below; with background colour, uses specific spacing rules.',
      options: {
        list: [
          { value: 'contained', title: 'Contained' },
          { value: 'overflow', title: 'Overflow (bottom aligned)' },
        ],
        layout: 'radio',
      },
      initialValue: 'contained',
      hidden: ({ parent }) => ['HeroOverlay', 'TextOnly'].includes(parent?.template ?? ''),
    }),
    defineField({
      name: 'imageAspectRatio',
      type: 'string',
      title: 'Image aspect ratio',
      description: '50/50 (contained): 4:3, 3:4, 1:1. Full-width layouts: 16:7, 16:9, 21:9.',
      options: {
        list: [
          { value: '4:3', title: '4:3' },
          { value: '3:4', title: '3:4' },
          { value: '1:1', title: '1:1 (square)' },
          { value: '16:7', title: '16:7 (1440×630)' },
          { value: '16:9', title: '16:9 (widescreen)' },
          { value: '21:9', title: '21:9 (cinematic)' },
        ],
        layout: 'dropdown',
      },
      initialValue: '4:3',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      template: 'template',
      imagePosition: 'imagePosition',
    },
    prepare: ({ title, template, imagePosition }) => {
      const layoutLabels: Record<string, string> = {
        SideBySide: '50/50',
        HeroOverlay: 'HeroOverlay',
        Stacked: 'Stacked',
        TextOnly: 'TextOnly',
      }
      const layout = layoutLabels[template || 'SideBySide'] ?? template
      const posLabel = template === 'SideBySide' && imagePosition ? ` · Image ${imagePosition}` : ''
      return {
        title: title || 'Media + Text',
        subtitle: `Media and text · ${layout}${posLabel}`,
      }
    },
  },
})
