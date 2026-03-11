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
  { title: 'Card 1', description: 'Description', image: '/placeholder-preview.svg', cardStyle: 'image-above' as const },
  { title: 'Card 2', description: 'Description', image: '/placeholder-preview.svg', cardStyle: 'image-above' as const },
  { title: 'Card 3', description: 'Description', image: '/placeholder-preview.svg', cardStyle: 'image-above' as const },
]

export const ImageAbove: Story = {
  args: {
    title: 'Card grid',
    columns: 3,
    blockSurface: 'ghost',
    items,
  },
}

export const TextOnColour: Story = {
  args: {
    title: 'Text on colour cards',
    columns: 3,
    blockSurface: 'bold',
    items: items.map((i) => ({ ...i, cardStyle: 'text-on-colour' as const })),
  },
}

export const TextOnImage: Story = {
  args: {
    title: 'Text on image cards',
    columns: 3,
    blockSurface: 'ghost',
    items: items.map((i) => ({ ...i, cardStyle: 'text-on-image' as const })),
  },
}
