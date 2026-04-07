import { defineField } from 'sanity'

/**
 * Minimal background style: block (solid) or gradient (white to minimal).
 * Only shown when emphasis is 'minimal'.
 */
export function minimalBackgroundStyleField(emphasisFieldName: 'emphasis' = 'emphasis') {
  return defineField({
    name: 'minimalBackgroundStyle',
    type: 'string',
    title: 'Minimal background',
    description: 'Block = solid colour. Gradient = white fading to minimal.',
    options: {
      list: [
        { value: 'block', title: 'Block (solid)' },
        { value: 'gradient', title: 'Gradient (white to minimal)' },
      ],
      layout: 'radio',
    },
    initialValue: 'block',
    hidden: ({ parent }) => (parent as Record<string, string>)?.[emphasisFieldName] !== 'minimal',
  })
}
