import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { surfaceColourField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import {
  labBlockCallToActionsField,
  labBlockSectionDescriptionField,
} from '../shared/labBlockFramingFields'

/**
 * Lab-only Card grid: media cards (image below/inside) + text inside cards in one block.
 * Production uses cardGrid (media only). Lab uses this unified block.
 */
export const labCardGridBlock = defineType({
  name: 'labCardGrid',
  type: 'object',
  title: 'Card grid',
  description:
    'Grid of 2, 3, or 4 cards. Add media cards (image with text below or overlay) or text inside cards (coloured background, no image).',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'columns',
      type: 'string',
      title: 'Layout',
      description: 'Number of cards per row on desktop (2, 3, or 4).',
      options: {
        list: [
          { value: '2', title: '2' },
          { value: '3', title: '3' },
          { value: '4', title: '4' },
        ],
        layout: 'radio',
      },
      initialValue: '3',
    }),
    defineField({
      name: 'theme',
      type: 'string',
      title: 'Theme',
      options: {
        list: [...DS_THEMES],
        layout: 'dropdown',
      },
      initialValue: DS_THEME_DEFAULT,
    }),
    surfaceColourField(),
    emphasisField(),
    minimalBackgroundStyleField('emphasis'),
    defineField({
      name: 'title',
      type: 'text',
      title: 'Section title',
      rows: 2,
    }),
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Cards',
      description: 'Media cards (image + text) or text on colour cards. Same card types as carousel.',
      of: [{ type: 'labCardItem' }],
      validation: (Rule) => Rule.required().min(1).max(12),
    }),
  ],
  preview: {
    select: { title: 'title', columns: 'columns', items: 'items' },
    prepare: ({ title, columns, items }) => {
      const inferredTitle = (title || '').toString().trim() || 'Card grid'
      return {
        title: inferredTitle,
        subtitle: `Card grid · ${columns ?? '3'} cols · ${items?.length ?? 0} card(s)`,
      }
    },
  },
})
