import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { surfaceColourField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'

function getLabAsymmetricSectionFromPath(
  document: { sections?: Array<{ variant?: string; paragraphLayout?: string }> },
  path: unknown[],
): { variant?: string; paragraphLayout?: string } | undefined {
  const sections = document?.sections
  if (!sections || !Array.isArray(path) || path[0] !== 'sections') return undefined
  const sectionIndex = path[1]
  if (typeof sectionIndex !== 'number') return undefined
  return sections[sectionIndex]
}

/** Lab-only: merged paragraph rows (optional title per row, body size per row, optional link). */
export const labMediaTextAsymmetricParagraphRow = defineType({
  name: 'labMediaTextAsymmetricParagraphRow',
  type: 'object',
  title: 'Paragraph',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section title',
      description: 'Optional. Leave empty for body-only.',
    }),
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body',
      rows: 5,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'linkText',
      type: 'string',
      title: 'Link text',
      description: 'Optional text link.',
      hidden: ({ document, path }) => {
        const block = getLabAsymmetricSectionFromPath(
          document as { sections?: Array<{ variant?: string; paragraphLayout?: string }> },
          path as unknown[],
        )
        return block?.variant !== 'paragraphs' || block?.paragraphLayout === 'single'
      },
    }),
    defineField({
      name: 'linkUrl',
      type: 'string',
      title: 'Link URL',
      description: 'URL for the optional link.',
      hidden: ({ document, path }) => {
        const block = getLabAsymmetricSectionFromPath(
          document as { sections?: Array<{ variant?: string; paragraphLayout?: string }> },
          path as unknown[],
        )
        return block?.variant !== 'paragraphs' || block?.paragraphLayout === 'single'
      },
    }),
  ],
  preview: {
    select: { title: 'title', body: 'body' },
    prepare: ({ title, body }) => {
      const b = body ? String(body).replace(/\s+/g, ' ') : ''
      const lead =
        title && String(title).trim().length > 0 ? String(title) : b.length > 0 ? (b.length > 60 ? `${b.slice(0, 60)}…` : b) : 'Paragraph'
      return {
        title: lead,
        subtitle: 'Section',
      }
    },
  },
})

