import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LabRotatingMediaBlock } from './RotatingMediaBlock'

const meta: Meta<typeof LabRotatingMediaBlock> = {
  component: LabRotatingMediaBlock,
  title: 'Blocks/Lab/RotatingMediaBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LabRotatingMediaBlock>

const items = [
  { image: '/placeholder-preview.svg', title: 'Card 1', label: 'Label 1' },
  { image: '/placeholder-preview.svg', title: 'Card 2', label: 'Label 2' },
  { image: '/placeholder-preview.svg', title: 'Card 3', label: 'Label 3' },
  { image: '/placeholder-preview.svg', title: 'Card 4', label: 'Label 4' },
]

export const Small: Story = {
  args: {
    variant: 'small',
    emphasis: 'ghost',
    items,
  },
}

export const Large: Story = {
  args: {
    variant: 'large',
    emphasis: 'ghost',
    items,
  },
}

export const Combined: Story = {
  args: {
    variant: 'combined',
    emphasis: 'ghost',
    items,
  },
}
