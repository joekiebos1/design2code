import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { IconPickerInput } from '../components/sanity/IconPickerInput'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { appearanceField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import {
  labBlockCallToActionsField,
  labBlockSectionDescriptionField,
} from '../shared/labBlockFramingFields'

export const labProofPointsBlock = defineType({
  name: 'labProofPoints',
  type: 'object',
  title: 'Proof Points',
  description: 'Text + icon strip for top reasons to believe. Often used at the top of a page.',
  fields: [
    spacingTopField,
    spacingBottomField,
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Variant',
      description: 'Icon = icon + text per item. Stat = large statistic + label, no icons, with dividers.',
      options: {
        list: [
          { value: 'icon', title: 'Icon (default)' },
          { value: 'stat', title: 'Statistics' },
        ],
        layout: 'radio',
      },
      initialValue: 'icon',
    }),
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
      name: 'title',
      type: 'text',
      title: 'Section Title',
      rows: 2,
      description: 'Optional heading above the proof points. Press Enter for a line break.',
    }),
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Proof Points',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'text', title: 'Title', rows: 2, validation: (Rule) => Rule.required() },
            { name: 'description', type: 'text', title: 'Description', rows: 2 },
            {
              name: 'icon',
              type: 'string',
              title: 'Icon',
              components: {
                input: IconPickerInput,
              },
              initialValue: 'IcMobile',
            },
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: title || 'Proof point' }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', variant: 'variant', items: 'items' },
    prepare: ({ title, variant, items }) => {
      const inferredTitle = (title || '').toString().trim() || 'Proof Points'
      return {
        title: inferredTitle,
        subtitle: `Proof Points · ${variant ?? 'icon'} · ${items?.length ?? 0} item(s)`,
      }
    },
  },
})