export const labMediaTextAsymmetricBlock = defineType({
  name: 'labMediaTextAsymmetric',
  type: 'object',
  title: 'Media + Text Asymmetric (Lab)',
  description:
    'Rail title on the left; main column is one pattern at a time: paragraphs, FAQ, link list, or image. Long-form / editorial pages.',
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
      name: 'variant',
      type: 'string',
      title: 'Pattern',
      group: 'layout',
      description: 'One pattern per block (no mixing).',
      options: {
        list: [
          { value: 'paragraphs', title: 'Paragraphs – section title + body (+ optional link)' },
          { value: 'faq', title: 'FAQ – accordion (question + answer)' },
          { value: 'links', title: 'Link list – clickable labels' },
          { value: 'image', title: 'Image – photo in main column (aspect ratio)' },
        ],
        layout: 'radio',
      },
      initialValue: 'paragraphs',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'paragraphLayout',
      type: 'string',
      title: 'Paragraph layout',
      group: 'content',
      description: 'Single column of body text, or multiple sections (title + body per row).',
      options: {
        list: [
          { value: 'single', title: 'Single — one text column' },
          { value: 'multi', title: 'Multi — section titles + body (uniform typography)' },
        ],
        layout: 'radio',
      },
      initialValue: 'multi',
      hidden: ({ parent }) => parent?.variant !== 'paragraphs',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { variant?: string }
          if (parent?.variant !== 'paragraphs') return true
          if (value === 'single' || value === 'multi') return true
          return 'Choose single or multi'
        }),
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
      ...surfaceColourField(),
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
      name: 'blockTitle',
      type: 'string',
      title: 'Rail title',
      group: 'content',
      description:
        'Shown in the left column only. Leave empty on a follow-up block to continue under the previous rail title.',
    }),
    defineField({
      name: 'singleColumnBody',
      type: 'text',
      title: 'Body',
      group: 'content',
      description: 'One main text column. No per-section titles.',
      rows: 10,
      hidden: ({ parent }) => parent?.variant !== 'paragraphs' || parent?.paragraphLayout !== 'single',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { variant?: string; paragraphLayout?: string }
          if (parent?.variant !== 'paragraphs' || parent?.paragraphLayout !== 'single') return true
          const t = typeof value === 'string' ? value.trim() : ''
          if (t.length < 1) return 'Add body text'
          return true
        }),
    }),
    defineField({
      name: 'paragraphRows',
      type: 'array',
      title: 'Sections',
      group: 'content',
      description: 'Each row: optional section title, body, optional link. Typography is the same for every section.',
      of: [{ type: 'labMediaTextAsymmetricParagraphRow' }],
      hidden: ({ parent }) =>
        parent?.variant !== 'paragraphs' || parent?.paragraphLayout === 'single',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { variant?: string; paragraphLayout?: string }
          if (parent?.variant !== 'paragraphs' || parent?.paragraphLayout === 'single') return true
          const rows = Array.isArray(value) ? value : []
          const hasBody = rows.some((r) => {
            const row = r as { body?: string }
            return typeof row?.body === 'string' && row.body.trim().length > 0
          })
          if (!hasBody) return 'Add at least one section with body text'
          return true
        }),
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      group: 'content',
      of: [{ type: 'mediaTextAsymmetricItem' }],
      hidden: ({ parent }) => parent?.variant === 'paragraphs' || parent?.variant === 'image',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { variant?: string }
          if (parent?.variant === 'paragraphs' || parent?.variant === 'image') {
            return true
          }
          if (!value || value.length < 1) return 'Add at least one item'
          return true
        }),
    }),
    defineField({
      name: 'imageAspectRatio',
      type: 'string',
      title: 'Image aspect ratio',
      group: 'media',
      options: {
        list: [
          { value: '5:4', title: '5:4 (landscape)' },
          { value: '1:1', title: '1:1 (square)' },
          { value: '4:5', title: '4:5 (portrait)' },
        ],
        layout: 'radio',
      },
      initialValue: '4:5',
      hidden: ({ parent }) => parent?.variant !== 'image',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { variant?: string }
          if (parent?.variant !== 'image') return true
          if (value === '5:4' || value === '1:1' || value === '4:5') return true
          return 'Choose an aspect ratio'
        }),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      group: 'media',
      description: 'From the Media Library. Use Image URL below if empty.',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.variant !== 'image',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { variant?: string; imageUrl?: string }
          if (parent?.variant !== 'image') return true
          const hasAsset = Boolean(
            value && typeof value === 'object' && 'asset' in value && (value as { asset?: unknown }).asset,
          )
          const url = typeof parent.imageUrl === 'string' ? parent.imageUrl.trim() : ''
          if (hasAsset || url.length > 0) return true
          return 'Add an image from the library or an image URL'
        }),
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      group: 'media',
      description: 'Used when no image is uploaded. Prefer the Media Library.',
      hidden: ({ parent }) => parent?.variant !== 'image',
    }),
    defineField({
      name: 'imageAlt',
      type: 'string',
      title: 'Image alt text',
      group: 'media',
      hidden: ({ parent }) => parent?.variant !== 'image',
    }),
  ],
  preview: {
    select: {
      blockTitle: 'blockTitle',
      variant: 'variant',
      paragraphLayout: 'paragraphLayout',
      items: 'items',
      paragraphRows: 'paragraphRows',
      imageAspectRatio: 'imageAspectRatio',
    },
    prepare: ({ blockTitle, variant, paragraphLayout, items, paragraphRows, imageAspectRatio }) => {
      const v = variant != null && variant !== '' ? variant : 'paragraphs'
      let count: string
      if (v === 'paragraphs') {
        if (paragraphLayout === 'single') {
          count = 'single column'
        } else {
          const n = Array.isArray(paragraphRows) ? paragraphRows.length : 0
          count = `${n} section${n === 1 ? '' : 's'}`
        }
      } else if (v === 'image') {
        count = String(imageAspectRatio ?? '4:5')
      } else {
        const n = Array.isArray(items) ? items.length : 0
        count = `${n} item(s)`
      }
      const trimmed =
        typeof blockTitle === 'string' && blockTitle.trim().length > 0 ? blockTitle.trim() : null
      return {
        title: trimmed ?? '(continuation)',
        subtitle: `${v} · ${count}`,
      }
    },
  },
})
