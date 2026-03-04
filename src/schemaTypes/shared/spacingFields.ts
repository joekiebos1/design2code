import { defineField } from 'sanity'

const spacingOptions = {
  list: [
    { value: 'small', title: 'Small' },
    { value: 'medium', title: 'Medium' },
    { value: 'large', title: 'Large' },
  ],
  layout: 'radio' as const,
}

/** Padding above this block (paddingBlockStart). */
export const spacingTopField = defineField({
  name: 'spacingTop',
  type: 'string',
  title: 'Padding above',
  description: 'Space between this block and the one above.',
  options: spacingOptions,
  initialValue: 'large',
})

/** Padding below this block (paddingBlockEnd). */
export const spacingBottomField = defineField({
  name: 'spacingBottom',
  type: 'string',
  title: 'Padding below',
  description: 'Space between this block and the one below.',
  options: spacingOptions,
  initialValue: 'large',
})
