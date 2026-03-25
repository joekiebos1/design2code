import { defineField, defineType } from 'sanity'
import { ColorPickerInput } from '../../components/sanity/ColorPickerInput'
import { IconPickerInput } from '../../components/sanity/IconPickerInput'
import { LabCardAspectRatioInput } from '../../components/sanity/LabCardAspectRatioInput'
import { validateLabCardAspectRatioForPath } from '../shared/labCarouselCardContext'

const CARD_TYPE_MEDIA_BELOW = 'media-description-below'
const CARD_TYPE_MEDIA_INSIDE = 'media-description-inside'
const CARD_TYPE_TEXT_ON_COLOUR = 'text-on-colour'

/**
 * Lab-only unified card type. Used by labCardGrid and labCarousel.
 * All card variants available in both blocks.
 */
export const labCardItem = defineType({
  name: 'labCardItem',
  type: 'object',
  title: 'Card',
  fields: [
    // Layout
    defineField({
      name: 'cardType',
      type: 'string',
      title: 'Card type',
      description: 'Media below: image/video with text underneath. Media inside: text overlay on image. Text on colour: coloured background, no media.',
      options: {
        list: [
          { value: CARD_TYPE_MEDIA_BELOW, title: 'Media + description below' },
          { value: CARD_TYPE_MEDIA_INSIDE, title: 'Media + description inside' },
          { value: CARD_TYPE_TEXT_ON_COLOUR, title: 'Text on colour' },
        ],
        layout: 'radio',
      },
      initialValue: CARD_TYPE_MEDIA_BELOW,
    }),
    defineField({
      name: 'aspectRatio',
      type: 'string',
      title: 'Aspect ratio',
      description:
        'Compact carousel: 4:5 or 8:5. Medium carousel: 4:5. Large carousel: 2:1. Card grid: any of the three.',
      components: { input: LabCardAspectRatioInput },
      options: {
        list: [
          { value: '4:5', title: '4:5' },
          { value: '8:5', title: '8:5' },
          { value: '2:1', title: '2:1' },
        ],
        layout: 'radio',
      },
      initialValue: '4:5',
      validation: (Rule) =>
        Rule.custom((value, context) =>
          validateLabCardAspectRatioForPath(
            value,
            context.document as Parameters<typeof validateLabCardAspectRatioForPath>[1],
            context.path,
          ),
        ),
    }),
    defineField({
      name: 'size',
      type: 'string',
      title: 'Size',
      description: 'Text on colour only. Large: headline + description. Small: icon, CTAs, features.',
      options: {
        list: [
          { value: 'large', title: 'Large (headline + description)' },
          { value: 'small', title: 'Small (icon, CTAs, features)' },
        ],
        layout: 'radio',
      },
      initialValue: 'large',
      hidden: ({ parent }) => parent?.cardType !== CARD_TYPE_TEXT_ON_COLOUR,
    }),
    // Colour
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background colour',
      description: 'Theme colours or full DS spectrum. Text on colour only.',
      components: { input: ColorPickerInput },
      initialValue: 'primary-bold',
      hidden: ({ parent }) => parent?.cardType !== CARD_TYPE_TEXT_ON_COLOUR,
    }),
    // Content
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
    // Media (hidden for text-on-colour)
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.cardType === CARD_TYPE_TEXT_ON_COLOUR,
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded.',
      hidden: ({ parent }) => parent?.cardType === CARD_TYPE_TEXT_ON_COLOUR,
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.cardType === CARD_TYPE_TEXT_ON_COLOUR,
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      hidden: ({ parent }) => parent?.cardType === CARD_TYPE_TEXT_ON_COLOUR,
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'CTA label',
      hidden: ({ parent }) => parent?.cardType === CARD_TYPE_TEXT_ON_COLOUR,
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'CTA link',
      hidden: ({ parent }) => parent?.cardType === CARD_TYPE_TEXT_ON_COLOUR || !parent?.ctaText,
    }),
    // Text on colour extras (hidden for media)
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Icon',
      description: 'DS icon name. Small size only.',
      components: { input: IconPickerInput },
      hidden: ({ parent }) =>
        parent?.cardType !== CARD_TYPE_TEXT_ON_COLOUR || parent?.size === 'large',
    }),
    defineField({
      name: 'iconImage',
      type: 'image',
      title: 'Icon image',
      description: 'Custom image as icon. Small size only.',
      options: { hotspot: false },
      hidden: ({ parent }) =>
        parent?.cardType !== CARD_TYPE_TEXT_ON_COLOUR || parent?.size === 'large',
    }),
    defineField({
      name: 'callToActionButtons',
      type: 'array',
      title: 'Call to action buttons',
      hidden: ({ parent }) =>
        parent?.cardType !== CARD_TYPE_TEXT_ON_COLOUR || parent?.size === 'large',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() }),
            defineField({ name: 'link', type: 'string', title: 'Link' }),
            defineField({
              name: 'style',
              type: 'string',
              title: 'Button style',
              options: {
                list: [
                  { value: 'filled', title: 'Filled' },
                  { value: 'outlined', title: 'Outlined' },
                ],
                layout: 'radio',
              },
              initialValue: 'filled',
            }),
          ],
          preview: {
            select: { label: 'label' },
            prepare: ({ label }) => ({ title: label || 'CTA button' }),
          },
        },
      ],
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Features',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      hidden: ({ parent }) =>
        parent?.cardType !== CARD_TYPE_TEXT_ON_COLOUR || parent?.size === 'large',
    }),
  ],
  preview: {
    select: { title: 'title', cardType: 'cardType' },
    prepare: ({ title, cardType }) => {
      const labels: Record<string, string> = {
        [CARD_TYPE_MEDIA_BELOW]: 'Media below',
        [CARD_TYPE_MEDIA_INSIDE]: 'Media inside',
        [CARD_TYPE_TEXT_ON_COLOUR]: 'Text on colour',
      }
      return {
        title: title || 'Card',
        subtitle: labels[cardType ?? ''] ?? cardType,
      }
    },
  },
})
