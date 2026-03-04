import { defineField, defineType } from 'sanity'

export const cardItem = defineType({
  name: 'cardItem',
  type: 'object',
  title: 'Card',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Required for text-only cards. Optional for media-only cards.',
      validation: (Rule) =>
        Rule.custom((title, ctx) => {
          const parent = (ctx as { parent?: { imageUrl?: string; image?: unknown; video?: unknown; videoUrl?: string } })?.parent
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
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (upload)',
      description: 'Upload or use Image URL below. Optional when video is set.',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((image, ctx) => {
          const parent = (ctx as { parent?: { imageUrl?: string; video?: unknown; videoUrl?: string } })?.parent
          if (image || parent?.imageUrl) return true
          if (parent?.video || parent?.videoUrl) return true
          // Allow text-only cards (e.g. when source has no media)
          return true
        }),
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
      name: 'cardType',
      type: 'string',
      title: 'Card type',
      description: 'Media: image/video with optional text below. Text on colour: text on coloured background (no media). Large carousel: media only.',
      options: {
        list: [
          { value: 'media', title: 'Media (image/video)' },
          { value: 'text-on-colour', title: 'Text on colour' },
        ],
        layout: 'radio',
      },
      initialValue: 'media',
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
      description: 'Compact carousel only: 4:5 = 1 slot, 8:5 = 2 slots (wider), 2:1 = 2 slots. Hidden when carousel Card size is Large (2:1) or Medium (4:5).',
      options: {
        list: [
          { value: '4:5', title: '4:5 (1 slot)' },
          { value: '8:5', title: '8:5 (2 slots)' },
          { value: '2:1', title: '2:1 (wider)' },
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
      name: 'link',
      type: 'string',
      title: 'Link',
      description: 'Optional link for the card. Use relative paths (e.g. /games/play) or full URLs (e.g. https://example.com).',
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'Button label',
      description: 'Optional button (low emphasis). Requires a link.',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({
      title: title || 'Card',
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
