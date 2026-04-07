import { defineField, defineType } from 'sanity'
import { ColorPickerInput } from '../components/sanity/ColorPickerInput'

export const cardItem = defineType({
  name: 'cardItem',
  type: 'object',
  title: 'Card',
  fields: [
    defineField({
      name: 'cardType',
      type: 'string',
      title: 'Card type',
      description: 'Media text stacked: image/video with optional text below. Large text on colour: text on coloured background (no media). Large carousel: media only.',
      options: {
        list: [
          { value: 'mediaTextBelow', title: 'Media (image/video)' },
          { value: 'colourFeatured', title: 'Large text on colour' },
        ],
        layout: 'radio',
      },
      initialValue: 'mediaTextBelow',
      hidden: ({ document, path }) => {
        const sections = document?.sections as Array<{ _type?: string; cardSize?: string; _key?: string }> | undefined
        if (!sections || !Array.isArray(path) || path[0] !== 'sections') return false
        const sectionSegment = path[1]
        let block: { _type?: string; cardSize?: string } | undefined
        if (typeof sectionSegment === 'number') {
          block = sections[sectionSegment]
        } else if (sectionSegment && typeof sectionSegment === 'object' && '_key' in sectionSegment) {
          block = sections.find((s) => s?._key === (sectionSegment as { _key: string })._key)
        }
        return block?._type === 'carousel' && block?.cardSize === 'large'
      },
    }),
    defineField({
      name: 'aspectRatio',
      type: 'string',
      title: 'Card size',
      description: 'Compact carousel only: 4:5 = 1 slot, 8:5 = 2 slots. Hidden when carousel Card size is Large (2:1) or Medium (4:5).',
      options: {
        list: [
          { value: '4:5', title: '4:5 (1 slot)' },
          { value: '8:5', title: '8:5 (2 slots)' },
        ],
        layout: 'radio',
      },
      initialValue: '4:5',
      hidden: ({ document, path }) => {
        const sections = document?.sections as Array<{ _type?: string; cardSize?: string; _key?: string }> | undefined
        if (!sections || !Array.isArray(path) || path[0] !== 'sections') return false
        const sectionSegment = path[1]
        let block: { _type?: string; cardSize?: string } | undefined
        if (typeof sectionSegment === 'number') {
          block = sections[sectionSegment]
        } else if (sectionSegment && typeof sectionSegment === 'object' && '_key' in sectionSegment) {
          block = sections.find((s) => s?._key === (sectionSegment as { _key: string })._key)
        }
        return block?._type === 'carousel' && (block?.cardSize === 'large' || block?.cardSize === 'medium')
      },
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'Background colour',
      description: 'Theme colours or full DS spectrum.',
      components: { input: ColorPickerInput },
      initialValue: 'primary-bold',
      hidden: ({ parent }) => parent?.cardType !== 'colourFeatured',
    }),
    defineField({
      name: 'title',
      type: 'text',
      title: 'Title',
      rows: 2,
      description: 'Required for large text on colour. Optional for media cards. Press Enter for a line break.',
      validation: (Rule) =>
        Rule.custom((title, ctx) => {
          const parent = (ctx as { parent?: { cardType?: string; imageUrl?: string; image?: unknown; video?: unknown; videoUrl?: string } })?.parent
          if (parent?.cardType === 'colourFeatured') {
            return (title && String(title).trim()) ? true : 'Title is required for large text on colour cards.'
          }
          const hasMedia = !!(parent?.imageUrl || parent?.image || parent?.video || parent?.videoUrl)
          if (hasMedia) return true
          if (title && String(title).trim()) return true
          return 'Title is required for text-only cards.'
        }),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 2,
      description: 'Body text. Media cards: optional. Large text on colour: primary content.',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      description: 'Upload or use Image URL below. Optional when video is set.',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.cardType === 'colourFeatured',
      validation: (Rule) =>
        Rule.custom((image, ctx) => {
          const parent = (ctx as { parent?: { cardType?: string; imageUrl?: string; video?: unknown; videoUrl?: string } })?.parent
          if (parent?.cardType === 'colourFeatured') return true
          if (image || parent?.imageUrl) return true
          if (parent?.video || parent?.videoUrl) return true
          return true
        }),
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded. Also used as poster for video.',
      hidden: ({ parent }) => parent?.cardType === 'colourFeatured',
    }),
    defineField({
      name: 'video',
      type: 'file',
      title: 'Video (upload)',
      description: 'Optional video. When set, video is shown instead of image. Autoplay with mute/play controls.',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.cardType === 'colourFeatured',
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'External video URL. Used when no video is uploaded.',
      hidden: ({ parent }) => parent?.cardType === 'colourFeatured',
    }),
    defineField({
      name: 'link',
      type: 'string',
      title: 'Link',
      description: 'Optional link for the card. Media cards only.',
      hidden: ({ parent }) => parent?.cardType === 'colourFeatured',
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'Button label',
      description: 'Optional button (low emphasis). Requires a link. Media cards only.',
      hidden: ({ parent }) => parent?.cardType === 'colourFeatured',
    }),
  ],
  preview: {
    select: { title: 'title', cardType: 'cardType' },
    prepare: ({ title, cardType }) => ({
      title: title || 'Card',
      subtitle: cardType === 'colourFeatured' ? 'Large text on colour' : 'Media',
    }),
  },
})

export const cardBlock = defineType({
  name: 'cardBlock',
  type: 'object',
  title: 'Card grid',
  description: 'A grid of cards. Reserved for CardGrid block.',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section title',
      description: 'Optional heading above the cards',
    }),
    defineField({
      name: 'textPosition',
      type: 'string',
      title: 'Text position',
      options: {
        list: [
          { value: 'top', title: 'Top' },
          { value: 'bottom', title: 'Bottom' },
        ],
        layout: 'radio',
      },
      initialValue: 'bottom',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Cards',
      of: [{ type: 'cardItem' }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Add at least one card'),
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare: ({ title, items }) => ({
      title: title || 'Card grid',
      subtitle: `${items?.length ?? 0} card(s)`,
    }),
  },
})
