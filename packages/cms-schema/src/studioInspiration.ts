import { StarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * Studio (figma2code) inspiration entries: Benchmarks vs Jio Designs.
 * Single media slot: PNG or MP4 in Sanity (file asset).
 */
export const studioInspirationType = defineType({
  name: 'studioInspiration',
  title: 'Studio inspiration',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'inspirationType',
      title: 'Tool',
      type: 'string',
      options: {
        list: [
          { title: 'Benchmarks', value: 'benchmark' },
          { title: 'Jio Designs', value: 'jioDesign' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'media',
      title: 'Media',
      description: 'PNG still or MP4 video (max 30 MB from the Studio app upload).',
      type: 'file',
      options: {
        accept: 'image/png,video/mp4',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      description: 'Benchmarks: page URL. Jio Designs: Figma file URL (https).',
      type: 'url',
      validation: (Rule) =>
        Rule.required().uri({
          allowRelative: false,
          scheme: ['http', 'https'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      inspirationType: 'inspirationType',
      media: 'media',
    },
    prepare({ title, inspirationType, media }) {
      return {
        title: title || 'Untitled',
        subtitle: inspirationType === 'jioDesign' ? 'Jio Designs' : 'Benchmarks',
        media,
      }
    },
  },
})
