import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LabCarouselBlock } from './CarouselBlock'

const meta: Meta<typeof LabCarouselBlock> = {
  component: LabCarouselBlock,
  title: 'Blocks/Lab/LabCarouselBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LabCarouselBlock>

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

export const WithEyebrowTitleDescription: Story = {
  name: 'Eyebrow + title + description',
  args: {
    eyebrow: 'About us',
    title: 'Life is beautiful.',
    description: "World's Largest Mobile Data Network",
    cardSize: 'compact',
    emphasis: 'ghost',
    items,
  },
}
