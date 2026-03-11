import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'

export const carouselBlock = defineType({
  name: 'carousel',
  type: 'object',
  title: 'Carousel',
  description: 'A horizontal carousel of cards with navigation arrows.',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
    defineField({
      name: 'cardSize',
      type: 'string',
      title: 'Card size',
      description: 'Compact: 3 cards per row. Medium: 2 cards per row (4:5). Large: 1 card per row (2:1).',
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
      name: 'surface',
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
    minimalBackgroundStyleField('surface'),
    // Content
    defineField({
      name: 'title',
      type: 'text',
      title: 'Section title',
      rows: 2,
      description: 'Optional heading above the carousel. Press Enter for a line break.',
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
