import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { IconPickerInput } from '../../components/IconPickerInput'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'

export const proofPointsBlock = defineType({
  name: 'proofPoints',
  type: 'object',
  title: 'Proof Points',
  description: 'Text + icon strip for top reasons to believe. Often used at the top of a page.',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
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
      title: 'Section Title',
      rows: 2,
      description: 'Optional heading above the proof points. Press Enter for a line break.',
    }),
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
