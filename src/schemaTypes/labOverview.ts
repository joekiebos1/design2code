import { BulbOutlineIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * Lab overview – singleton for /lab page content.
 * Holds the overview page with a List block (links variant) linking to each lab block page.
 */
export const labOverviewType = defineType({
  name: 'labOverview',
  type: 'document',
  title: 'Lab overview',
  icon: BulbOutlineIcon,
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({
      name: 'sections',
      type: 'labPageBuilder',
      title: 'Sections',
      description: 'Blocks for the /lab overview page. Typically a List block (links variant) with links to each lab block page.',
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Lab overview',
      subtitle: '/lab',
    }),
  },
})
