import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RotatingMediaBlock } from './RotatingMediaBlock/RotatingMediaBlock'

const meta: Meta<typeof RotatingMediaBlock> = {
  component: RotatingMediaBlock,
  title: 'Blocks/Lab/RotatingMediaBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof RotatingMediaBlock>

const items = [
  { image: '/placeholder-preview.svg', title: 'Card 1', label: 'Label 1' },
  { image: '/placeholder-preview.svg', title: 'Card 2', label: 'Label 2' },
  { image: '/placeholder-preview.svg', title: 'Card 3', label: 'Label 3' },
  { image: '/placeholder-preview.svg', title: 'Card 4', label: 'Label 4' },
]

export const Small: Story = {
  args: {
    variant: 'small',
    surface: 'ghost',
    items,
  },
}

export const Large: Story = {
  args: {
    variant: 'large',
    surface: 'ghost',
    items,
  },
}

export const Combined: Story = {
  args: {
    variant: 'combined',
    surface: 'ghost',
    items,
  },
}
