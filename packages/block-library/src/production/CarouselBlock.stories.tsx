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
  { title: 'Card 1', description: 'Description', image: '/placeholder-preview.svg', cardType: 'mediaTextBelow' as const, aspectRatio: '4:5' as const },
  { title: 'Card 2', description: 'Description', image: '/placeholder-preview.svg', cardType: 'mediaTextBelow' as const, aspectRatio: '4:5' as const },
  { title: 'Card 3', description: 'Description', image: '/placeholder-preview.svg', cardType: 'mediaTextBelow' as const, aspectRatio: '4:5' as const },
]

export const Compact: Story = {
  args: {
    title: 'Carousel',
    cardSize: 'compact',
    emphasis: 'ghost',
    items,
  },
}

export const Medium: Story = {
  args: {
    title: 'Medium carousel',
    cardSize: 'medium',
    emphasis: 'ghost',
    items,
  },
}

export const Large: Story = {
  args: {
    title: 'Large carousel',
    cardSize: 'large',
    emphasis: 'ghost',
    items: items.map((i) => ({ ...i, aspectRatio: '2:1' as const })),
  },
}

export const WithFraming: Story = {
  args: {
    title: 'Carousel with framing',
    description: 'Description and CTAs above the track.',
    callToActions: [
      { label: 'View all', link: '/stories', style: 'filled' },
      { label: 'Compare', link: '/compare', style: 'outlined' },
    ],
    cardSize: 'medium',
    emphasis: 'ghost',
    items,
  },
}

export const ColourFeature: Story = {
  args: {
    title: 'Mixed media + large text on colour',
    cardSize: 'compact',
    emphasis: 'ghost',
    items: [
      { title: 'Media card', description: 'Image card', image: '/placeholder-preview.svg', cardType: 'mediaTextBelow' as const, aspectRatio: '4:5' as const },
      {
        title: 'Colour card',
        description: 'Large text on colour surface',
        cardType: 'colourFeatured' as const,
        backgroundColor: 'primary-bold',
      },
    ],
  },
}
