import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'

export const mediaTextBlock = defineType({
  name: 'mediaTextBlock',
  type: 'object',
  title: 'Media + Text stacked',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
    defineField({
      name: 'template',
      type: 'string',
      title: 'Variant',
      description: 'HeroOverlay: full bleed image with overlay. Stacked: large image with text above or below. TextOnly: no media. For 50/50 layouts use Media + Text 50/50 block.',
      options: {
        list: [
          { value: 'HeroOverlay', title: 'HeroOverlay – Full bleed image with text overlay' },
          { value: 'Stacked', title: 'Stacked – Large image with text (above or below)' },
          { value: 'TextOnly', title: 'TextOnly – No media, text only' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'Stacked',
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
      name: 'mediaSize',
      type: 'string',
      title: 'Media size',
      description: 'Edge to edge: full viewport, text always center. Default: contained width, choose left or center alignment.',
      options: {
        list: [
          { value: 'edgeToEdge', title: 'Edge to edge' },
          { value: 'default', title: 'Default width' },
        ],
        layout: 'radio',
      },
      initialValue: 'default',
      hidden: ({ parent }) => parent?.template !== 'Stacked',
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
      name: 'stackAlignment',
      type: 'string',
      title: 'Text alignment',
      description: 'Left or center. Only shown when media is Default width (edge-to-edge is always center).',
      options: {
        list: [
          { value: 'left', title: 'Left' },
          { value: 'center', title: 'Center' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
      hidden: ({ parent }) =>
        parent?.template !== 'Stacked' || parent?.mediaSize === 'edgeToEdge',
    }),
    defineField({
      name: 'textOnlyAlignment',
      type: 'string',
      title: 'Text alignment',
      description: 'For TextOnly layout: center or left. Left: title M width, body S width, aligned to Default grid.',
      options: {
        list: [
          { value: 'center', title: 'Center' },
          { value: 'left', title: 'Left' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
      hidden: ({ parent }) => parent?.template !== 'TextOnly',
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
      name: 'blockBackground',
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
    minimalBackgroundStyleField('blockBackground'),
    // Content
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
      type: 'text',
      title: 'Title',
      rows: 2,
      description: 'Press Enter for a line break.',
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
      hidden: ({ parent }) => parent?.template === 'TextOnly',
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded. Also used as poster for video.',
      hidden: ({ parent }) => parent?.template === 'TextOnly',
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      description: 'Optional video. When set, video is shown instead of image. Autoplay with mute/play controls.',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.template === 'TextOnly',
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'External video URL. Used when no video is uploaded.',
      hidden: ({ parent }) => parent?.template === 'TextOnly',
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
        HeroOverlay: 'HeroOverlay',
        Stacked: 'Stacked',
        TextOnly: 'TextOnly',
      }
      const layout = layoutLabels[template || 'Stacked'] ?? template
      const inferredTitle = (title || eyebrow || '').toString().trim() || 'Media + Text stacked'
      return {
        title: inferredTitle,
        subtitle: `Media + Text stacked · ${layout}`,
      }
    },
  },
})
