import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FullBleedVerticalCarousel } from './FullBleedVerticalCarousel'

const meta: Meta<typeof FullBleedVerticalCarousel> = {
  component: FullBleedVerticalCarousel,
  title: 'Blocks/Lab/FullBleedVerticalCarousel',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof FullBleedVerticalCarousel>

const items = [
  { title: 'Story 1', description: 'First story description.', image: '/placeholder-preview.svg' },
  { title: 'Story 2', description: 'Second story description.', image: '/placeholder-preview.svg' },
  { title: 'Story 3', description: 'Third story description.', image: '/placeholder-preview.svg' },
]

export const Default: Story = {
  args: {
    emphasis: 'ghost',
    items,
  },
}

export const Bold: Story = {
  args: {
    emphasis: 'bold',
    items,
  },
}
