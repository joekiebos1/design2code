import { defineField, defineType } from 'sanity'
import { ColorPickerInput } from '../components/sanity/ColorPickerInput'
import { IconPickerInput } from '../components/sanity/IconPickerInput'
import { LabCardAspectRatioInput } from '../components/sanity/LabCardAspectRatioInput'
import { validateLabCardAspectRatioForPath, isLabCardAspectRatioVisible } from '../shared/labCarouselCardContext'

const isColour = (cardType: string | undefined) => !!cardType?.startsWith('colour')
const isColourNoMedia = (cardType: string | undefined) => isColour(cardType) && cardType !== 'colourMediaText'

/**
 * Lab-only unified card type. Used by labCardGrid and labCarousel.
 * Card type vocabulary matches production `cardGridItem`.
 */
export const labCardItem = defineType({
  name: 'labCardItem',
  type: 'object',
  title: 'Card',
  fields: [
    defineField({
      name: 'cardType',
      type: 'string',
      title: 'Card type',
      description: 'Same options as production card grid cards.',
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
      name: 'aspectRatio',
      type: 'string',
      title: 'Aspect ratio',
      description: 'Only editable in compact carousels (4:5 or 8:5). Other contexts lock the ratio automatically.',
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
      hidden: ({ document, path }) =>
        !isLabCardAspectRatioVisible(
          document as Parameters<typeof isLabCardAspectRatioVisible>[0],
          path,
        ),
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
      name: 'icon',
      type: 'string',
      title: 'Icon',
      description: 'DS icon name. Icon text on colour cards only.',
      components: { input: IconPickerInput },
      initialValue: 'IcMobile',
      hidden: ({ parent }) => parent?.cardType !== 'colourIconText',
    }),
    defineField({
      name: 'iconImage',
      type: 'image',
      title: 'Icon image',
      description: 'Custom image as icon. Icon text on colour cards only.',
      options: { hotspot: false },
      hidden: ({ parent }) => parent?.cardType !== 'colourIconText',
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background colour',
      description: 'Theme colours or full DS spectrum. Colour cards only.',
      components: { input: ColorPickerInput },
      initialValue: 'primary',
      hidden: ({ parent }) => !isColour(parent?.cardType),
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
      hidden: ({ parent }) => isColourNoMedia(parent?.cardType),
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded.',
      hidden: ({ parent }) => isColourNoMedia(parent?.cardType),
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => isColourNoMedia(parent?.cardType),
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      hidden: ({ parent }) => isColourNoMedia(parent?.cardType),
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'CTA label',
      description: 'Information mode only.',
      hidden: ({ parent }) => isColourNoMedia(parent?.cardType),
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'CTA link',
      hidden: ({ parent }) => isColourNoMedia(parent?.cardType) || !parent?.ctaText,
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
      return {
        title: title || 'Card',
        subtitle: labels[cardType ?? ''] ?? cardType,
      }
    },
  },
})
