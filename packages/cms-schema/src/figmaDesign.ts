import { ComponentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * Figma2Code staging documents: same block types as Pages, keyed from Figma
 * “DotCom Beta - {Block name}” instances. See `lib/figma/figma-block-map.ts`.
 * Studio: Content → Figma2Code. Site: `/figma2code/{slug}`.
 */
export const figmaDesignType = defineType({
  name: 'figmaDesign',
  title: 'Figma2Code',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Design or frame name (e.g. matching the Figma page).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'Path segment for `/figma2code/{slug}` on the site. Copy sections into a Page when promoting.',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'figmaFileUrl',
      type: 'url',
      title: 'Figma file URL',
      description: 'Link to the Figma file or frame for traceability.',
    }),
    defineField({
      name: 'sections',
      type: 'pageBuilder',
      title: 'Page sections',
      description:
        'Production block types only. Figma component names use the prefix “DotCom Beta - ” (e.g. DotCom Beta - Hero → Hero block).',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
})
