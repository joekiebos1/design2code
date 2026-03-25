import { defineField, defineType } from 'sanity'
import { DS_THEMES, DS_THEME_DEFAULT } from '../shared/dsThemes'
import { spacingTopField, spacingBottomField } from '../shared/spacingFields'
import { surfaceColourField, emphasisField } from '../shared/blockColourFields'
import { minimalBackgroundStyleField } from '../shared/minimalBackgroundStyleField'
import {
  labBlockCallToActionsField,
  labBlockSectionDescriptionField,
  labBlockSectionTitleField,
} from '../shared/labBlockFramingFields'

const ICON_OPTIONS = [
  { value: 'IcWifiNetwork', title: 'Wifi / Connectivity' },
  { value: 'IcHome', title: 'Home' },
  { value: 'IcEntertainment', title: 'Entertainment' },
  { value: 'IcEntertainmentPlay', title: 'Entertainment (play)' },
  { value: 'IcWallet', title: 'Wallet / Finance' },
  { value: 'IcMoneybag', title: 'Money' },
  { value: 'IcPayment', title: 'Payment' },
  { value: 'IcShopping', title: 'Shopping' },
  { value: 'IcShoppingBag', title: 'Shopping bag' },
  { value: 'IcBusinessman', title: 'Business' },
  { value: 'IcWork', title: 'Work' },
  { value: 'IcHealthy', title: 'Health' },
  { value: 'IcHealthProtection', title: 'Health protection' },
  { value: 'IcEducation', title: 'Education' },
  { value: 'IcSeedling', title: 'Agriculture / Seedling' },
  { value: 'IcPlantGrowth', title: 'Plant growth' },
  { value: 'IcEnergyTotal', title: 'Energy' },
  { value: 'IcEnergyOthers', title: 'Energy (alt)' },
  { value: 'IcCarSide', title: 'Transport / Car' },
  { value: 'IcBusFront', title: 'Bus' },
  { value: 'IcCity', title: 'Government / City' },
  { value: 'IcFort', title: 'Fort' },
  { value: 'IcGlobe', title: 'Globe' },
  { value: 'IcComputer', title: 'Computer' },
]

export const iconGridItem = defineType({
  name: 'iconGridItem',
  type: 'object',
  title: 'Icon grid item',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'text',
      title: 'Body (optional)',
      rows: 2,
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Icon',
      options: {
        list: ICON_OPTIONS,
        layout: 'dropdown',
      },
      initialValue: 'IcGlobe',
    }),
    defineField({
      name: 'accentColor',
      type: 'string',
      title: 'Accent colour',
      options: {
        list: [
          { value: 'primary', title: 'Primary' },
          { value: 'secondary', title: 'Secondary' },
          { value: 'tertiary', title: 'Tertiary' },
          { value: 'positive', title: 'Positive' },
          { value: 'neutral', title: 'Neutral' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'spectrum',
      type: 'string',
      title: 'Jio colour spectrum',
      description: 'Official spectrum (primary shade). Overrides accent colour when set.',
      options: {
        list: [
          { value: 'indigo', title: 'Indigo' },
          { value: 'sky', title: 'Sky' },
          { value: 'pink', title: 'Pink' },
          { value: 'gold', title: 'Gold' },
          { value: 'red', title: 'Red' },
          { value: 'purple', title: 'Purple' },
          { value: 'mint', title: 'Mint' },
          { value: 'violet', title: 'Violet' },
          { value: 'marigold', title: 'Marigold' },
          { value: 'green', title: 'Green' },
          { value: 'crimson', title: 'Crimson' },
          { value: 'orange', title: 'Orange' },
        ],
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    select: { title: 'title', icon: 'icon' },
    prepare: ({ title, icon }) => ({
      title: title || 'Icon item',
      subtitle: icon ? `Icon: ${icon}` : undefined,
    }),
  },
})

export const iconGridBlock = defineType({
  name: 'iconGrid',
  type: 'object',
  title: 'Icon grid',
  description: 'Grid of icons with titles. 3–6 columns depending on item count. Icons are not clickable.',
  fields: [
    spacingTopField,
    spacingBottomField,
    // Layout
    defineField({
      name: 'columns',
      type: 'number',
      title: 'Columns',
      description: '3, 4, 5, or 6. Leave empty to auto-derive from item count.',
      options: {
        list: [
          { value: 3, title: '3 columns' },
          { value: 4, title: '4 columns' },
          { value: 5, title: '5 columns' },
          { value: 6, title: '6 columns' },
        ],
        layout: 'radio',
      },
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
    surfaceColourField(),
    emphasisField(),
    minimalBackgroundStyleField('emphasis'),
    // Content
    labBlockSectionTitleField,
    labBlockSectionDescriptionField,
    labBlockCallToActionsField,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      of: [{ type: 'iconGridItem' }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Add at least one item'),
    }),
  ],
  preview: {
    select: { 'firstItemTitle': 'items.0.title', items: 'items', columns: 'columns' },
    prepare: ({ firstItemTitle, items, columns }) => {
      const inferredTitle = (firstItemTitle || '').toString().trim() || 'Icon grid'
      const settings = `${items?.length ?? 0} item(s)${columns ? ` · ${columns} cols` : ''}`
      return {
        title: inferredTitle,
        subtitle: `Icon grid · ${settings}`,
      }
    },
  },
})
