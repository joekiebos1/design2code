import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'

/** Helper to get the list block from document and path (for array item fields). */
function getListBlockFromPath(document: { sections?: Array<{ listVariant?: string }> }, path: unknown[]): { listVariant?: string } | undefined {
  const sections = document?.sections
  if (!sections || !Array.isArray(path) || path[0] !== 'sections') return undefined
  const sectionIndex = path[1]
  if (typeof sectionIndex !== 'number') return undefined
  return sections[sectionIndex]
}

export const listItem = defineType({
  name: 'listItem',
  type: 'object',
  title: 'List item',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'For text list: item title. For FAQ: question.',
      hidden: ({ document, path }) => getListBlockFromPath(document as { sections?: Array<{ listVariant?: string }> }, path as unknown[])?.listVariant === 'links',
    }),
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body',
      description: 'For text list: body text. For FAQ: answer.',
      rows: 3,
      hidden: ({ document, path }) => getListBlockFromPath(document as { sections?: Array<{ listVariant?: string }> }, path as unknown[])?.listVariant === 'links',
    }),
    defineField({
      name: 'linkText',
      type: 'string',
      title: 'Link text',
      description: 'Optional text link (text list only).',
      hidden: ({ document, path }) => {
        const block = getListBlockFromPath(document as { sections?: Array<{ listVariant?: string }> }, path as unknown[])
        return block?.listVariant !== 'textList'
      },
    }),
    defineField({
      name: 'linkUrl',
      type: 'string',
      title: 'Link URL',
      description: 'URL for the link (text list: optional. Links: required).',
      hidden: ({ document, path }) => {
        const block = getListBlockFromPath(document as { sections?: Array<{ listVariant?: string }> }, path as unknown[])
        return block?.listVariant === 'faq'
      },
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      title: 'Subtitle',
      description: 'Clickable link text (links variant only). Slightly larger than regular text link.',
      hidden: ({ document, path }) => getListBlockFromPath(document as { sections?: Array<{ listVariant?: string }> }, path as unknown[])?.listVariant !== 'links',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', body: 'body' },
    prepare: ({ title, subtitle, body }) => ({
      title: title || subtitle || (body ? String(body).slice(0, 40) + '…' : 'List item'),
    }),
  },
})

export const listBlock = defineType({
  name: 'list',
  type: 'object',
  title: 'List',
  description: 'Left: block title. Right: one of three list patterns – Text list (title + body + optional link), FAQ (accordion), or Links (clickable subtitles).',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
    defineField({
      name: 'listVariant',
      type: 'string',
      title: 'Variant',
      description: 'Choose one pattern. Cannot mix.',
      options: {
        list: [
          { value: 'textList', title: 'Text list – Title + body + optional link' },
          { value: 'faq', title: 'FAQ – Accordion (question + answer)' },
          { value: 'links', title: 'Links – Clickable subtitles' },
        ],
        layout: 'radio',
      },
      initialValue: 'textList',
      validation: (Rule) => Rule.required(),
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
      description: 'Ghost = no background. Minimal = light tint, Subtle = medium tint, Bold = strong tint.',
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
    minimalBackgroundStyleField('blockSurface'),
    // Content
    defineField({
      name: 'blockTitle',
      type: 'string',
      title: 'Block title',
      description: 'Shown on the left side.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      of: [{ type: 'listItem' }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Add at least one item'),
    }),
  ],
  preview: {
    select: { blockTitle: 'blockTitle', listVariant: 'listVariant', items: 'items' },
    prepare: ({ blockTitle, listVariant, items }) => ({
      title: blockTitle || 'List',
      subtitle: `${listVariant ?? 'textList'} · ${items?.length ?? 0} item(s)`,
    }),
  },
})
