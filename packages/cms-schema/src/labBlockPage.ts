import { defineField, defineType } from 'sanity'

/**
 * Lab block page – one page per block type, showing all layout variants.
 * URL: /lab/[slug] (e.g. /lab/hero, /lab/full-bleed-vertical-carousel)
 */
export const labBlockPageType = defineType({
  name: 'labBlockPage',
  type: 'document',
  title: 'Lab block page',
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({
      name: 'slug',
      type: 'string',
      title: 'Slug',
      description: 'URL segment, e.g. hero, full-bleed-vertical-carousel',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Display name, e.g. Hero, Full bleed vertical carousel',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      type: 'labPageBuilder',
      title: 'Block variants',
      description: 'Add block variants to display on this page.',
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug' },
    prepare: ({ title, slug }) => ({
      title: title || 'Lab block page',
      subtitle: slug ? `/lab/${slug}` : undefined,
    }),
  },
})
