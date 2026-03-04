import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'

export const heroBlock = defineType({
  name: 'hero',
  type: 'object',
  title: 'Hero',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Variant',
      description: 'Category: full-width hero. Product: compact layout. Ghost: no background. Full screen image: image as background with overlaid content.',
      options: {
        list: [
          { value: 'category', title: 'Category' },
          { value: 'product', title: 'Product' },
          { value: 'ghost', title: 'Ghost (no background)' },
          { value: 'fullscreen', title: 'Full screen image' },
        ],
        layout: 'radio',
      },
      initialValue: 'category',
    }),
    defineField({
      name: 'productName',
      type: 'string',
      title: 'Product name',
      description: 'e.g. JioProduct - shown above headline with icon',
    }),
    defineField({
      name: 'headline',
      type: 'string',
      title: 'Headline',
    }),
    defineField({
      name: 'subheadline',
      type: 'text',
      title: 'Description',
      description: 'Body text below headline (in hero section)',
      rows: 3,
    }),
    defineField({
      name: 'ctaText',
      type: 'string',
      title: 'Primary CTA Text',
    }),
    defineField({
      name: 'ctaLink',
      type: 'string',
      title: 'Primary CTA Link',
    }),
    defineField({
      name: 'cta2Text',
      type: 'string',
      title: 'Secondary CTA Text',
    }),
    defineField({
      name: 'cta2Link',
      type: 'string',
      title: 'Secondary CTA Link',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Key visual (upload)',
      description: 'Upload or use Image URL below',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External image URL. Used when no image is uploaded.',
    }),
  ],
  preview: {
    select: { headline: 'headline', variant: 'variant' },
    prepare: ({ headline, variant }) => ({
      title: headline || 'Hero',
      subtitle: variant === 'fullscreen' ? 'Hero (Full screen)' : variant === 'product' ? 'Hero (Product)' : variant === 'ghost' ? 'Hero (Ghost)' : 'Hero (Category)',
    }),
  },
})
