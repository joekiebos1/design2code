import { defineField } from 'sanity'

const spacingOptions = {
  list: [
    { value: 'none', title: 'No padding' },
    { value: 'medium', title: 'Medium padding' },
    { value: 'large', title: 'Large padding' },
  ],
  layout: 'radio' as const,
}

/** Padding above this block (paddingBlockStart). DS tokens: none=0, medium=3xl, large=4xl. */
export const spacingTopField = defineField({
  name: 'spacingTop',
  type: 'string',
  title: 'Padding above',
  description: 'Space between this block and the one above.',
  options: spacingOptions,
  initialValue: 'large',
})

/** Padding below this block (paddingBlockEnd). DS tokens: none=0, medium=3xl, large=4xl. */
export const spacingBottomField = defineField({
  name: 'spacingBottom',
  type: 'string',
  title: 'Padding below',
  description: 'Space between this block and the one below.',
  options: spacingOptions,
  initialValue: 'large',
})
