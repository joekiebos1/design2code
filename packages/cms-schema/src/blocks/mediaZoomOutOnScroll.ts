import { defineField, defineType } from 'sanity'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import {
  labBlockCallToActionsField,
  labBlockSectionDescriptionField,
  labBlockSectionTitleField,
} from '../shared/labBlockFramingFields'

/** Lab: MediaZoomOutOnScroll – Media starts zoomed in and full edge-to-edge; on scroll reduces to Default width */
export const mediaZoomOutOnScrollBlock = defineType({
  name: 'mediaZoomOutOnScroll',
  type: 'object',
  title: 'Media zoom out on scroll',
  description: 'Media starts full viewport + zoomed. On scroll, reduces to Default content width.',
  fields: [
    spacingTopField,
    spacingBottomField,
    labBlockSectionTitleField,
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    // Content (no layout or colour properties)
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
      title: 'Image URL',
      description: 'External URL fallback when no image uploaded',
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      title: 'Video URL',
      description: 'Optional. When set, video is shown (with poster from image).',
    }),
    defineField({
      name: 'alt',
      type: 'string',
      title: 'Alt text',
      description: 'Accessibility text for the image',
    }),
  ],
  preview: {
    select: { alt: 'alt', videoUrl: 'videoUrl' },
    prepare: ({ alt, videoUrl }) => {
      const inferredTitle = (alt || '').toString().trim() || 'Media zoom out on scroll'
      return {
        title: inferredTitle,
        subtitle: `Media zoom out on scroll · ${videoUrl ? 'Video' : 'Image'}`,
      }
    },
  },
})
