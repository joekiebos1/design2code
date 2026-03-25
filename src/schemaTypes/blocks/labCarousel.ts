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
 * Lab-only carousel. Uses LabCardItem (unified card type).
 * Same card variants as labCardGrid.
 */
export const labCarouselBlock = defineType({
  name: 'labCarousel',
  type: 'object',
  title: 'Carousel',
  description: 'Lab carousel. Uses same card types as card grid.',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
    defineField({
      name: 'cardSize',
      type: 'string',
      title: 'Card size',
      description:
        'Compact (small): 3 cards per row — card aspect 4:5 or 8:5 only. Medium: 2 per row — 4:5 only. Large: 3 visible, min 3 cards — 2:1 only.',
      options: {
        list: [
          { value: 'compact', title: 'Compact' },
          { value: 'medium', title: 'Medium' },
          { value: 'large', title: 'Large' },
        ],
        layout: 'radio',
      },
      initialValue: 'compact',
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
    surfaceColourField(),
    emphasisField(),
    minimalBackgroundStyleField('emphasis'),
    // Content
    defineField({
      name: 'title',
      type: 'text',
      title: 'Section title',
      rows: 2,
      description: 'Optional heading above the carousel. Press Enter for a line break.',
    }),
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Cards',
      of: [{ type: 'labCardItem' }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Add at least one card')
          .custom((items, context) => {
            const parent = context.parent as { cardSize?: string }
            if (parent?.cardSize === 'large' && (items?.length ?? 0) < 3) {
              return 'Large carousel requires at least 3 cards'
            }
            return true
          }),
    }),
  ],
  preview: {
    select: { title: 'title', cardSize: 'cardSize', items: 'items' },
    prepare: ({ title, cardSize, items }) => {
      const inferredTitle = (title || '').toString().trim() || 'Carousel'
      return {
        title: inferredTitle,
        subtitle: `Carousel · ${cardSize ?? 'compact'} · ${items?.length ?? 0} card(s)`,
      }
    },
  },
})
