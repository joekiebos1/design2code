import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { appearanceField, emphasisField } from '../shared/blockColourFields'
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
    defineField({
      name: 'interaction',
      type: 'string',
      title: 'Card interaction',
      description: 'Information: cards display content with optional CTA inside. Navigation: entire card is a link.',
      options: {
        list: [
          { value: 'information', title: 'Information' },
          { value: 'navigation', title: 'Navigation' },
        ],
        layout: 'radio',
      },
      initialValue: 'information',
    }),
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
    appearanceField(),
    emphasisField(),
    minimalBackgroundStyleField('emphasis'),
    defineField({
      name: 'cardSurface',
      type: 'string',
      title: 'Card surface',
      description: 'Surface treatment for colour cards. Cannot match the block emphasis. Defaults based on block emphasis if not set.',
      options: {
        list: [
          { value: 'minimal', title: 'Minimal' },
          { value: 'subtle', title: 'Subtle' },
          { value: 'moderate', title: 'Moderate' },
          { value: 'bold', title: 'Bold' },
          { value: 'inverted', title: 'Inverted (white)' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true
          const parent = context.parent as { emphasis?: string }
          const emphasis = parent?.emphasis ?? 'ghost'
          if (value === emphasis) return `Card surface cannot match block emphasis (${emphasis}).`
          return true
        }),
    }),
    // Content — eyebrow → title → description (same order as Hero / Media + Text stacked)
    defineField({
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow',
      description: 'Optional short line above the section title.',
    }),
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
    select: { eyebrow: 'eyebrow', title: 'title', cardSize: 'cardSize', items: 'items' },
    prepare: ({ eyebrow, title, cardSize, items }) => {
      const inferredTitle = (title || '').toString().trim() || 'Carousel'
      const sub = (eyebrow || '').toString().trim()
      return {
        title: inferredTitle,
        subtitle: sub
          ? `${sub} · Carousel · ${cardSize ?? 'compact'} · ${items?.length ?? 0} card(s)`
          : `Carousel · ${cardSize ?? 'compact'} · ${items?.length ?? 0} card(s)`,
      }
    },
  },
})
