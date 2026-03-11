import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CarouselBlock } from './CarouselBlock'

const meta: Meta<typeof CarouselBlock> = {
  component: CarouselBlock,
  title: 'Blocks/Production/CarouselBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof CarouselBlock>

const items = [
  { title: 'Card 1', description: 'Description', image: '/placeholder-preview.svg', cardType: 'media' as const, aspectRatio: '4:5' as const },
  { title: 'Card 2', description: 'Description', image: '/placeholder-preview.svg', cardType: 'media' as const, aspectRatio: '4:5' as const },
  { title: 'Card 3', description: 'Description', image: '/placeholder-preview.svg', cardType: 'media' as const, aspectRatio: '4:5' as const },
]

export const Compact: Story = {
  args: {
    title: 'Carousel',
    cardSize: 'compact',
    surface: 'ghost',
    items,
  },
}

export const Medium: Story = {
  args: {
    title: 'Medium carousel',
    cardSize: 'medium',
    surface: 'ghost',
    items,
  },
}

export const Large: Story = {
  args: {
    title: 'Large carousel',
    cardSize: 'large',
    surface: 'ghost',
    items: items.map((i) => ({ ...i, aspectRatio: '2:1' as const })),
  },
}
