import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'

export const carouselBlock = defineType({
  name: 'carousel',
  type: 'object',
  title: 'Carousel',
  description: 'A horizontal carousel of cards with navigation arrows.',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Carousel variant',
      description: `Variant A — Featured (buttons on sides): Feature product highlights in a large, rich way. Use short videos or striking images for key features at a glance. Placement: top or body of page only, never at bottom. Constraints: large cards only, default width.

Variant B — Informative (buttons below): Inform, educate, showcase detailed functionality, or create an overview of items that link to other sections. Content is more detailed, less impactful, more informative. Placement: anywhere on page, including bottom. Constraints: card shapes 4:5 and 8:5.`,
      options: {
        list: [
          {
            value: 'featured',
            title: 'Featured (buttons on sides)',
          },
          {
            value: 'informative',
            title: 'Informative (buttons below)',
          },
        ],
        layout: 'radio',
      },
      initialValue: 'informative',
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section title',
      description: 'Optional heading above the carousel',
    }),
    defineField({
      name: 'cardSize',
      type: 'string',
      title: 'Card size',
      description: 'Compact: 3 cards per row, 4:5 and 8:5 interchangeable. Large 2:1: 1 card spanning Default width, 2:1 only. Large 4:5: 2 cards per row (S width each), 4:5 only.',
      options: {
        list: [
          { value: 'compact', title: 'Compact (3 per row, 4:5 and 8:5)' },
          { value: 'large', title: 'Large 2:1 (1 per row, Default width)' },
          { value: 'large-4x5', title: 'Large 4:5 (2 per row, S width each)' },
        ],
        layout: 'radio',
      },
      initialValue: 'compact',
    }),
    defineField({
      name: 'titleLevel',
      type: 'string',
      title: 'Heading level',
      description: 'Semantic level for accessibility and size.',
      options: {
        list: [
          { value: 'h2', title: 'H2' },
          { value: 'h3', title: 'H3' },
          { value: 'h4', title: 'H4' },
        ],
        layout: 'radio',
      },
      initialValue: 'h2',
      hidden: ({ parent }) => !parent?.title,
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
      title: title || 'Carousel',
      subtitle: `${items?.length ?? 0} card(s)`,
    }),
  },
})
