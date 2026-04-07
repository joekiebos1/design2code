import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CardGridBlock } from './CardGridBlock/CardGridBlock'

const meta: Meta<typeof CardGridBlock> = {
  component: CardGridBlock,
  title: 'Blocks/Production/CardGridBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof CardGridBlock>

const items = [
  { title: 'Card 1', description: 'Description', image: '/placeholder-preview.svg', cardType: 'mediaTextBelow' as const },
  { title: 'Card 2', description: 'Description', image: '/placeholder-preview.svg', cardType: 'mediaTextBelow' as const },
  { title: 'Card 3', description: 'Description', image: '/placeholder-preview.svg', cardType: 'mediaTextBelow' as const },
]

export const MediaDescriptionBelow: Story = {
  args: {
    title: 'Media + description below',
    columns: 3,
    emphasis: 'ghost',
    items,
  },
}

export const MediaOverlay: Story = {
  args: {
    title: 'Text overlay on media',
    columns: 3,
    emphasis: 'ghost',
    items: items.map((i) => ({ ...i, cardType: 'mediaTextOverlay' as const })),
  },
}

export const MixedCardTypes: Story = {
  args: {
    title: 'Mixed media card types',
    columns: 2,
    emphasis: 'ghost',
    items: [
      { ...items[0], cardType: 'mediaTextBelow' as const },
      { ...items[1], cardType: 'mediaTextOverlay' as const },
    ],
  },
}

export const Layout2Columns: Story = {
  args: { ...MediaDescriptionBelow.args, title: '2 columns', columns: 2 },
}

export const Layout4Columns: Story = {
  args: {
    ...MediaDescriptionBelow.args,
    title: '4 columns',
    columns: 4,
    items: [...items, { ...items[0], title: 'Card 4', cardType: 'mediaTextBelow' as const }],
  },
}
